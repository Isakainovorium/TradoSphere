'use client';

import { RankTier } from '@tradosphere/types/competitions';

interface RankBadgeProps {
  rank: RankTier;
  xp?: number;
  size?: 'sm' | 'md' | 'lg';
  showXp?: boolean;
}

export function RankBadge({ rank, xp, size = 'md', showXp = false }: RankBadgeProps) {
  const emoji = getRankEmoji(rank);
  const color = getRankColor(rank);

  const sizeClasses = {
    sm: 'text-sm px-2 py-1',
    md: 'text-base px-3 py-1.5',
    lg: 'text-lg px-4 py-2',
  };

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border-2 font-semibold ${sizeClasses[size]}`}
      style={{ borderColor: color }}
    >
      <span className={size === 'lg' ? 'text-2xl' : 'text-lg'}>{emoji}</span>
      <span style={{ color }}>{rank}</span>
      {showXp && xp !== undefined && (
        <span className="text-muted-foreground text-sm">({xp} XP)</span>
      )}
    </div>
  );
}

interface RankProgressProps {
  currentXp: number;
  currentRank: RankTier;
  nextRank: RankTier | null;
  xpToNextRank: number | null;
}

export function RankProgress({
  currentXp,
  currentRank,
  nextRank,
  xpToNextRank,
}: RankProgressProps) {
  const progress = nextRank && xpToNextRank
    ? Math.max(0, Math.min(100, ((currentXp / (currentXp + xpToNextRank)) * 100)))
    : 100;

  const currentColor = getRankColor(currentRank);
  const nextColor = nextRank ? getRankColor(nextRank) : currentColor;

  return (
    <div className="space-y-2">
      {/* Current and Next Rank */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span>{getRankEmoji(currentRank)}</span>
          <span className="font-semibold" style={{ color: currentColor }}>
            {currentRank}
          </span>
        </div>

        {nextRank ? (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">→</span>
            <span>{getRankEmoji(nextRank)}</span>
            <span className="font-semibold" style={{ color: nextColor }}>
              {nextRank}
            </span>
          </div>
        ) : (
          <span className="text-amber-500 font-semibold">MAX RANK</span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="relative w-full h-3 bg-muted rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full rounded-full transition-all duration-300"
          style={{
            width: `${progress}%`,
            background: `linear-gradient(to right, ${currentColor}, ${nextColor})`,
          }}
        />
      </div>

      {/* XP Info */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{currentXp} XP</span>
        {xpToNextRank !== null && <span>{xpToNextRank} XP to rank up</span>}
      </div>
    </div>
  );
}

// Helper functions
function getRankEmoji(rank: RankTier): string {
  if (rank.startsWith('Bronze')) return '🥉';
  if (rank.startsWith('Silver')) return '🥈';
  if (rank.startsWith('Gold')) return '🥇';
  if (rank.startsWith('Platinum')) return '💎';
  if (rank.startsWith('Diamond')) return '💠';
  if (rank === 'Champion') return '👑';
  return '🥉';
}

function getRankColor(rank: RankTier): string {
  if (rank.startsWith('Bronze')) return '#CD7F32';
  if (rank.startsWith('Silver')) return '#C0C0C0';
  if (rank.startsWith('Gold')) return '#FFD700';
  if (rank.startsWith('Platinum')) return '#E5E4E2';
  if (rank.startsWith('Diamond')) return '#B9F2FF';
  if (rank === 'Champion') return '#FFD700';
  return '#CD7F32';
}
