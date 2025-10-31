'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Filter,
  Search,
  Plus,
  Sparkles,
  Users,
  Clock,
  ThumbsUp,
  MessageSquare,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { SignalCard } from '@/components/signals/signal-card';
import { useUser } from '@/hooks/use-user';
import type { Signal } from '@/types/models';

type SortOption = 'newest' | 'likes' | 'comments';
type DirectionFilter = 'all' | 'long' | 'short';
type StatusFilter = 'all' | 'active' | 'closed';

export default function SignalsFeedPage() {
  const { user, profile } = useUser();
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // Filters
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [directionFilter, setDirectionFilter] = useState<DirectionFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [followingOnly, setFollowingOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const fetchSignals = useCallback(
    async (pageNum: number, isLoadMore: boolean = false) => {
      try {
        if (isLoadMore) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }

        const params = new URLSearchParams({
          page: pageNum.toString(),
          limit: '10',
          sortBy,
        });

        if (directionFilter !== 'all') params.append('direction', directionFilter);
        if (statusFilter !== 'all') params.append('status', statusFilter);
        if (searchQuery) params.append('symbol', searchQuery);
        if (followingOnly) params.append('following', 'true');

        const response = await fetch(`/api/signals/feed?${params}`, {
          credentials: 'include',
        });

        if (!response.ok) throw new Error('Failed to fetch signals');

        const data = await response.json();

        if (isLoadMore) {
          setSignals((prev) => [...prev, ...data.signals]);
        } else {
          setSignals(data.signals);
        }

        setHasMore(data.hasMore);
        setPage(pageNum);
      } catch (error) {
        console.error('Error fetching signals:', error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [sortBy, directionFilter, statusFilter, searchQuery, followingOnly]
  );

  // Initial load
  useEffect(() => {
    fetchSignals(1, false);
  }, [fetchSignals]);

  // Infinite scroll observer
  useEffect(() => {
    if (loading || loadingMore || !hasMore) return;

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          fetchSignals(page + 1, true);
        }
      },
      { threshold: 0.5 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [loading, loadingMore, hasMore, page, fetchSignals]);

  const handleLike = async (signalId: string) => {
    try {
      const response = await fetch(`/api/signals/${signalId}/like`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to like signal');

      // Optimistic update
      setSignals((prev) =>
        prev.map((signal) =>
          signal.id === signalId
            ? {
                ...signal,
                isLiked: true,
                likesCount: signal.likesCount + 1,
              }
            : signal
        )
      );
    } catch (error) {
      console.error('Error liking signal:', error);
    }
  };

  const handleUnlike = async (signalId: string) => {
    try {
      const response = await fetch(`/api/signals/${signalId}/like`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to unlike signal');

      // Optimistic update
      setSignals((prev) =>
        prev.map((signal) =>
          signal.id === signalId
            ? {
                ...signal,
                isLiked: false,
                likesCount: signal.likesCount - 1,
              }
            : signal
        )
      );
    } catch (error) {
      console.error('Error unliking signal:', error);
    }
  };

  const handleComment = (signalId: string) => {
    // Navigate to signal detail page with comments open
    window.location.href = `/signals/${signalId}#comments`;
  };

  const handleShare = async (signalId: string) => {
    const url = `${window.location.origin}/signals/${signalId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Trading Signal',
          text: 'Check out this trading signal on TradoSphere!',
          url,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-purple-950">
      {/* Header */}
      <div className="border-b border-white/10 bg-gradient-dark-glass backdrop-blur-xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-signal shadow-glow-md">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Trading Signals</h1>
                  <p className="text-sm text-gray-400">
                    Share and discover profitable trading opportunities
                  </p>
                </div>
              </div>
            </div>

            <Link href="/signals/create">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 rounded-xl bg-gradient-signal px-6 py-3 font-semibold text-white shadow-glow-md transition-all hover:shadow-glow-lg"
              >
                <Plus className="h-5 w-5" />
                Create Signal
              </motion.button>
            </Link>
          </div>

          {/* Filter Bar */}
          <div className="mt-6 flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by symbol (e.g., BTC, EUR/USD)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-white placeholder-gray-400 backdrop-blur-xl transition-all focus:border-white/20 focus:bg-white/10 focus:outline-none"
                />
              </div>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSortBy('newest')}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  sortBy === 'newest'
                    ? 'bg-blue-500/20 text-blue-400 shadow-glow-sm'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Clock className="h-4 w-4" />
                Newest
              </button>

              <button
                onClick={() => setSortBy('likes')}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  sortBy === 'likes'
                    ? 'bg-blue-500/20 text-blue-400 shadow-glow-sm'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <ThumbsUp className="h-4 w-4" />
                Most Liked
              </button>

              <button
                onClick={() => setSortBy('comments')}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  sortBy === 'comments'
                    ? 'bg-blue-500/20 text-blue-400 shadow-glow-sm'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                Most Discussed
              </button>
            </div>

            {/* Following Filter */}
            {user && (
              <button
                onClick={() => setFollowingOnly(!followingOnly)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  followingOnly
                    ? 'bg-purple-500/20 text-purple-400 shadow-glow-sm'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Users className="h-4 w-4" />
                Following
              </button>
            )}

            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                showFilters
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl"
            >
              <div className="flex flex-wrap gap-4">
                {/* Direction Filter */}
                <div>
                  <label className="mb-2 block text-xs font-medium text-gray-400">
                    Direction
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDirectionFilter('all')}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                        directionFilter === 'all'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setDirectionFilter('long')}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                        directionFilter === 'long'
                          ? 'bg-profit/20 text-profit'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      Long
                    </button>
                    <button
                      onClick={() => setDirectionFilter('short')}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                        directionFilter === 'short'
                          ? 'bg-loss/20 text-loss'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      Short
                    </button>
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="mb-2 block text-xs font-medium text-gray-400">
                    Status
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setStatusFilter('all')}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                        statusFilter === 'all'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setStatusFilter('active')}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                        statusFilter === 'active'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      Active
                    </button>
                    <button
                      onClick={() => setStatusFilter('closed')}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                        statusFilter === 'closed'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      Closed
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Feed Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Premium Signal Promotion */}
        {profile?.tier === 'free' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-900/20 to-pink-900/20 p-6 backdrop-blur-xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-purple-400" />
                  <h3 className="text-xl font-bold text-white">
                    Unlock Premium Signals
                  </h3>
                </div>
                <p className="mt-2 text-gray-300">
                  Get access to exclusive trading signals from top performers with Grow
                  tier ($5/month) or higher.
                </p>
              </div>
              <Link href="/pricing">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-xl bg-gradient-streaming px-6 py-3 font-semibold text-white shadow-glow-md"
                >
                  Upgrade Now
                </motion.button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && signals.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-blue-400" />
            <p className="mt-4 text-gray-400">Loading signals...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && signals.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-signal/20">
              <TrendingUp className="h-12 w-12 text-blue-400" />
            </div>
            <h3 className="mt-6 text-2xl font-bold text-white">No signals found</h3>
            <p className="mt-2 text-gray-400">
              {followingOnly
                ? "You're not following anyone yet, or they haven't posted signals."
                : 'Be the first to share a trading signal!'}
            </p>
            <Link href="/signals/create">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-6 flex items-center gap-2 rounded-xl bg-gradient-signal px-6 py-3 font-semibold text-white shadow-glow-md"
              >
                <Plus className="h-5 w-5" />
                Create Signal
              </motion.button>
            </Link>
          </div>
        )}

        {/* Signal Cards */}
        {signals.length > 0 && (
          <div className="grid gap-6">
            {signals.map((signal, index) => (
              <motion.div
                key={signal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <SignalCard
                  signal={signal}
                  onLike={handleLike}
                  onUnlike={handleUnlike}
                  onComment={handleComment}
                  onShare={handleShare}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Load More Trigger */}
        {hasMore && !loading && (
          <div ref={loadMoreRef} className="mt-8 flex justify-center py-8">
            {loadingMore && (
              <div className="flex items-center gap-3 text-gray-400">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Loading more signals...</span>
              </div>
            )}
          </div>
        )}

        {/* End of Feed */}
        {!hasMore && signals.length > 0 && (
          <div className="mt-8 flex justify-center py-8">
            <p className="text-gray-400">You've reached the end of the feed</p>
          </div>
        )}
      </div>
    </div>
  );
}
