import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { GetSignalsFeedResponse } from '@tradosphere/types/api';

/**
 * GET /api/signals/feed
 * Get trading signals feed with filters and pagination
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const offset = (page - 1) * limit;

    // Filters
    const symbol = searchParams.get('symbol');
    const direction = searchParams.get('direction'); // 'long' | 'short'
    const marketType = searchParams.get('marketType');
    const status = searchParams.get('status') || 'active';
    const userId = searchParams.get('userId'); // Filter by specific user
    const following = searchParams.get('following') === 'true'; // Only from followed users

    // Sorting
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const supabase = await createClient();

    // Get authenticated user (optional for public feed)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Build query
    let query = supabase
      .from('signals')
      .select(
        `
        *,
        users:user_id (
          id,
          username,
          email
        )
      `,
        { count: 'exact' },
      )
      .eq('is_public', true);

    // Apply filters
    if (symbol) {
      query = query.eq('symbol', symbol.toUpperCase());
    }

    if (direction) {
      query = query.eq('direction', direction);
    }

    if (marketType) {
      query = query.eq('market_type', marketType);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (userId) {
      query = query.eq('user_id', userId);
    }

    // Filter by following
    if (following && user) {
      const { data: followingUsers } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', user.id);

      if (followingUsers && followingUsers.length > 0) {
        const followingIds = followingUsers.map((f) => f.following_id);
        query = query.in('user_id', followingIds);
      } else {
        // No following, return empty result
        return NextResponse.json({
          success: true,
          data: {
            signals: [],
            pagination: {
              page,
              limit,
              total: 0,
              totalPages: 0,
            },
          },
        });
      }
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: signals, error, count } = await query;

    if (error) {
      console.error('Error fetching signals:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch signals',
        },
        { status: 500 },
      );
    }

    // Get likes status for authenticated user
    let userLikes: string[] = [];
    if (user && signals && signals.length > 0) {
      const signalIds = signals.map((s) => s.id);
      const { data: likes } = await supabase
        .from('signal_likes')
        .select('signal_id')
        .eq('user_id', user.id)
        .in('signal_id', signalIds);

      userLikes = likes ? likes.map((l) => l.signal_id) : [];
    }

    // Format response
    const formattedSignals = (signals || []).map((signal) => ({
      id: signal.id,
      userId: signal.user_id,
      username: signal.users?.username || 'Unknown',
      symbol: signal.symbol,
      direction: signal.direction,
      entryPrice: signal.entry_price,
      stopLoss: signal.stop_loss,
      takeProfit: signal.take_profit,
      positionSize: signal.position_size,
      status: signal.status,
      exitPrice: signal.exit_price,
      pnl: signal.pnl,
      pnlPercentage: signal.pnl_percentage,
      title: signal.title,
      description: signal.description,
      tags: signal.tags || [],
      imageUrl: signal.image_url,
      timeframe: signal.timeframe,
      marketType: signal.market_type,
      riskRewardRatio: signal.risk_reward_ratio,
      likesCount: signal.likes_count,
      commentsCount: signal.comments_count,
      sharesCount: signal.shares_count,
      viewsCount: signal.views_count,
      isLiked: userLikes.includes(signal.id),
      createdAt: signal.created_at,
      updatedAt: signal.updated_at,
      closedAt: signal.closed_at,
    }));

    const response: GetSignalsFeedResponse = {
      success: true,
      data: {
        signals: formattedSignals,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Get signals feed error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch signals',
      },
      { status: 500 },
    );
  }
}
