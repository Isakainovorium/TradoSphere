import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const updateProfileSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/).optional(),
  bio: z.string().max(500).optional(),
  avatar_url: z.string().url().optional().nullable(),
  banner_url: z.string().url().optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  website: z.string().url().optional().nullable(),
  twitter_handle: z.string().max(50).optional().nullable(),
  discord_handle: z.string().max(50).optional().nullable(),
  telegram_handle: z.string().max(50).optional().nullable(),
  trading_style: z
    .enum(['day_trader', 'swing_trader', 'scalper', 'position_trader'])
    .optional()
    .nullable(),
  favorite_markets: z.array(z.string()).optional().nullable(),
  years_experience: z.number().int().min(0).max(50).optional().nullable(),
});

/**
 * PUT /api/users/profile
 * Update current user's profile
 */
export async function PUT(req: NextRequest) {
  try {
    const supabase = createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await req.json();
    const validationResult = updateProfileSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const updates = validationResult.data;

    // Check if username is already taken (if username is being updated)
    if (updates.username) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', updates.username)
        .neq('id', user.id)
        .single();

      if (existingUser) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 400 }
        );
      }
    }

    // Update user profile
    const { data: updatedProfile, error: updateError } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select(
        `
        id,
        username,
        email,
        tier,
        is_creator,
        is_verified,
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
        updated_at
      `
      )
      .single();

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({ profile: updatedProfile });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/users/profile
 * Get current user's profile
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
        last_active_at,
        updated_at
      `
      )
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Get user stats
    const { data: stats } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', user.id)
      .single();

    return NextResponse.json({
      profile,
      stats: stats || null,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
