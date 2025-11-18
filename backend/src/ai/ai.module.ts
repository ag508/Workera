import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { AIRankingService } from './ai-ranking.service';

@Module({
  controllers: [AiController],
  providers: [AiService, AIRankingService],
  exports: [AiService, AIRankingService],
})
export class AiModule {}
