import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createSignalSchema } from '@/lib/utils/validators';
import type { CreateSignalRequest, CreateSignalResponse } from '@tradosphere/types/api';

/**
 * POST /api/signals/create
 * Create a new trading signal
 */
export async function POST(req: NextRequest) {
  try {
    const body: CreateSignalRequest = await req.json();

    // Validate request body
    const validation = createSignalSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.errors[0].message,
        },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not authenticated',
        },
        { status: 401 },
      );
    }

    // Calculate risk/reward ratio if SL and TP are provided
    let riskRewardRatio: number | null = null;
    if (body.stopLoss && body.takeProfit) {
      const risk = Math.abs(body.entryPrice - body.stopLoss);
      const reward = Math.abs(body.takeProfit - body.entryPrice);
      riskRewardRatio = risk > 0 ? reward / risk : null;
    }

    // Insert signal
    const { data: signal, error: insertError } = await supabase
      .from('signals')
      .insert({
        user_id: user.id,
        symbol: body.symbol.toUpperCase(),
        direction: body.direction,
        entry_price: body.entryPrice,
        stop_loss: body.stopLoss || null,
        take_profit: body.takeProfit || null,
        position_size: body.positionSize || null,
        title: body.title || null,
        description: body.description || null,
        tags: body.tags || [],
        image_url: body.imageUrl || null,
        timeframe: body.timeframe || null,
        market_type: body.marketType || null,
        risk_reward_ratio: riskRewardRatio,
        is_public: body.isPublic ?? true,
        is_premium: body.isPremium ?? false,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating signal:', insertError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create signal',
        },
        { status: 500 },
      );
    }

    const response: CreateSignalResponse = {
      success: true,
      data: {
        id: signal.id,
        symbol: signal.symbol,
        direction: signal.direction,
        entryPrice: signal.entry_price,
        createdAt: signal.created_at,
      },
      message: 'Signal created successfully',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Create signal error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create signal',
      },
      { status: 500 },
    );
  }
}
