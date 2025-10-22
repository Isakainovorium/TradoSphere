'use client';

import { useState, useEffect } from 'react';
import { RankTier } from '@tradosphere/types/competitions';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  currentRank: RankTier;
  xp: number;
  wins: number;
  totalCompetitions: number;
  winRate: number;
  winStreak: number;
  isCurrentUser?: boolean;
}

interface LeaderboardProps {
  seasonId?: number;
  currentUserId?: string;
}

export function Leaderboard({ seasonId = 1, currentUserId }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRank, setFilterRank] = useState<string>('all');
  const [filterTime, setFilterTime] = useState<string>('season');

  useEffect(() => {
    fetchLeaderboard();
  }, [seasonId, filterRank, filterTime]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/competitions/leaderboard?seasonId=${seasonId}&limit=100`,
      );
      const data = await response.json();

      // TODO: Map actual data
      setEntries(data.entries || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank: RankTier): string => {
    if (rank.startsWith('Bronze')) return 'text-amber-700';
    if (rank.startsWith('Silver')) return 'text-gray-400';
    if (rank.startsWith('Gold')) return 'text-yellow-500';
    if (rank.startsWith('Platinum')) return 'text-gray-300';
    if (rank.startsWith('Diamond')) return 'text-cyan-400';
    if (rank === 'Champion') return 'text-yellow-400';
    return 'text-gray-500';
  };

  const getRankEmoji = (rank: RankTier): string => {
    if (rank.startsWith('Bronze')) return '🥉';
    if (rank.startsWith('Silver')) return '🥈';
    if (rank.startsWith('Gold')) return '🥇';
    if (rank.startsWith('Platinum')) return '💎';
    if (rank.startsWith('Diamond')) return '💠';
    if (rank === 'Champion') return '👑';
    return '🥉';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🏆 Global Leaderboard</h1>
          <p className="text-muted-foreground mt-1">
            Season {seasonId} Rankings
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <select
          value={filterRank}
          onChange={(e) => setFilterRank(e.target.value)}
          className="px-4 py-2 rounded-lg border border-border bg-card"
        >
          <option value="all">All Ranks</option>
          <option value="champion">Champion</option>
          <option value="diamond">Diamond</option>
          <option value="platinum">Platinum</option>
          <option value="gold">Gold</option>
          <option value="silver">Silver</option>
          <option value="bronze">Bronze</option>
        </select>

        <select
          value={filterTime}
          onChange={(e) => setFilterTime(e.target.value)}
          className="px-4 py-2 rounded-lg border border-border bg-card"
        >
          <option value="season">This Season</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="alltime">All Time</option>
        </select>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-muted-foreground">Loading leaderboard...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Rank</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Player</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Tier</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">XP</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">W-L</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Win Rate</th>
                  <th className="px-4 py-3 text-center text-sm font-medium">Streak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      No players found
                    </td>
                  </tr>
                ) : (
                  entries.map((entry) => (
                    <tr
                      key={entry.userId}
                      className={`hover:bg-muted/50 transition-colors ${
                        entry.isCurrentUser ? 'bg-primary/10 font-semibold' : ''
                      }`}
                    >
                      {/* Rank */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {entry.rank <= 3 && (
                            <span className="text-lg">
                              {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                            </span>
                          )}
                          <span className={entry.rank <= 10 ? 'font-bold' : ''}>
                            #{entry.rank}
                          </span>
                        </div>
                      </td>

                      {/* Player */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm">
                            {entry.username[0]}
                          </div>
                          <span>{entry.username}</span>
                          {entry.isCurrentUser && (
                            <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                              YOU
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Tier */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getRankEmoji(entry.currentRank)}</span>
                          <span className={getRankColor(entry.currentRank)}>
                            {entry.currentRank}
                          </span>
                        </div>
                      </td>

                      {/* XP */}
                      <td className="px-4 py-3 text-right font-mono">
                        {entry.xp.toLocaleString()}
                      </td>

                      {/* W-L */}
                      <td className="px-4 py-3 text-right">
                        <span className="text-green-500">{entry.wins}</span>
                        <span className="text-muted-foreground mx-1">-</span>
                        <span className="text-red-500">
                          {entry.totalCompetitions - entry.wins}
                        </span>
                      </td>

                      {/* Win Rate */}
                      <td className="px-4 py-3 text-right">
                        <span
                          className={
                            entry.winRate >= 60
                              ? 'text-green-500'
                              : entry.winRate >= 50
                              ? 'text-yellow-500'
                              : 'text-red-500'
                          }
                        >
                          {entry.winRate}%
                        </span>
                      </td>

                      {/* Streak */}
                      <td className="px-4 py-3 text-center">
                        {entry.winStreak > 0 && (
                          <span className="text-amber-500">
                            🔥 {entry.winStreak}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User's Position (if not in top 100) */}
      {currentUserId && (
        <div className="bg-primary/10 border border-primary rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-2">Your Position</p>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold">#127</span>
              <span className="ml-3 text-muted-foreground">Gold II</span>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold">1,450 XP</p>
              <p className="text-sm text-muted-foreground">150 XP to Gold I</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
