import { Injectable, Logger } from '@nestjs/common';
import { XpCalculationResult } from '@tradosphere/types/competitions';

/**
 * XP Calculator Service
 * Calculates XP gains/losses for competition results
 */
@Injectable()
export class XpCalculatorService {
  private readonly logger = new Logger(XpCalculatorService.name);

  // Base XP values
  private readonly BASE_XP_WIN_1V1 = 50;
  private readonly BASE_XP_LOSS_1V1 = -25;
  private readonly BASE_XP_WIN_TEAM = 40;
  private readonly BASE_XP_LOSS_TEAM = -15;
  private readonly BASE_XP_BATTLE_ROYAL_TOP3 = 60;
  private readonly BASE_XP_BATTLE_ROYAL_4_10 = 20;
  private readonly BASE_XP_BATTLE_ROYAL_BELOW = -10;

  // Bonuses
  private readonly DAILY_ACTIVITY_XP = 2;
  private readonly WIN_STREAK_3_BONUS = 15;
  private readonly WIN_STREAK_5_BONUS = 30;

  /**
   * Calculate XP for competition result
   */
  calculateCompetitionXp(params: {
    competitionType: '1v1' | 'team' | 'battle_royal';
    placement: number; // 1st, 2nd, 3rd, etc.
    totalParticipants: number;
    userPnl: number;
    averagePnl: number;
    currentWinStreak: number;
    daysActiveThisWeek: number;
  }): XpCalculationResult {
    const {
      competitionType,
      placement,
      totalParticipants,
      userPnl,
      averagePnl,
      currentWinStreak,
      daysActiveThisWeek,
    } = params;

    // 1. Calculate base XP based on placement
    const baseXp = this.calculateBaseXp(
      competitionType,
      placement,
      totalParticipants,
    );

    // 2. Calculate performance multiplier based on P/L
    const performanceMultiplier = this.calculatePerformanceMultiplier(
      userPnl,
      averagePnl,
      placement,
    );

    // 3. Calculate win streak bonus
    const streakBonus = this.calculateStreakBonus(currentWinStreak, placement);

    // 4. Calculate consistency bonus
    const consistencyBonus = this.calculateConsistencyBonus(daysActiveThisWeek);

    // 5. Calculate total XP
    const totalXp = Math.round(
      baseXp * performanceMultiplier + streakBonus + consistencyBonus,
    );

    this.logger.debug('XP Calculation:', {
      baseXp,
      performanceMultiplier,
      streakBonus,
      consistencyBonus,
      totalXp,
    });

    return {
      baseXp,
      performanceMultiplier,
      streakBonus,
      consistencyBonus,
      totalXp,
    };
  }

  /**
   * Calculate base XP based on competition type and placement
   */
  private calculateBaseXp(
    competitionType: '1v1' | 'team' | 'battle_royal',
    placement: number,
    totalParticipants: number,
  ): number {
    switch (competitionType) {
      case '1v1':
        return placement === 1 ? this.BASE_XP_WIN_1V1 : this.BASE_XP_LOSS_1V1;

      case 'team':
        return placement === 1 ? this.BASE_XP_WIN_TEAM : this.BASE_XP_LOSS_TEAM;

      case 'battle_royal':
        if (placement <= 3) {
          return this.BASE_XP_BATTLE_ROYAL_TOP3;
        } else if (placement <= 10) {
          return this.BASE_XP_BATTLE_ROYAL_4_10;
        } else {
          return this.BASE_XP_BATTLE_ROYAL_BELOW;
        }

      default:
        return 0;
    }
  }

  /**
   * Calculate performance multiplier based on P/L vs average
   */
  private calculatePerformanceMultiplier(
    userPnl: number,
    averagePnl: number,
    placement: number,
  ): number {
    // Only apply multiplier for winners
    if (placement !== 1) {
      return 1.0;
    }

    // Avoid division by zero
    if (averagePnl === 0) {
      return 1.0;
    }

    // Calculate multiplier (capped between 0.5x and 2.0x)
    const multiplier = userPnl / averagePnl;
    return Math.max(0.5, Math.min(2.0, multiplier));
  }

  /**
   * Calculate win streak bonus
   */
  private calculateStreakBonus(
    currentWinStreak: number,
    placement: number,
  ): number {
    // Only apply to winners
    if (placement !== 1) {
      return 0;
    }

    // 5+ win streak: +30 XP
    if (currentWinStreak >= 5) {
      return this.WIN_STREAK_5_BONUS;
    }

    // 3+ win streak: +15 XP
    if (currentWinStreak >= 3) {
      return this.WIN_STREAK_3_BONUS;
    }

    return 0;
  }

  /**
   * Calculate consistency bonus based on daily activity
   */
  private calculateConsistencyBonus(daysActiveThisWeek: number): number {
    return daysActiveThisWeek * this.DAILY_ACTIVITY_XP;
  }

  /**
   * Calculate XP loss protection for losing streaks
   */
  calculateLossProtection(currentLossStreak: number, baseXpLoss: number): number {
    // 3+ loss streak: Reduce loss by 50%
    if (currentLossStreak >= 3) {
      return Math.round(baseXpLoss * 0.5);
    }

    return baseXpLoss;
  }

  /**
   * Calculate XP for hot streak (winning streak adjustment)
   */
  calculateHotStreakAdjustment(
    currentWinStreak: number,
    baseXpGain: number,
  ): number {
    // 5+ win streak: Reduce gain by 10% to prevent inflation
    if (currentWinStreak >= 5) {
      return Math.round(baseXpGain * 0.9);
    }

    return baseXpGain;
  }

  /**
   * Calculate rank decay for inactivity
   */
  calculateRankDecay(daysSinceLastActivity: number): number {
    if (daysSinceLastActivity >= 30) {
      return -100; // 30 days: -100 XP
    }

    if (daysSinceLastActivity >= 14) {
      return -50; // 14 days: -50 XP
    }

    return 0;
  }

  /**
   * Calculate XP for daily activity bonus
   */
  calculateDailyActivityXp(): number {
    return this.DAILY_ACTIVITY_XP;
  }
}
