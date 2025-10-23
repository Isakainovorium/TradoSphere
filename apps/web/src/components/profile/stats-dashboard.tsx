'use client';

import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  BarChart3,
  Zap,
  ThumbsUp,
  MessageSquare,
  Eye,
  Trophy,
  Flame,
} from 'lucide-react';

interface UserStats {
  // Signal Statistics
  totalSignals: number;
  activeSignals: number;
  closedSignals: number;

  // Win/Loss Statistics
  totalWins: number;
  totalLosses: number;
  winRate: number;

  // Profit/Loss
  totalPnl: number;
  totalProfit: number;
  totalLoss: number;
  averagePnl: number;
  bestTrade: number;
  worstTrade: number;

  // Risk Metrics
  averageRrRatio: number;
  totalRiskTaken: number;

  // Streak Statistics
  currentWinStreak: number;
  currentLossStreak: number;
  longestWinStreak: number;
  longestLossStreak: number;

  // Engagement
  totalLikesReceived: number;
  totalCommentsReceived: number;
  totalShares: number;

  // Competition
  rankedWins: number;
  rankedLosses: number;
  rankedDraws: number;
  currentRank: string;
  currentXp: number;
  highestRankAchieved: string;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  gradient?: string;
}

function StatCard({ icon, label, value, subtitle, trend, gradient }: StatCardProps) {
  const getTrendColor = () => {
    if (trend === 'up') return 'text-profit';
    if (trend === 'down') return 'text-loss';
    return 'text-gray-400';
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4" />;
    return null;
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-dark-glass p-6 backdrop-blur-xl transition-all hover:shadow-glass ${
        gradient || ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                gradient ? 'bg-white/10' : 'bg-blue-500/20'
              }`}
            >
              {icon}
            </div>
            <span className="text-sm font-medium text-gray-400">{label}</span>
          </div>

          <div className="mb-1 text-3xl font-bold text-white">{value}</div>

          {subtitle && (
            <div className={`flex items-center gap-1 text-sm ${getTrendColor()}`}>
              {getTrendIcon()}
              <span>{subtitle}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

interface StatsDashboardProps {
  stats: UserStats | null;
  isOwnProfile?: boolean;
}

export function StatsDashboard({ stats, isOwnProfile = false }: StatsDashboardProps) {
  if (!stats) {
    return (
      <div className="rounded-2xl border border-white/10 bg-gradient-dark-glass p-8 text-center backdrop-blur-xl">
        <BarChart3 className="mx-auto h-12 w-12 text-gray-600" />
        <p className="mt-4 text-gray-400">
          No statistics available yet. Start posting signals to build your track record!
        </p>
      </div>
    );
  }

  const isProfitable = stats.totalPnl > 0;
  const hasActiveStreak = stats.currentWinStreak > 0 || stats.currentLossStreak > 0;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div>
        <h3 className="mb-4 text-lg font-bold text-white">Trading Performance</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<BarChart3 className="h-5 w-5 text-blue-400" />}
            label="Total Signals"
            value={stats.totalSignals}
            subtitle={`${stats.activeSignals} active`}
          />

          <StatCard
            icon={<Target className="h-5 w-5 text-purple-400" />}
            label="Win Rate"
            value={`${stats.winRate.toFixed(1)}%`}
            subtitle={`${stats.totalWins}W - ${stats.totalLosses}L`}
            trend={stats.winRate >= 50 ? 'up' : 'down'}
          />

          <StatCard
            icon={
              isProfitable ? (
                <TrendingUp className="h-5 w-5 text-profit" />
              ) : (
                <TrendingDown className="h-5 w-5 text-loss" />
              )
            }
            label="Total P&L"
            value={`${isProfitable ? '+' : ''}$${stats.totalPnl.toFixed(2)}`}
            subtitle={`Avg: $${stats.averagePnl.toFixed(2)}`}
            trend={isProfitable ? 'up' : 'down'}
            gradient={
              isProfitable ? 'bg-gradient-profit/5' : 'bg-gradient-loss/5'
            }
          />

          <StatCard
            icon={<Award className="h-5 w-5 text-yellow-400" />}
            label="Avg R:R Ratio"
            value={stats.averageRrRatio.toFixed(2)}
            subtitle="Risk/Reward"
            trend={stats.averageRrRatio >= 2 ? 'up' : 'neutral'}
          />
        </div>
      </div>

      {/* Detailed Stats */}
      <div>
        <h3 className="mb-4 text-lg font-bold text-white">Detailed Statistics</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            icon={<TrendingUp className="h-5 w-5 text-profit" />}
            label="Best Trade"
            value={`+$${stats.bestTrade.toFixed(2)}`}
            subtitle={`Profit: $${stats.totalProfit.toFixed(2)}`}
          />

          <StatCard
            icon={<TrendingDown className="h-5 w-5 text-loss" />}
            label="Worst Trade"
            value={`-$${Math.abs(stats.worstTrade).toFixed(2)}`}
            subtitle={`Loss: $${stats.totalLoss.toFixed(2)}`}
          />

          <StatCard
            icon={<Zap className="h-5 w-5 text-orange-400" />}
            label="Risk Taken"
            value={`$${stats.totalRiskTaken.toFixed(2)}`}
            subtitle="Total exposure"
          />
        </div>
      </div>

      {/* Streak Stats */}
      {hasActiveStreak && (
        <div>
          <h3 className="mb-4 text-lg font-bold text-white">Current Streak</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {stats.currentWinStreak > 0 && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative overflow-hidden rounded-2xl border border-profit/30 bg-gradient-profit/10 p-6 backdrop-blur-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-profit/20">
                    <Flame className="h-8 w-8 text-profit" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-300">Win Streak</div>
                    <div className="text-4xl font-bold text-profit">
                      {stats.currentWinStreak}
                    </div>
                    <div className="text-xs text-gray-400">
                      Best: {stats.longestWinStreak}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {stats.currentLossStreak > 0 && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative overflow-hidden rounded-2xl border border-loss/30 bg-gradient-loss/10 p-6 backdrop-blur-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-loss/20">
                    <TrendingDown className="h-8 w-8 text-loss" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-300">Loss Streak</div>
                    <div className="text-4xl font-bold text-loss">
                      {stats.currentLossStreak}
                    </div>
                    <div className="text-xs text-gray-400">
                      Longest: {stats.longestLossStreak}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Engagement Stats */}
      <div>
        <h3 className="mb-4 text-lg font-bold text-white">Community Engagement</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            icon={<ThumbsUp className="h-5 w-5 text-pink-400" />}
            label="Likes Received"
            value={stats.totalLikesReceived.toLocaleString()}
          />

          <StatCard
            icon={<MessageSquare className="h-5 w-5 text-cyan-400" />}
            label="Comments"
            value={stats.totalCommentsReceived.toLocaleString()}
          />

          <StatCard
            icon={<Eye className="h-5 w-5 text-purple-400" />}
            label="Shares"
            value={stats.totalShares.toLocaleString()}
          />
        </div>
      </div>

      {/* Competition Stats */}
      {(stats.rankedWins > 0 || stats.rankedLosses > 0) && (
        <div>
          <h3 className="mb-4 text-lg font-bold text-white">Ranked Competition</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={<Trophy className="h-5 w-5 text-yellow-400" />}
              label="Current Rank"
              value={stats.currentRank.toUpperCase()}
              subtitle={`${stats.currentXp.toLocaleString()} XP`}
            />

            <StatCard
              icon={<Award className="h-5 w-5 text-blue-400" />}
              label="Ranked Wins"
              value={stats.rankedWins}
              subtitle={`${stats.rankedLosses} losses`}
            />

            <StatCard
              icon={<Target className="h-5 w-5 text-purple-400" />}
              label="Win Rate"
              value={`${(
                (stats.rankedWins / (stats.rankedWins + stats.rankedLosses)) *
                100
              ).toFixed(1)}%`}
            />

            <StatCard
              icon={<Flame className="h-5 w-5 text-orange-400" />}
              label="Peak Rank"
              value={stats.highestRankAchieved.toUpperCase()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
