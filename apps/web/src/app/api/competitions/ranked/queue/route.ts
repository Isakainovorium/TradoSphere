import { NextResponse } from 'next/server';
import { FindRankedMatchDto } from '@tradosphere/types/competitions';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * POST /api/competitions/ranked/queue
 * Join ranked matchmaking queue
 */
export async function POST(request: Request) {
  try {
    const body: FindRankedMatchDto = await request.json();

    // TODO: Get user session/auth token
    // const session = await getServerSession();
    // const token = session?.accessToken;

    const response = await fetch(`${API_URL}/competitions/ranked/queue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: error || 'Failed to join queue' },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error joining queue:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/competitions/ranked/queue
 * Leave ranked matchmaking queue
 */
export async function DELETE(request: Request) {
  try {
    // TODO: Get user session/auth token
    // const session = await getServerSession();
    // const token = session?.accessToken;

    const response = await fetch(`${API_URL}/competitions/ranked/queue`, {
      method: 'DELETE',
      headers: {
        // 'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: error || 'Failed to leave queue' },
        { status: response.status },
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error leaving queue:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
