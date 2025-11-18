import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { JobsModule } from './jobs/jobs.module';
import { AiModule } from './ai/ai.module';
import { CandidatesModule } from './candidates/candidates.module';
import { InterviewsModule } from './interviews/interviews.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { RealtimeModule } from './realtime/realtime.module';
import { GDPRModule } from './gdpr/gdpr.module';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    JobsModule,
    AiModule,
    CandidatesModule,
    InterviewsModule,
    AnalyticsModule,
    RealtimeModule,
    GDPRModule,
    AuditModule,
  ],
})
export class AppModule {}
