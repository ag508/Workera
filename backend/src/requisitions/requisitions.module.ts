import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  JobRequisition,
  ApprovalTransaction,
  ApprovalRule,
  RequisitionAuditLog,
  HiringTeamMember,
  BudgetReservation,
  CostCenter,
  JobGrade,
  Department,
  Location,
  Position,
  BusinessUnit,
} from '../database/entities/requisitions';
import { RequisitionsController } from './requisitions.controller';
import { RequisitionsService } from './requisitions.service';
import { ApprovalWorkflowService } from './approval-workflow.service';
import { BudgetValidationService } from './budget-validation.service';
import { RequisitionAuditService } from './requisition-audit.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Core entities
      JobRequisition,
      ApprovalTransaction,
      ApprovalRule,
      RequisitionAuditLog,
      HiringTeamMember,
      BudgetReservation,
      // Master data entities
      CostCenter,
      JobGrade,
      Department,
      Location,
      Position,
      BusinessUnit,
    ]),
  ],
  controllers: [RequisitionsController],
  providers: [
    RequisitionsService,
    ApprovalWorkflowService,
    BudgetValidationService,
    RequisitionAuditService,
  ],
  exports: [
    RequisitionsService,
    ApprovalWorkflowService,
    BudgetValidationService,
    RequisitionAuditService,
  ],
})
export class RequisitionsModule {}
