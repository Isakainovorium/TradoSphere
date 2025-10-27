import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  buildAuthorizationUrl,
  generateCodeVerifier,
  generateState,
  BROKER_CONFIGS,
} from '@/lib/broker/oauth';

/**
 * POST /api/broker/connect/[broker]
 * Initiate OAuth 2.0 flow with PKCE for broker connection
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { broker: string } }
) {
  try {
    const { broker } = params;
    const supabase = createClient();

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate broker
    if (!BROKER_CONFIGS[broker]) {
      return NextResponse.json(
        { error: 'Invalid broker name' },
        { status: 400 }
      );
    }

    // Generate OAuth security tokens
    const state = generateState();
    const codeVerifier = generateCodeVerifier();

    // Create pending connection record
    const { data: connection, error: connectionError } = await supabase
      .from('broker_connections')
      .upsert(
        {
          user_id: user.id,
          broker_name: broker,
          connection_status: 'pending',
          oauth_state: state,
          oauth_code_verifier: codeVerifier,
        },
        {
          onConflict: 'user_id,broker_name',
        }
      )
      .select('id')
      .single();

    if (connectionError || !connection) {
      console.error('Error creating connection:', connectionError);
      return NextResponse.json(
        { error: 'Failed to initiate connection' },
        { status: 500 }
      );
    }

    // Build authorization URL with PKCE
    const authUrl = buildAuthorizationUrl(broker, state, codeVerifier);

    return NextResponse.json({
      authorizationUrl: authUrl,
      connectionId: connection.id,
      message: 'Redirect user to authorization URL',
    });
  } catch (error) {
    console.error('Error initiating broker connection:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
