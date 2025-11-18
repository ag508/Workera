import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Candidate, Resume, Application } from '../database/entities';
import { CandidatesController } from './candidates.controller';
import { CandidatesService } from './candidates.service';
import { ResumeParserService } from './resume-parser.service';
import { AiModule } from '../ai/ai.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Candidate, Resume, Application]),
    AiModule,
    NotificationsModule,
  ],
  controllers: [CandidatesController],
  providers: [CandidatesService, ResumeParserService],
  exports: [CandidatesService, ResumeParserService],
})
export class CandidatesModule {}
