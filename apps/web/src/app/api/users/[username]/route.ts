import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/users/[username]
 * Get user profile by username
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;
    const supabase = createClient();

    // Get the current user (optional, for checking follow status)
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select(
        `
        id,
        username,
        email,
        tier,
        is_creator,
        is_verified,
        is_premium_creator,
        bio,
        avatar_url,
        banner_url,
        location,
        website,
        twitter_handle,
        discord_handle,
        telegram_handle,
        trading_style,
        favorite_markets,
        years_experience,
        followers_count,
        following_count,
        signal_count,
        subscriber_count,
        profile_views,
        created_at,
        last_active_at
      `
      )
      .eq('username', username)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if current user is following this profile
    let isFollowing = false;
    if (currentUser && currentUser.id !== profile.id) {
      const { data: followData } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', currentUser.id)
        .eq('following_id', profile.id)
        .single();

      isFollowing = !!followData;
    }

    // Get user stats
    const { data: stats } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', profile.id)
      .single();

    // Track profile view (don't await, run async)
    if (currentUser?.id !== profile.id) {
      // Only track if not viewing own profile
      const viewerIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');

      supabase
        .from('profile_views')
        .insert({
          profile_user_id: profile.id,
          viewer_user_id: currentUser?.id || null,
          viewer_ip: viewerIp,
        })
        .then(() => {})
        .catch(() => {});
    }

    return NextResponse.json({
      profile: {
        ...profile,
        isFollowing,
      },
      stats: stats || null,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
