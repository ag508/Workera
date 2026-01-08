import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Candidate } from '../database/entities/candidate.entity';
import { Resume } from '../database/entities/resume.entity';
import { Job } from '../database/entities/job.entity';
import { Application } from '../database/entities/application.entity';
import { ApplicationForm } from '../database/entities/application-form.entity';
import { FormSubmission } from '../database/entities/form-submission.entity';
import { CandidateUser } from '../database/entities/candidate-user.entity';
import { Tenant } from '../database/entities/tenant.entity';
import { Interview } from '../database/entities/interview.entity';
import { IntegrationsController } from './integrations.controller';
import { OAuthCallbackController } from './oauth-callback.controller';
import { DatabaseImportService } from './database-import.service';
import { LinkedInService } from './linkedin.service';
import { LinkedInOAuthService } from './linkedin-oauth.service';
import { WorkdayService } from './workday.service';
import { NaukriService } from './naukri.service';
import { IndeedService } from './indeed.service';
import { JobBoardsService } from './job-boards.service';
import { GoogleCalendarService } from './google-calendar.service';
import { EmailService } from './email.service';
import { RecruitmentFormsService } from './recruitment-forms.service';
import { CandidatePortalService } from './candidate-portal.service';
import { CandidatePortalEnhancedService } from './candidate-portal-enhanced.service';
import { IntegrationSettingsService } from './integration-settings.service';
import { AIResumeParserService } from '../candidates/ai-resume-parser.service';
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
      Interview,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
    AiModule,
  ],
  controllers: [
    IntegrationsController,
    OAuthCallbackController,
  ],
  providers: [
    DatabaseImportService,
    LinkedInService,
    LinkedInOAuthService,
    WorkdayService,
    NaukriService,
    IndeedService,
    JobBoardsService,
    GoogleCalendarService,
    EmailService,
    RecruitmentFormsService,
    CandidatePortalService,
    CandidatePortalEnhancedService,
    IntegrationSettingsService,
    AIResumeParserService,
  ],
  exports: [
    DatabaseImportService,
    LinkedInService,
    LinkedInOAuthService,
    WorkdayService,
    NaukriService,
    IndeedService,
    JobBoardsService,
    GoogleCalendarService,
    EmailService,
    RecruitmentFormsService,
    CandidatePortalService,
    CandidatePortalEnhancedService,
    IntegrationSettingsService,
  ],
})
export class IntegrationsModule { }
