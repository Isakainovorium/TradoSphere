import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  exchangeCodeForToken,
  encryptToken,
  validateState,
} from '@/lib/broker/oauth';

/**
 * GET /api/broker/callback/[broker]
 * OAuth callback handler - receives authorization code and exchanges for access token
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { broker: string } }
) {
  try {
    const { broker } = params;
    const { searchParams } = new URL(req.url);

    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Handle OAuth errors from broker
    if (error) {
      console.error(`OAuth error from ${broker}:`, error, errorDescription);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/broker?error=${error}&description=${errorDescription}`
      );
    }

    // Validate required parameters
    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/broker?error=invalid_callback`
      );
    }

    const supabase = createClient();

    // Get user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/login?redirect=/broker`
      );
    }

    // Find pending connection with matching state
    const { data: connection, error: connectionError } = await supabase
      .from('broker_connections')
      .select('id, oauth_state, oauth_code_verifier')
      .eq('user_id', user.id)
      .eq('broker_name', broker)
      .eq('connection_status', 'pending')
      .single();

    if (connectionError || !connection) {
      console.error('Connection not found:', connectionError);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/broker?error=connection_not_found`
      );
    }

    // Validate state to prevent CSRF
    if (!validateState(connection.oauth_state, state)) {
      console.error('State validation failed - possible CSRF attack');
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/broker?error=invalid_state`
      );
    }

    // Exchange authorization code for access token
    let tokenResponse;
    try {
      tokenResponse = await exchangeCodeForToken(
        broker,
        code,
        connection.oauth_code_verifier
      );
    } catch (tokenError) {
      console.error('Token exchange failed:', tokenError);

      // Update connection with error
      await supabase
        .from('broker_connections')
        .update({
          connection_status: 'error',
          error_message: `Token exchange failed: ${tokenError}`,
          retry_count: 1,
        })
        .eq('id', connection.id);

      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/broker?error=token_exchange_failed`
      );
    }

    // Encrypt tokens before storing
    const encryptedAccessToken = encryptToken(tokenResponse.access_token);
    const encryptedRefreshToken = tokenResponse.refresh_token
      ? encryptToken(tokenResponse.refresh_token)
      : null;

    // Calculate token expiration
    const accessTokenExpiresAt = new Date(
      Date.now() + tokenResponse.expires_in * 1000
    );

    // Store encrypted tokens
    const { error: tokenStoreError } = await supabase
      .from('broker_oauth_tokens')
      .upsert(
        {
          connection_id: connection.id,
          access_token_encrypted: encryptedAccessToken,
          refresh_token_encrypted: encryptedRefreshToken,
          token_type: tokenResponse.token_type || 'Bearer',
          access_token_expires_at: accessTokenExpiresAt.toISOString(),
          scopes: tokenResponse.scope ? tokenResponse.scope.split(' ') : [],
        },
        {
          onConflict: 'connection_id',
        }
      );

    if (tokenStoreError) {
      console.error('Error storing tokens:', tokenStoreError);

      await supabase
        .from('broker_connections')
        .update({
          connection_status: 'error',
          error_message: 'Failed to store tokens securely',
        })
        .eq('id', connection.id);

      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/broker?error=token_storage_failed`
      );
    }

    // Update connection status to connected
    await supabase
      .from('broker_connections')
      .update({
        connection_status: 'connected',
        connected_at: new Date().toISOString(),
        oauth_state: null, // Clear state after use
        error_message: null,
        retry_count: 0,
      })
      .eq('id', connection.id);

    // TODO: Initiate initial sync of accounts, positions, and orders
    // This would be done in a background job or separate API call

    // Redirect to broker dashboard with success
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/broker?success=true&broker=${broker}`
    );
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/broker?error=callback_failed`
    );
  }
}
