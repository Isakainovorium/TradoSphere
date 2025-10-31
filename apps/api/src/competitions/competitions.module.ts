import { Module } from '@nestjs/common';
import { CompetitionsController } from './competitions.controller';
import { XpCalculatorService } from './services/xp-calculator.service';
import { RankingManagerService } from './services/ranking-manager.service';
import { MatchmakingQueueService } from './services/matchmaking-queue.service';
import { MatchmakingAlgorithmService } from './services/matchmaking-algorithm.service';

/**
 * Competitions Module
 * Handles all competition-related functionality including ranked matchmaking
 */
@Module({
  controllers: [CompetitionsController],
  providers: [
    XpCalculatorService,
    RankingManagerService,
    MatchmakingQueueService,
    MatchmakingAlgorithmService,
  ],
  exports: [
    XpCalculatorService,
    RankingManagerService,
    MatchmakingQueueService,
    MatchmakingAlgorithmService,
  ],
})
export class CompetitionsModule {}
