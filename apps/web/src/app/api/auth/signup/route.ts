import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { SignupRequest, SignupResponse } from '@tradosphere/types/api';

/**
 * POST /api/auth/signup
 * Register a new user account
 */
export async function POST(req: NextRequest) {
  try {
    const body: SignupRequest = await req.json();
    const { email, password, username } = body;

    // Validate required fields
    if (!email || !password || !username) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email, password, and username are required',
        },
        { status: 400 },
      );
    }

    // Validate username format (alphanumeric, 3-20 chars)
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Username must be 3-20 characters (letters, numbers, underscores only)',
        },
        { status: 400 },
      );
    }

    // Validate password strength (min 8 chars)
    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: 'Password must be at least 8 characters',
        },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Check if username is taken
    const { data: existingUser } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .single();

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'Username is already taken',
        },
        { status: 409 },
      );
    }

    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });

    if (authError) {
      return NextResponse.json(
        {
          success: false,
          error: authError.message,
        },
        { status: 400 },
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Signup failed',
        },
        { status: 500 },
      );
    }

    // Create user profile in database
    const { error: profileError } = await supabase.from('users').insert({
      id: authData.user.id,
      email,
      username,
      tier: 'free',
      is_creator: false,
    });

    if (profileError) {
      console.error('Error creating profile:', profileError);

      // Cleanup: Delete auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create user profile',
        },
        { status: 500 },
      );
    }

    const response: SignupResponse = {
      success: true,
      data: {
        user: {
          id: authData.user.id,
          email: authData.user.email!,
          username,
        },
        message: 'Account created successfully. Please check your email to verify your account.',
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Signup error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Signup failed',
      },
      { status: 500 },
    );
  }
}
