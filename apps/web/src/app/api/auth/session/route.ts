import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/auth/session
 * Get current user session and profile
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      return NextResponse.json(
        {
          success: false,
          error: sessionError.message,
        },
        { status: 401 },
      );
    }

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not authenticated',
        },
        { status: 401 },
      );
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id, email, username, tier, is_creator, created_at')
      .eq('id', session.user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch user profile',
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: session.user.id,
          email: session.user.email!,
          username: profile.username,
        },
        profile: {
          tier: profile.tier,
          isCreator: profile.is_creator,
          createdAt: profile.created_at,
        },
        session: {
          accessToken: session.access_token,
          expiresAt: session.expires_at || 0,
        },
      },
    });
  } catch (error) {
    console.error('Session error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get session',
      },
      { status: 500 },
    );
  }
}
