import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Candidate } from '../database/entities/candidate.entity';
import { Resume } from '../database/entities/resume.entity';
import { Job } from '../database/entities/job.entity';
import { Application } from '../database/entities/application.entity';
import { IntegrationsController } from './integrations.controller';
import { DatabaseImportService } from './database-import.service';
import { LinkedInService } from './linkedin.service';
import { WorkdayService } from './workday.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Candidate, Resume, Job, Application]),
    AiModule,
  ],
  controllers: [IntegrationsController],
  providers: [DatabaseImportService, LinkedInService, WorkdayService],
  exports: [DatabaseImportService, LinkedInService, WorkdayService],
})
export class IntegrationsModule {}
