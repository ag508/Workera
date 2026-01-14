import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { JobsModule } from './jobs/jobs.module';
import { AiModule } from './ai/ai.module';
import { CandidatesModule } from './candidates/candidates.module';
import { InterviewsModule } from './interviews/interviews.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { RealtimeModule } from './realtime/realtime.module';
import { GDPRModule } from './gdpr/gdpr.module';
import { AuditModule } from './audit/audit.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { ActivityFeedModule } from './activity-feed/activity-feed.module';
import { NLPModule } from './nlp/nlp.module';
import { EmbeddingsModule } from './embeddings/embeddings.module';
import { SemanticSearchModule } from './semantic-search/semantic-search.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { HealthModule } from './health/health.module';
import { RequisitionsModule } from './requisitions/requisitions.module';
import { MessagesModule } from './messages/messages.module';
import { UsersModule } from './users/users.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Rate limiting configuration - tiered limits
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,    // 1 second
        limit: 3,     // 3 requests per second
      },
      {
        name: 'medium',
        ttl: 10000,   // 10 seconds
        limit: 20,    // 20 requests per 10 seconds
      },
      {
        name: 'long',
        ttl: 60000,   // 1 minute
        limit: 100,   // 100 requests per minute
      },
    ]),
    AuthModule,
    DatabaseModule,
    JobsModule,
    AiModule,
    CandidatesModule,
    InterviewsModule,
    AnalyticsModule,
    RealtimeModule,
    GDPRModule,
    AuditModule,
    CampaignsModule,
    ActivityFeedModule,
    NLPModule,
    EmbeddingsModule,
    SemanticSearchModule,
    IntegrationsModule,
    HealthModule,
    RequisitionsModule,
    MessagesModule,
    UsersModule,
  ],
  providers: [
    // Global JWT Authentication Guard
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Global Rate Limiting Guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
