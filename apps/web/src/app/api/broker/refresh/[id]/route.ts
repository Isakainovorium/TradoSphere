import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  refreshAccessToken,
  encryptToken,
  decryptToken,
} from '@/lib/broker/oauth';

/**
 * POST /api/broker/refresh/[id]
 * Manually refresh OAuth access token using refresh token
 */
export async function POST(
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
      .select('id, broker_name, user_id, connection_status')
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

    // Get OAuth tokens
    const { data: tokenData, error: tokenError } = await supabase
      .from('broker_oauth_tokens')
      .select('refresh_token_encrypted')
      .eq('connection_id', id)
      .single();

    if (tokenError || !tokenData || !tokenData.refresh_token_encrypted) {
      return NextResponse.json(
        { error: 'Refresh token not found' },
        { status: 404 }
      );
    }

    // Decrypt refresh token
    let refreshToken;
    try {
      refreshToken = decryptToken(tokenData.refresh_token_encrypted);
    } catch (decryptError) {
      console.error('Error decrypting refresh token:', decryptError);
      return NextResponse.json(
        { error: 'Failed to decrypt refresh token' },
        { status: 500 }
      );
    }

    // Refresh the access token
    let newTokenResponse;
    try {
      newTokenResponse = await refreshAccessToken(
        connection.broker_name,
        refreshToken
      );
    } catch (refreshError: any) {
      console.error('Token refresh failed:', refreshError);

      // Update connection with error
      await supabase
        .from('broker_connections')
        .update({
          connection_status: 'expired',
          error_message: `Token refresh failed: ${refreshError.message}`,
        })
        .eq('id', id);

      return NextResponse.json(
        { error: 'Failed to refresh token. Please reconnect your broker.' },
        { status: 400 }
      );
    }

    // Encrypt new tokens
    const encryptedAccessToken = encryptToken(newTokenResponse.access_token);
    const encryptedRefreshToken = newTokenResponse.refresh_token
      ? encryptToken(newTokenResponse.refresh_token)
      : tokenData.refresh_token_encrypted; // Keep old refresh token if new one not provided

    // Calculate new expiration
    const accessTokenExpiresAt = new Date(
      Date.now() + newTokenResponse.expires_in * 1000
    );

    // Update tokens
    const { error: updateError } = await supabase
      .from('broker_oauth_tokens')
      .update({
        access_token_encrypted: encryptedAccessToken,
        refresh_token_encrypted: encryptedRefreshToken,
        access_token_expires_at: accessTokenExpiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('connection_id', id);

    if (updateError) {
      console.error('Error updating tokens:', updateError);
      return NextResponse.json(
        { error: 'Failed to update tokens' },
        { status: 500 }
      );
    }

    // Update connection status
    await supabase
      .from('broker_connections')
      .update({
        connection_status: 'connected',
        error_message: null,
        expires_at: accessTokenExpiresAt.toISOString(),
      })
      .eq('id', id);

    return NextResponse.json({
      success: true,
      message: 'Token refreshed successfully',
      expiresAt: accessTokenExpiresAt.toISOString(),
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
