/**
 * Validation Schemas using Zod
 * Used for form validation and API request validation
 */

import { z } from 'zod';

// =====================================================
// AUTH SCHEMAS
// =====================================================

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// =====================================================
// SIGNAL SCHEMAS
// =====================================================

export const createSignalSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required').toUpperCase(),
  direction: z.enum(['long', 'short']),
  entryPrice: z.number().positive('Entry price must be positive'),
  stopLoss: z.number().positive().optional(),
  takeProfit: z.number().positive().optional(),
  positionSize: z.number().positive().optional(),
  timeframe: z.string().optional(),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  imageUrl: z.string().url().optional(),
});

export const updateSignalSchema = createSignalSchema.partial().extend({
  status: z.enum(['active', 'closed', 'cancelled']).optional(),
  exitPrice: z.number().positive().optional(),
  pnl: z.number().optional(),
});

// =====================================================
// PROFILE SCHEMAS
// =====================================================

export const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .optional(),
  fullName: z.string().max(50, 'Name must be less than 50 characters').optional(),
  bio: z.string().max(200, 'Bio must be less than 200 characters').optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  twitterHandle: z
    .string()
    .regex(/^@?[a-zA-Z0-9_]{1,15}$/, 'Invalid Twitter handle')
    .optional()
    .or(z.literal('')),
});

// =====================================================
// COMPETITION SCHEMAS
// =====================================================

export const createCustomCompetitionSchema = z.object({
  competitionType: z.enum(['1v1', 'team', 'battle_royal', 'mentor_clan', 'mentor_vs_mentor']),
  name: z.string().min(3, 'Name must be at least 3 characters').max(50),
  description: z.string().max(500).optional(),
  durationHours: z.number().int().min(1).max(720), // Max 30 days
  entryFee: z.number().min(0).max(1000).optional(),
  maxParticipants: z.number().int().min(2).max(100),
  allowedSymbols: z.array(z.string()).optional(),
  minRank: z.string().optional(),
  maxRank: z.string().optional(),
  isPublic: z.boolean().optional(),
});

export const joinCompetitionSchema = z.object({
  competitionId: z.string().uuid(),
  teamId: z.string().uuid().optional(),
});

export const findRankedMatchSchema = z.object({
  format: z.enum(['1v1', '2v2', '3v3', 'battle_royal']),
  durationHours: z.number().int().min(1).max(168).optional(), // Max 1 week
});

// =====================================================
// BROKER CONNECTION SCHEMAS
// =====================================================

export const connectBrokerSchema = z.object({
  brokerName: z.enum([
    'tradovate',
    'binance',
    'ninjatrader',
    'rhythmic',
    'quantower',
    'mt4',
    'mt5',
    'tradelocker',
    'mexc',
    'bybit',
    'projectx',
  ]),
  apiKey: z.string().min(1, 'API key is required'),
  apiSecret: z.string().min(1, 'API secret is required').optional(),
  accountId: z.string().optional(),
});

// =====================================================
// GEMINI/AI SCHEMAS
// =====================================================

export const parseSignalSchema = z.object({
  text: z.string().min(10, 'Signal text must be at least 10 characters'),
});

export const analyzeTradeSchema = z.object({
  symbol: z.string(),
  direction: z.enum(['long', 'short']),
  entryPrice: z.number(),
  exitPrice: z.number(),
  pnl: z.number(),
  userNotes: z.string().optional(),
});

export const chatSummarySchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    }),
  ),
});

export const learningQASchema = z.object({
  question: z.string().min(10, 'Question must be at least 10 characters'),
  context: z.string().optional(),
});

// =====================================================
// SUBSCRIPTION SCHEMAS
// =====================================================

export const updateSubscriptionSchema = z.object({
  tier: z.enum(['free', 'tsgrow', 'elite', 'gladiator']),
  billingCycle: z.enum(['monthly', 'yearly']).optional(),
});

export const createCreatorSubscriptionSchema = z.object({
  creatorId: z.string().uuid(),
  tier: z.string(),
  price: z.number().min(4.99).max(99.99), // Min $4.99, max $99.99
});

// =====================================================
// HELPER TYPES
// =====================================================

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type CreateSignalInput = z.infer<typeof createSignalSchema>;
export type UpdateSignalInput = z.infer<typeof updateSignalSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateCustomCompetitionInput = z.infer<typeof createCustomCompetitionSchema>;
export type FindRankedMatchInput = z.infer<typeof findRankedMatchSchema>;
export type ConnectBrokerInput = z.infer<typeof connectBrokerSchema>;
export type ParseSignalInput = z.infer<typeof parseSignalSchema>;
export type AnalyzeTradeInput = z.infer<typeof analyzeTradeSchema>;
