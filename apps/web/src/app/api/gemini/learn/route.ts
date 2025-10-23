import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { geminiRateLimiter } from '@/lib/gemini/rate-limiter';
import { geminiCache } from '@/lib/gemini/cache';
import type { LearnRequest, LearnResponse } from '@tradosphere/types/api';

/**
 * POST /api/gemini/learn
 * Answers trading-related questions for the Learning Hub using Gemini 2.0 Flash
 */
export async function POST(req: NextRequest) {
  try {
    const body: LearnRequest = await req.json();
    const { userId, userTier, question, courseContext, userGeminiKey } = body;

    // Validate required fields
    if (!userId || !userTier || !question) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: userId, userTier, question',
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
    const cacheKey = { question, courseContext };
    const cached = geminiCache.get<string>('learnQA', cacheKey);

    if (cached !== null) {
      const response: LearnResponse = {
        success: true,
        data: {
          answer: cached,
          relatedTopics: extractRelatedTopics(cached),
          cached: true,
        },
      };
      return NextResponse.json(response);
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Build prompt with trading context
    const contextText = courseContext
      ? `This question is related to: ${courseContext}\n\n`
      : '';

    const prompt = `You are a trading education assistant for TradoSphere, a platform for traders to learn, compete, and grow.

${contextText}User question: ${question}

Please provide a clear, educational answer that:
1. Explains the concept in simple terms
2. Provides practical trading examples
3. Highlights common mistakes to avoid
4. Suggests related topics to explore

Keep the answer concise (2-3 paragraphs) and actionable.

Answer:`;

    // Generate answer
    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    // Extract related topics
    const relatedTopics = extractRelatedTopics(answer);

    // Cache the result
    geminiCache.set('learnQA', cacheKey, answer);

    // Increment usage (if using platform key)
    if (!userGeminiKey) {
      await geminiRateLimiter.incrementUsage(userId, userTier);
    }

    const response: LearnResponse = {
      success: true,
      data: {
        answer,
        relatedTopics,
        cached: false,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Gemini learn error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate answer',
      },
      { status: 500 },
    );
  }
}

/**
 * Extracts related topics from the answer text
 * Simple keyword extraction - can be enhanced with NLP later
 */
function extractRelatedTopics(answer: string): string[] {
  const topics = new Set<string>();

  // Common trading topics to look for
  const topicKeywords = [
    'risk management',
    'position sizing',
    'technical analysis',
    'fundamental analysis',
    'candlestick patterns',
    'support and resistance',
    'trend following',
    'scalping',
    'day trading',
    'swing trading',
    'psychology',
    'backtesting',
    'stop loss',
    'take profit',
    'fibonacci',
    'moving averages',
    'RSI',
    'MACD',
    'volume analysis',
    'order flow',
  ];

  const lowerAnswer = answer.toLowerCase();

  topicKeywords.forEach((keyword) => {
    if (lowerAnswer.includes(keyword)) {
      topics.add(keyword);
    }
  });

  return Array.from(topics).slice(0, 5); // Limit to 5 related topics
}
