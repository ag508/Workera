import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  Tenant, User, Job, Candidate, Resume, Application, Interview, AuditLog,
  EmailCampaign, ActivityFeed, ApplicationForm, FormSubmission, CandidateUser,
  // Requisition Management Entities
  BusinessUnit, Department, Location, CostCenter, JobGrade, Position,
  JobRequisition, ApprovalTransaction, ApprovalRule, RequisitionAuditLog,
  HiringTeamMember, BudgetReservation,
} from './entities';

// All entities array for TypeORM
const allEntities = [
  // Core Entities
  Tenant, User, Job, Candidate, Resume, Application, Interview, AuditLog,
  EmailCampaign, ActivityFeed, ApplicationForm, FormSubmission, CandidateUser,
  // Requisition Management Entities
  BusinessUnit, Department, Location, CostCenter, JobGrade, Position,
  JobRequisition, ApprovalTransaction, ApprovalRule, RequisitionAuditLog,
  HiringTeamMember, BudgetReservation,
];

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbType = configService.get<string>('DB_TYPE') || 'postgres';
        const entities = allEntities;

        if (dbType === 'sqlite') {
          return {
            type: 'sqlite' as const,
            database: 'workera.sqlite',
            entities,
            synchronize: true,
            logging: true,
          };
        }

        return {
          type: 'postgres' as const,
          host: configService.get<string>('DB_HOST') || 'localhost',
          port: parseInt(configService.get<string>('DB_PORT') || '5432', 10),
          username: configService.get<string>('DB_USERNAME') || 'postgres',
          password: configService.get<string>('DB_PASSWORD') || 'postgres',
          database: configService.get<string>('DB_NAME') || 'workera',
          entities,
          synchronize: configService.get<string>('NODE_ENV') !== 'production',
          logging: configService.get<string>('NODE_ENV') === 'development',
        };
      },
    }),
  ],
})
export class DatabaseModule {}
