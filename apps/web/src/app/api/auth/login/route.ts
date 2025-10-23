import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { LoginRequest, LoginResponse } from '@tradosphere/types/api';

/**
 * POST /api/auth/login
 * Authenticate user with email and password
 */
export async function POST(req: NextRequest) {
  try {
    const body: LoginRequest = await req.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email and password are required',
        },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Sign in with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return NextResponse.json(
        {
          success: false,
          error: authError.message,
        },
        { status: 401 },
      );
    }

    if (!authData.user || !authData.session) {
      return NextResponse.json(
        {
          success: false,
          error: 'Login failed',
        },
        { status: 401 },
      );
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id, email, username, tier, is_creator')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
    }

    const response: LoginResponse = {
      success: true,
      data: {
        user: {
          id: authData.user.id,
          email: authData.user.email!,
          username: profile?.username || '',
        },
        session: {
          accessToken: authData.session.access_token,
          refreshToken: authData.session.refresh_token,
          expiresAt: authData.session.expires_at || 0,
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Login error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      },
      { status: 500 },
    );
  }
}
