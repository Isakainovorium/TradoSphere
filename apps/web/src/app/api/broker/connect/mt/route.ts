import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { encryptToken } from '@/lib/broker/oauth';
import { z } from 'zod';

const mtConnectionSchema = z.object({
  platform: z.enum(['mt4', 'mt5']),
  serverAddress: z.string().min(1, 'Server address is required'),
  accountNumber: z.string().min(1, 'Account number is required'),
  password: z.string().min(1, 'Password is required'),
  investorPassword: z.string().optional(),
  isRealAccount: z.boolean().default(true),
});

/**
 * POST /api/broker/connect/mt
 * Connect MT4/MT5 account using encrypted credentials
 */
export async function POST(req: NextRequest) {
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

    // Parse and validate request body
    const body = await req.json();
    const validationResult = mtConnectionSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const {
      platform,
      serverAddress,
      accountNumber,
      password,
      investorPassword,
      isRealAccount,
    } = validationResult.data;

    // Encrypt all credentials before storing
    const serverAddressEncrypted = encryptToken(serverAddress);
    const accountNumberEncrypted = encryptToken(accountNumber);
    const passwordEncrypted = encryptToken(password);
    const investorPasswordEncrypted = investorPassword
      ? encryptToken(investorPassword)
      : null;

    // Create or update connection
    const { data: connection, error: connectionError } = await supabase
      .from('broker_connections')
      .upsert(
        {
          user_id: user.id,
          broker_name: platform,
          auth_type: 'credentials',
          connection_status: 'pending',
          is_paper_trading: !isRealAccount,
          broker_account_id: accountNumber,
          broker_account_name: `${platform.toUpperCase()} #${accountNumber}`,
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
        { error: 'Failed to create connection' },
        { status: 500 }
      );
    }

    // Store encrypted credentials
    const { error: credentialsError } = await supabase
      .from('broker_credentials')
      .upsert(
        {
          connection_id: connection.id,
          server_address_encrypted: serverAddressEncrypted,
          account_number_encrypted: accountNumberEncrypted,
          password_encrypted: passwordEncrypted,
          investor_password_encrypted: investorPasswordEncrypted,
          platform_version: platform,
          is_real_account: isRealAccount,
        },
        {
          onConflict: 'connection_id',
        }
      );

    if (credentialsError) {
      console.error('Error storing credentials:', credentialsError);
      return NextResponse.json(
        { error: 'Failed to store credentials' },
        { status: 500 }
      );
    }

    // TODO: Test connection to MT4/MT5 server
    // This would involve connecting to the MT4/MT5 server with provided credentials
    // and verifying they work. For now, we'll mark as connected.

    // Update connection status to connected
    await supabase
      .from('broker_connections')
      .update({
        connection_status: 'connected',
        connected_at: new Date().toISOString(),
      })
      .eq('id', connection.id);

    // Initialize connection health tracking
    await supabase.from('mt_connection_health').upsert(
      {
        connection_id: connection.id,
        is_connected: true,
        last_ping_at: new Date().toISOString(),
        last_heartbeat_at: new Date().toISOString(),
      },
      {
        onConflict: 'connection_id',
      }
    );

    return NextResponse.json({
      success: true,
      connectionId: connection.id,
      message: `${platform.toUpperCase()} account connected successfully`,
    });
  } catch (error) {
    console.error('Error connecting MT account:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
