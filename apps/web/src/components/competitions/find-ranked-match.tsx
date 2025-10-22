'use client';

import { useState } from 'react';
import { MatchmakingFormat, RankTier } from '@tradosphere/types/competitions';

interface FindRankedMatchProps {
  userRank: RankTier;
  userXp: number;
  winStreak: number;
  seasonWins: number;
  seasonLosses: number;
}

export function FindRankedMatch({
  userRank,
  userXp,
  winStreak,
  seasonWins,
  seasonLosses,
}: FindRankedMatchProps) {
  const [selectedFormat, setSelectedFormat] = useState<MatchmakingFormat>('1v1');
  const [selectedDuration, setSelectedDuration] = useState<number>(72);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTime, setSearchTime] = useState(0);

  const winRate =
    seasonWins + seasonLosses > 0
      ? Math.round((seasonWins / (seasonWins + seasonLosses)) * 100)
      : 0;

  const handleFindMatch = async () => {
    setIsSearching(true);
    setSearchTime(0);

    // TODO: Call API to join queue
    try {
      const response = await fetch('/api/competitions/ranked/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format: selectedFormat,
          durationHours: selectedDuration,
        }),
      });

      if (response.ok) {
        // Start search timer
        const interval = setInterval(() => {
          setSearchTime((prev) => prev + 1);
        }, 1000);

        // TODO: Poll for match found or use WebSocket
      }
    } catch (error) {
      console.error('Error joining queue:', error);
      setIsSearching(false);
    }
  };

  const handleCancelSearch = async () => {
    try {
      await fetch('/api/competitions/ranked/queue', { method: 'DELETE' });
      setIsSearching(false);
      setSearchTime(0);
    } catch (error) {
      console.error('Error leaving queue:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">🏆 Ranked Matchmaking</h1>
        <p className="text-muted-foreground">
          Compete against traders at your skill level
        </p>
      </div>

      {/* User Stats Card */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Your Rank</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl">
                {getRankEmoji(userRank)}
              </span>
              <span className="text-xl font-bold">{userRank}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {userXp} XP
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm text-muted-foreground">Season Stats</p>
            <p className="text-lg font-semibold">
              {seasonWins}-{seasonLosses} ({winRate}% WR)
            </p>
            {winStreak > 0 && (
              <p className="text-sm text-amber-500">
                🔥 Win Streak: {winStreak}
              </p>
            )}
          </div>
        </div>
      </div>

      {!isSearching ? (
        /* Search Configuration */
        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Select Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: '1v1', label: '1v1', desc: 'Head-to-head' },
                { value: '2v2', label: '2v2', desc: 'Team match' },
                { value: '3v3', label: '3v3', desc: 'Team match' },
                { value: 'battle_royal', label: 'Battle Royal', desc: '8 players' },
              ].map((format) => (
                <button
                  key={format.value}
                  onClick={() => setSelectedFormat(format.value as MatchmakingFormat)}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    selectedFormat === format.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="font-semibold">{format.label}</div>
                  <div className="text-sm text-muted-foreground">{format.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Duration Selection */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Competition Duration
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 24, label: '1 Day', desc: 'Quick match' },
                { value: 72, label: '3 Days', desc: 'Standard' },
                { value: 168, label: '1 Week', desc: 'Long form' },
              ].map((duration) => (
                <button
                  key={duration.value}
                  onClick={() => setSelectedDuration(duration.value)}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    selectedDuration === duration.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="font-semibold text-sm">{duration.label}</div>
                  <div className="text-xs text-muted-foreground">{duration.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="bg-muted rounded-lg p-4 space-y-2 text-sm">
            <p className="font-medium">Match Details:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• All trades verified via broker API</li>
              <li>• Win: +50 XP</li>
              <li>• Loss: -25 XP</li>
              <li>• Matchmaking range: ±100 XP (expands if no match)</li>
            </ul>
          </div>

          {/* Find Match Button */}
          <button
            onClick={handleFindMatch}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 rounded-lg transition-colors"
          >
            Find Ranked Match
          </button>
        </div>
      ) : (
        /* Searching State */
        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <h3 className="text-xl font-semibold mb-2">
              Searching for opponents...
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTime} seconds elapsed
            </p>
          </div>

          <div className="bg-muted rounded-lg p-4 space-y-2 text-sm">
            <p className="font-medium">Looking for:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Format: {selectedFormat.toUpperCase()}</li>
              <li>• Rank: {userRank} (±1 tier)</li>
              <li>• XP: {userXp} (±100 range)</li>
              <li>• Active in last 7 days</li>
            </ul>
          </div>

          {/* Cancel Button */}
          <button
            onClick={handleCancelSearch}
            className="w-full border border-border hover:bg-muted font-semibold py-3 rounded-lg transition-colors"
          >
            Cancel Search
          </button>
        </div>
      )}
    </div>
  );
}

// Helper function to get rank emoji
function getRankEmoji(rank: RankTier): string {
  if (rank.startsWith('Bronze')) return '🥉';
  if (rank.startsWith('Silver')) return '🥈';
  if (rank.startsWith('Gold')) return '🥇';
  if (rank.startsWith('Platinum')) return '💎';
  if (rank.startsWith('Diamond')) return '💠';
  if (rank === 'Champion') return '👑';
  return '🥉';
}
