import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { geminiRateLimiter } from '@/lib/gemini/rate-limiter';
import { geminiCache, withCache } from '@/lib/gemini/cache';
import type { SummarizeRequest, SummarizeResponse } from '@tradosphere/types/api';

/**
 * POST /api/gemini/summarize
 * Generates a summary of chat/stream content using Gemini 2.0 Flash
 */
export async function POST(req: NextRequest) {
  try {
    const body: SummarizeRequest = await req.json();
    const { userId, userTier, messages, context, userGeminiKey } = body;

    // Validate required fields
    if (!userId || !userTier || !messages || messages.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: userId, userTier, messages',
        },
        { status: 400 },
      );
    }

    // Rate limiting (skip if user has own key)
    if (!userGeminiKey) {
      const rateLimitCheck = await geminiRateLimiter.checkLimit(userId, userTier);

      if (!rateLimitCheck.allowed) {
        return NextResponse.json(
          {
            success: false,
            error: rateLimitCheck.message || 'Rate limit exceeded',
            data: {
              remaining: rateLimitCheck.remaining,
              resetAt: rateLimitCheck.resetAt,
            },
          },
          { status: 429 },
        );
      }
    }

    // Determine API key
    const apiKey = userGeminiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Gemini API key not configured',
        },
        { status: 500 },
      );
    }

    // Check cache first
    const cacheKey = { messages, context };
    const cached = geminiCache.get<string>('chatSummary', cacheKey);

    if (cached !== null) {
      const response: SummarizeResponse = {
        success: true,
        data: {
          summary: cached,
          cached: true,
        },
      };
      return NextResponse.json(response);
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Build prompt
    const contextText = context ? `Context: ${context}\n\n` : '';
    const messagesText = messages
      .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');

    const prompt = `${contextText}Please provide a concise summary of the following conversation, highlighting key trading insights, signals discussed, and actionable takeaways:\n\n${messagesText}\n\nSummary:`;

    // Generate summary
    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    // Cache the result
    geminiCache.set('chatSummary', cacheKey, summary);

    // Increment usage (if using platform key)
    if (!userGeminiKey) {
      await geminiRateLimiter.incrementUsage(userId, userTier);
    }

    const response: SummarizeResponse = {
      success: true,
      data: {
        summary,
        cached: false,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Gemini summarize error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate summary',
      },
      { status: 500 },
    );
  }
}
