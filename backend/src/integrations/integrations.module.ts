import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Candidate } from '../database/entities/candidate.entity';
import { Resume } from '../database/entities/resume.entity';
import { Job } from '../database/entities/job.entity';
import { Application } from '../database/entities/application.entity';
import { ApplicationForm } from '../database/entities/application-form.entity';
import { FormSubmission } from '../database/entities/form-submission.entity';
import { CandidateUser } from '../database/entities/candidate-user.entity';
import { Tenant } from '../database/entities/tenant.entity';
import { IntegrationsController } from './integrations.controller';
import { DatabaseImportService } from './database-import.service';
import { LinkedInService } from './linkedin.service';
import { WorkdayService } from './workday.service';
import { NaukriService } from './naukri.service';
import { JobBoardsService } from './job-boards.service';
import { RecruitmentFormsService } from './recruitment-forms.service';
import { CandidatePortalService } from './candidate-portal.service';
import { IntegrationSettingsService } from './integration-settings.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Candidate,
      Resume,
      Job,
      Application,
      ApplicationForm,
      FormSubmission,
      CandidateUser,
      Tenant,
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
    AiModule,
  ],
  controllers: [IntegrationsController],
  providers: [
    DatabaseImportService,
    LinkedInService,
    WorkdayService,
    NaukriService,
    JobBoardsService,
    RecruitmentFormsService,
    CandidatePortalService,
    IntegrationSettingsService,
  ],
  exports: [
    DatabaseImportService,
    LinkedInService,
    WorkdayService,
    NaukriService,
    JobBoardsService,
    RecruitmentFormsService,
    CandidatePortalService,
  ],
})
export class IntegrationsModule {}
