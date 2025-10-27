import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * DELETE /api/broker/disconnect/[id]
 * Disconnect a broker and revoke OAuth tokens
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const supabase = createClient();

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify connection belongs to user
    const { data: connection, error: connectionError } = await supabase
      .from('broker_connections')
      .select('id, broker_name, user_id')
      .eq('id', id)
      .single();

    if (connectionError || !connection) {
      return NextResponse.json(
        { error: 'Connection not found' },
        { status: 404 }
      );
    }

    if (connection.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // TODO: Call broker's token revocation endpoint if available
    // This would be broker-specific implementation

    // Delete OAuth tokens (cascade will handle this via FK constraint)
    // But let's be explicit
    await supabase
      .from('broker_oauth_tokens')
      .delete()
      .eq('connection_id', id);

    // Update connection status to disconnected (or delete entirely)
    const { error: updateError } = await supabase
      .from('broker_connections')
      .update({
        connection_status: 'disconnected',
        oauth_state: null,
        oauth_code_verifier: null,
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error disconnecting broker:', updateError);
      return NextResponse.json(
        { error: 'Failed to disconnect broker' },
        { status: 500 }
      );
    }

    // Log the disconnection
    await supabase.from('broker_sync_logs').insert({
      connection_id: id,
      sync_type: 'disconnect',
      sync_status: 'success',
      items_synced: 0,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Broker disconnected successfully',
    });
  } catch (error) {
    console.error('Error disconnecting broker:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
