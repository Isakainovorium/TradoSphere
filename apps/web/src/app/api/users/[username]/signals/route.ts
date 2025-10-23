import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/users/[username]/signals
 * Get all signals posted by a specific user
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status'); // 'active', 'closed', or null for all

    const supabase = createClient();

    // Get current user for checking premium access
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    // First, get the user by username
    const { data: targetUser, error: userError } = await supabase
      .from('users')
      .select('id, tier')
      .eq('username', username)
      .single();

    if (userError || !targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Build query
    let query = supabase
      .from('signals')
      .select(
        `
        *,
        user:users!inner(
          id,
          username,
          avatar_url,
          tier,
          is_verified
        )
      `,
        { count: 'exact' }
      )
      .eq('user_id', targetUser.id)
      .order('created_at', { ascending: false });

    // Filter by status if provided
    if (status) {
      query = query.eq('status', status);
    }

    // Premium access check
    const hasProAccess =
      currentUser &&
      (currentUser.id === targetUser.id || // Own signals
        ['grow', 'elite', 'gladiator'].includes(currentUser.tier || ''));

    if (!hasProAccess) {
      // Only show public signals
      query = query.eq('is_public', true);
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: signals, error: signalsError, count } = await query;

    if (signalsError) {
      console.error('Error fetching user signals:', signalsError);
      return NextResponse.json(
        { error: 'Failed to fetch signals' },
        { status: 500 }
      );
    }

    // Check if user has liked each signal (if authenticated)
    let signalsWithLikes = signals || [];
    if (currentUser) {
      const signalIds = signals?.map((s) => s.id) || [];

      if (signalIds.length > 0) {
        const { data: likes } = await supabase
          .from('signal_likes')
          .select('signal_id')
          .eq('user_id', currentUser.id)
          .in('signal_id', signalIds);

        const likedSignalIds = new Set(likes?.map((l) => l.signal_id) || []);

        signalsWithLikes = signals?.map((signal) => ({
          ...signal,
          isLiked: likedSignalIds.has(signal.id),
        })) || [];
      }
    }

    const totalPages = count ? Math.ceil(count / limit) : 0;
    const hasMore = page < totalPages;

    return NextResponse.json({
      signals: signalsWithLikes,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasMore,
      },
    });
  } catch (error) {
    console.error('Error fetching user signals:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
