import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  FindRankedMatchDto,
  AcceptMatchDto,
  DeclineMatchDto,
  LeaderboardResponse,
  RankProgressResponse,
  MatchFoundResponse,
} from '@tradosphere/types/competitions';
import { XpCalculatorService } from './services/xp-calculator.service';
import { RankingManagerService } from './services/ranking-manager.service';
import { MatchmakingQueueService } from './services/matchmaking-queue.service';
import { MatchmakingAlgorithmService } from './services/matchmaking-algorithm.service';

/**
 * Competitions Controller
 * API endpoints for competition matchmaking and rankings
 */
@Controller('competitions')
export class CompetitionsController {
  constructor(
    private readonly xpCalculator: XpCalculatorService,
    private readonly rankingManager: RankingManagerService,
    private readonly queueService: MatchmakingQueueService,
    private readonly matchmakingAlgorithm: MatchmakingAlgorithmService,
  ) {}

  // =====================================================
  // RANKED MATCHMAKING
  // =====================================================

  /**
   * Join ranked matchmaking queue
   * POST /competitions/ranked/queue
   */
  @Post('ranked/queue')
  @HttpCode(HttpStatus.CREATED)
  async joinRankedQueue(
    @Request() req: any,
    @Body() dto: FindRankedMatchDto,
  ) {
    const userId = req.user.id;

    // Get user's current ranking
    const ranking = await this.rankingManager.getOrCreateUserRanking(userId);

    // Join queue
    const queueEntry = await this.queueService.joinQueue({
      userId,
      userXp: ranking.currentXp,
      userRank: ranking.currentRank,
      dto,
    });

    return {
      queueId: queueEntry.id,
      status: queueEntry.status,
      searchingFor: dto.format,
      yourRank: ranking.currentRank,
      yourXp: ranking.currentXp,
      xpRange: {
        min: queueEntry.xpRangeMin,
        max: queueEntry.xpRangeMax,
      },
      expiresAt: queueEntry.expiresAt,
    };
  }

  /**
   * Leave ranked matchmaking queue
   * DELETE /competitions/ranked/queue
   */
  @Delete('ranked/queue')
  @HttpCode(HttpStatus.NO_CONTENT)
  async leaveRankedQueue(@Request() req: any) {
    const userId = req.user.id;
    await this.queueService.leaveQueue(userId);
  }

  /**
   * Get current queue status
   * GET /competitions/ranked/queue/status
   */
  @Get('ranked/queue/status')
  async getQueueStatus(@Request() req: any) {
    const userId = req.user.id;
    const queueEntry = await this.queueService.getUserQueueEntry(userId);

    if (!queueEntry) {
      return { inQueue: false };
    }

    return {
      inQueue: true,
      status: queueEntry.status,
      searchingFor: queueEntry.format,
      searchDuration: Date.now() - queueEntry.searchStartedAt.getTime(),
      xpRange: {
        min: queueEntry.xpRangeMin,
        max: queueEntry.xpRangeMax,
      },
      expiresAt: queueEntry.expiresAt,
    };
  }

  /**
   * Accept match
   * POST /competitions/ranked/match/accept
   */
  @Post('ranked/match/accept')
  @HttpCode(HttpStatus.OK)
  async acceptMatch(
    @Request() req: any,
    @Body() dto: AcceptMatchDto,
  ) {
    const userId = req.user.id;
    await this.queueService.acceptMatch(userId, dto.queueId);

    return {
      success: true,
      message: 'Match accepted. Competition will start when both players accept.',
    };
  }

  /**
   * Decline match
   * POST /competitions/ranked/match/decline
   */
  @Post('ranked/match/decline')
  @HttpCode(HttpStatus.OK)
  async declineMatch(
    @Request() req: any,
    @Body() dto: DeclineMatchDto,
  ) {
    const userId = req.user.id;
    await this.queueService.declineMatch(userId, dto.queueId);

    // Optionally rejoin queue
    return {
      success: true,
      message: 'Match declined. You can search for another match.',
    };
  }

  // =====================================================
  // RANKINGS & LEADERBOARD
  // =====================================================

  /**
   * Get user's ranking
   * GET /competitions/ranking
   */
  @Get('ranking')
  async getUserRanking(@Request() req: any) {
    const userId = req.user.id;
    const ranking = await this.rankingManager.getOrCreateUserRanking(userId);

    return ranking;
  }

  /**
   * Get rank progress
   * GET /competitions/ranking/progress
   */
  @Get('ranking/progress')
  async getRankProgress(@Request() req: any): Promise<RankProgressResponse> {
    const userId = req.user.id;
    const ranking = await this.rankingManager.getOrCreateUserRanking(userId);

    const { nextRank, xpNeeded } = this.rankingManager.getXpToNextRank(ranking.currentXp);

    const recentXpChanges = await this.rankingManager.getXpHistory(userId, 10);

    const progressPercentage = nextRank && xpNeeded
      ? Math.round(((ranking.currentXp - (ranking.currentXp - xpNeeded)) / xpNeeded) * 100)
      : 100;

    return {
      currentRank: ranking.currentRank,
      currentXp: ranking.currentXp,
      nextRank,
      xpToNextRank: xpNeeded,
      progressPercentage,
      recentXpChanges,
    };
  }

  /**
   * Get XP transaction history
   * GET /competitions/xp/history
   */
  @Get('xp/history')
  async getXpHistory(
    @Request() req: any,
    @Query('limit') limit?: number,
  ) {
    const userId = req.user.id;
    const history = await this.rankingManager.getXpHistory(userId, limit || 20);

    return { history };
  }

  /**
   * Get global leaderboard
   * GET /competitions/leaderboard
   */
  @Get('leaderboard')
  async getLeaderboard(
    @Query('seasonId') seasonId?: number,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<LeaderboardResponse> {
    const season = seasonId || 1;
    const rankings = await this.rankingManager.getGlobalLeaderboard({
      seasonId: season,
      limit: limit || 100,
      offset: offset || 0,
    });

    // TODO: Add username and avatar from profiles table
    const entries = rankings.map((r, index) => ({
      ...r,
      globalRank: (offset || 0) + index + 1,
      username: `User_${r.userId.substring(0, 8)}`, // Placeholder
      avatarUrl: null,
    }));

    return {
      seasonId: season,
      entries,
      currentUserRank: null, // TODO: Calculate user's rank
      totalPlayers: entries.length,
    };
  }

  /**
   * Get rank tier info
   * GET /competitions/ranks
   */
  @Get('ranks')
  async getRankTiers() {
    const { RANK_THRESHOLDS } = await import('@tradosphere/types/competitions');

    return {
      ranks: RANK_THRESHOLDS,
    };
  }

  // =====================================================
  // ADMIN / BACKGROUND JOBS
  // =====================================================

  /**
   * Run matchmaking (background job endpoint)
   * POST /competitions/admin/matchmaking/run
   */
  @Post('admin/matchmaking/run')
  async runMatchmaking(@Query('format') format: '1v1' | '2v2' | '3v3' | 'battle_royal') {
    const matches = await this.matchmakingAlgorithm.findMatches(format);

    return {
      matchesCreated: matches.length,
      matches: matches.map((m) => ({
        id: m.id,
        type: m.competitionType,
        participants: m.currentParticipants,
        avgXp: m.avgXp,
      })),
    };
  }

  /**
   * Clean expired queue entries (background job endpoint)
   * POST /competitions/admin/queue/clean
   */
  @Post('admin/queue/clean')
  async cleanExpiredQueue() {
    const cleaned = await this.queueService.cleanExpiredEntries();

    return {
      cleanedCount: cleaned,
    };
  }
}
