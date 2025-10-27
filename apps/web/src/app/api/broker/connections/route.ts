import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/broker/connections
 * Get all broker connections for the current user
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch connections with account summary
    const { data: connections, error: connectionsError } = await supabase
      .from('broker_connections')
      .select(
        `
        id,
        broker_name,
        connection_status,
        broker_account_name,
        is_paper_trading,
        is_primary_broker,
        connected_at,
        last_synced_at,
        expires_at,
        error_message,
        broker_accounts (
          id,
          account_name,
          account_type,
          balance,
          currency,
          is_active
        )
      `
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (connectionsError) {
      console.error('Error fetching connections:', connectionsError);
      return NextResponse.json(
        { error: 'Failed to fetch connections' },
        { status: 500 }
      );
    }

    // Transform data for client
    const formattedConnections = connections.map((conn) => ({
      id: conn.id,
      brokerName: conn.broker_name,
      status: conn.connection_status,
      accountName: conn.broker_account_name,
      isPaper: conn.is_paper_trading,
      isPrimary: conn.is_primary_broker,
      connectedAt: conn.connected_at,
      lastSyncedAt: conn.last_synced_at,
      expiresAt: conn.expires_at,
      errorMessage: conn.error_message,
      accounts: conn.broker_accounts || [],
    }));

    return NextResponse.json({ connections: formattedConnections });
  } catch (error) {
    console.error('Error fetching broker connections:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
