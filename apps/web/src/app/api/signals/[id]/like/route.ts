import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/signals/[id]/like
 * Like a signal
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

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

    // Check if signal exists
    const { data: signal, error: signalError } = await supabase
      .from('signals')
      .select('id')
      .eq('id', id)
      .single();

    if (signalError || !signal) {
      return NextResponse.json(
        {
          success: false,
          error: 'Signal not found',
        },
        { status: 404 },
      );
    }

    // Check if already liked
    const { data: existingLike } = await supabase
      .from('signal_likes')
      .select('id')
      .eq('signal_id', id)
      .eq('user_id', user.id)
      .single();

    if (existingLike) {
      return NextResponse.json(
        {
          success: false,
          error: 'Already liked',
        },
        { status: 400 },
      );
    }

    // Add like
    const { error: insertError } = await supabase.from('signal_likes').insert({
      signal_id: id,
      user_id: user.id,
    });

    if (insertError) {
      console.error('Error adding like:', insertError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to add like',
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Signal liked successfully',
    });
  } catch (error) {
    console.error('Like signal error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to like signal',
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/signals/[id]/like
 * Unlike a signal
 */
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

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

    // Remove like
    const { error: deleteError } = await supabase
      .from('signal_likes')
      .delete()
      .eq('signal_id', id)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error removing like:', deleteError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to remove like',
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Signal unliked successfully',
    });
  } catch (error) {
    console.error('Unlike signal error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to unlike signal',
      },
      { status: 500 },
    );
  }
}
