'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Eye,
  Clock,
  Target,
  Shield,
  DollarSign,
  MoreVertical,
  Lock,
} from 'lucide-react';
import { formatRelativeTime, formatCurrency } from '@/lib/utils/helpers';

interface SignalCardProps {
  signal: {
    id: string;
    userId: string;
    username: string;
    symbol: string;
    direction: 'long' | 'short';
    entryPrice: number;
    stopLoss?: number;
    takeProfit?: number;
    positionSize?: number;
    status: 'active' | 'closed' | 'cancelled';
    exitPrice?: number;
    pnl?: number;
    pnlPercentage?: number;
    title?: string;
    description?: string;
    tags?: string[];
    imageUrl?: string;
    timeframe?: string;
    marketType?: string;
    riskRewardRatio?: number;
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
    viewsCount: number;
    isLiked: boolean;
    isPremium?: boolean;
    createdAt: string;
  };
  onLike?: (signalId: string) => void;
  onUnlike?: (signalId: string) => void;
  onComment?: (signalId: string) => void;
  onShare?: (signalId: string) => void;
}

export function SignalCard({ signal, onLike, onUnlike, onComment, onShare }: SignalCardProps) {
  const [isLiked, setIsLiked] = useState(signal.isLiked);
  const [likesCount, setLikesCount] = useState(signal.likesCount);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleLike = async () => {
    if (isLiked) {
      setIsLiked(false);
      setLikesCount(prev => prev - 1);
      onUnlike?.(signal.id);
    } else {
      setIsLiked(true);
      setLikesCount(prev => prev + 1);
      onLike?.(signal.id);
    }
  };

  const isProfit = signal.pnl ? signal.pnl > 0 : false;
  const isLoss = signal.pnl ? signal.pnl < 0 : false;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-dark-glass backdrop-blur-xl transition-all hover:border-white/20 hover:shadow-glass"
    >
      {/* Premium Badge */}
      {signal.isPremium && (
        <div className="absolute right-4 top-4 z-10">
          <div className="flex items-center gap-1 rounded-full bg-purple-600 px-3 py-1 text-xs font-semibold text-white shadow-glow-md">
            <Lock className="h-3 w-3" />
            Premium
          </div>
        </div>
      )}

      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between">
          <Link href={`/profile/${signal.username}`} className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-signal font-semibold text-white">
              {signal.username[0].toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-white">{signal.username}</p>
              <p className="text-xs text-gray-400">{formatRelativeTime(signal.createdAt)}</p>
            </div>
          </Link>

          <button className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/5 hover:text-white">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>

        {/* Title */}
        {signal.title && (
          <h3 className="mt-4 text-xl font-bold text-white">{signal.title}</h3>
        )}
      </div>

      {/* Signal Info Card */}
      <div className="mx-6 mb-4 overflow-hidden rounded-xl border border-white/10 bg-white/5">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            {/* Direction Badge */}
            <div className={`flex items-center gap-2 rounded-full px-4 py-2 ${
              signal.direction === 'long'
                ? 'bg-gradient-profit shadow-glow-profit'
                : 'bg-gradient-loss shadow-glow-loss'
            }`}>
              {signal.direction === 'long' ? (
                <TrendingUp className="h-5 w-5 text-white" />
              ) : (
                <TrendingDown className="h-5 w-5 text-white" />
              )}
              <span className="font-bold uppercase text-white">{signal.direction}</span>
            </div>

            {/* Symbol */}
            <div>
              <p className="text-2xl font-bold text-white">{signal.symbol}</p>
              {signal.marketType && (
                <p className="text-xs text-gray-400 capitalize">{signal.marketType}</p>
              )}
            </div>
          </div>

          {/* Status Badge */}
          <div className={`rounded-full px-3 py-1 text-xs font-semibold ${
            signal.status === 'active'
              ? 'bg-blue-500/20 text-blue-400'
              : signal.status === 'closed'
              ? 'bg-green-500/20 text-green-400'
              : 'bg-gray-500/20 text-gray-400'
          }`}>
            {signal.status}
          </div>
        </div>

        {/* Price Info */}
        <div className="grid grid-cols-3 border-t border-white/10">
          <div className="border-r border-white/10 p-4">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Target className="h-4 w-4" />
              Entry
            </div>
            <p className="mt-1 text-lg font-bold text-white">
              {formatCurrency(signal.entryPrice, 'USD', signal.entryPrice < 1 ? 6 : 2)}
            </p>
          </div>

          {signal.stopLoss && (
            <div className="border-r border-white/10 p-4">
              <div className="flex items-center gap-2 text-xs text-loss">
                <Shield className="h-4 w-4" />
                Stop Loss
              </div>
              <p className="mt-1 text-lg font-bold text-white">
                {formatCurrency(signal.stopLoss, 'USD', signal.stopLoss < 1 ? 6 : 2)}
              </p>
            </div>
          )}

          {signal.takeProfit && (
            <div className="p-4">
              <div className="flex items-center gap-2 text-xs text-profit">
                <DollarSign className="h-4 w-4" />
                Take Profit
              </div>
              <p className="mt-1 text-lg font-bold text-white">
                {formatCurrency(signal.takeProfit, 'USD', signal.takeProfit < 1 ? 6 : 2)}
              </p>
            </div>
          )}
        </div>

        {/* Risk/Reward & P&L */}
        {(signal.riskRewardRatio || signal.pnl !== undefined) && (
          <div className="grid grid-cols-2 border-t border-white/10">
            {signal.riskRewardRatio && (
              <div className="border-r border-white/10 p-4">
                <p className="text-xs text-gray-400">Risk/Reward</p>
                <p className="mt-1 text-lg font-bold text-blue-400">
                  1:{signal.riskRewardRatio.toFixed(2)}
                </p>
              </div>
            )}

            {signal.pnl !== undefined && (
              <div className="p-4">
                <p className="text-xs text-gray-400">P&L</p>
                <p className={`mt-1 text-lg font-bold ${isProfit ? 'text-profit' : isLoss ? 'text-loss' : 'text-gray-400'}`}>
                  {signal.pnl > 0 ? '+' : ''}{formatCurrency(signal.pnl)}
                  {signal.pnlPercentage && (
                    <span className="ml-1 text-sm">
                      ({signal.pnlPercentage > 0 ? '+' : ''}{signal.pnlPercentage.toFixed(2)}%)
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      {signal.description && (
        <div className="px-6 pb-4">
          <p className={`text-gray-300 ${!isExpanded && 'line-clamp-3'}`}>
            {signal.description}
          </p>
          {signal.description.length > 150 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 text-sm font-medium text-blue-400 hover:text-blue-300"
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      )}

      {/* Chart Image */}
      {signal.imageUrl && (
        <div className="px-6 pb-4">
          <img
            src={signal.imageUrl}
            alt="Chart"
            className="w-full rounded-lg border border-white/10"
          />
        </div>
      )}

      {/* Tags & Timeframe */}
      {(signal.tags && signal.tags.length > 0 || signal.timeframe) && (
        <div className="flex flex-wrap items-center gap-2 px-6 pb-4">
          {signal.timeframe && (
            <div className="flex items-center gap-1 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-medium text-blue-400">
              <Clock className="h-3 w-3" />
              {signal.timeframe}
            </div>
          )}
          {signal.tags?.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-gray-300"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-white/10 px-6 py-3">
        <div className="flex items-center gap-4">
          {/* Like */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleLike}
            className="flex items-center gap-2 text-gray-400 transition-colors hover:text-white"
          >
            <Heart
              className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`}
            />
            <span className="text-sm font-medium">{likesCount}</span>
          </motion.button>

          {/* Comment */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onComment?.(signal.id)}
            className="flex items-center gap-2 text-gray-400 transition-colors hover:text-white"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm font-medium">{signal.commentsCount}</span>
          </motion.button>

          {/* Share */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onShare?.(signal.id)}
            className="flex items-center gap-2 text-gray-400 transition-colors hover:text-white"
          >
            <Share2 className="h-5 w-5" />
            <span className="text-sm font-medium">{signal.sharesCount}</span>
          </motion.button>

          {/* Views */}
          <div className="flex items-center gap-2 text-gray-400">
            <Eye className="h-5 w-5" />
            <span className="text-sm font-medium">{signal.viewsCount}</span>
          </div>
        </div>

        {/* Bookmark */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="text-gray-400 transition-colors hover:text-white"
        >
          <Bookmark className="h-5 w-5" />
        </motion.button>
      </div>
    </motion.article>
  );
}
