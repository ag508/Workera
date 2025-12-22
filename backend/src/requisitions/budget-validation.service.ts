import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  CostCenter,
  JobGrade,
  BudgetReservation,
} from '../database/entities/requisitions';

@Injectable()
export class BudgetValidationService {
  constructor(
    @InjectRepository(CostCenter)
    private readonly costCenterRepository: Repository<CostCenter>,
    @InjectRepository(JobGrade)
    private readonly jobGradeRepository: Repository<JobGrade>,
    @InjectRepository(BudgetReservation)
    private readonly budgetReservationRepository: Repository<BudgetReservation>,
    private readonly dataSource: DataSource,
  ) { }

  /**
   * Validate salary against job grade band
   */
  async validateSalaryBand(
    tenantId: string,
    jobGradeId: string,
    salaryMin: number,
    salaryMax: number,
  ): Promise<void> {
    const jobGrade = await this.jobGradeRepository.findOne({
      where: { id: jobGradeId, tenantId, isActive: true },
    });

    if (!jobGrade) {
      throw new BadRequestException('Invalid job grade');
    }

    // Check if salary range is within the grade band
    if (salaryMin < jobGrade.salaryMin) {
      throw new BadRequestException(
        `Minimum salary ${salaryMin} is below the grade minimum of ${jobGrade.salaryMin}`,
      );
    }

    if (salaryMax > jobGrade.salaryMax) {
      throw new BadRequestException(
        `Maximum salary ${salaryMax} exceeds the grade maximum of ${jobGrade.salaryMax}`,
      );
    }

    if (salaryMin > salaryMax) {
      throw new BadRequestException('Minimum salary cannot exceed maximum salary');
    }
  }

  /**
   * Validate budget availability in cost center
   */
  async validateBudgetAvailability(
    tenantId: string,
    costCenterId: string,
    requiredAmount: number,
  ): Promise<{ available: boolean; availableAmount: number; message?: string }> {
    const costCenter = await this.costCenterRepository.findOne({
      where: { id: costCenterId, tenantId, isActive: true },
    });

    if (!costCenter) {
      throw new BadRequestException('Invalid cost center');
    }

    const availableAmount =
      Number(costCenter.budgetAmount) -
      Number(costCenter.usedAmount) -
      Number(costCenter.reservedAmount);

    if (availableAmount < requiredAmount) {
      return {
        available: false,
        availableAmount,
        message: `Insufficient budget. Available: ${availableAmount}, Required: ${requiredAmount}`,
      };
    }

    return { available: true, availableAmount };
  }

  /**
   * Reserve budget for a requisition
   */
  async reserveBudget(
    tenantId: string,
    requisitionId: string,
    costCenterId: string,
    amount: number,
    userId: string,
  ): Promise<BudgetReservation> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Lock cost center for update
      const costCenter = await queryRunner.manager.findOne(CostCenter, {
        where: { id: costCenterId, tenantId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!costCenter) {
        throw new BadRequestException('Cost center not found');
      }

      const availableAmount =
        Number(costCenter.budgetAmount) -
        Number(costCenter.usedAmount) -
        Number(costCenter.reservedAmount);

      if (availableAmount < amount) {
        throw new BadRequestException(
          `Insufficient budget. Available: ${availableAmount}, Required: ${amount}`,
        );
      }

      // Update cost center reserved amount
      costCenter.reservedAmount = Number(costCenter.reservedAmount) + amount;
      await queryRunner.manager.save(costCenter);

      // Create reservation record
      const reservation = queryRunner.manager.create(BudgetReservation, {
        requisitionId,
        tenantId,
        costCenterId,
        amount,
        status: 'RESERVED',
        headcount: 1,
        salaryPerHead: amount,
        createdBy: userId,
        reservedAt: new Date(),
      } as any);

      const saved = await queryRunner.manager.save(reservation);

      await queryRunner.commitTransaction();
      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Release reserved budget (for rejected/cancelled requisitions)
   */
  async releaseBudget(
    tenantId: string,
    requisitionId: string,
    userId: string,
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find active reservation
      const reservation = await queryRunner.manager.findOne(BudgetReservation, {
        where: { requisitionId, tenantId, status: 'RESERVED' },
      });

      if (!reservation) {
        // No active reservation to release
        await queryRunner.commitTransaction();
        return;
      }

      // Lock cost center for update
      const costCenter = await queryRunner.manager.findOne(CostCenter, {
        where: { id: reservation.costCenterId, tenantId },
        lock: { mode: 'pessimistic_write' },
      });

      if (costCenter) {
        costCenter.reservedAmount = Math.max(
          0,
          Number(costCenter.reservedAmount) - Number(reservation.amount),
        );
        await queryRunner.manager.save(costCenter);
      }

      // Update reservation status
      reservation.status = 'RELEASED';
      reservation.releasedAt = new Date();
      await queryRunner.manager.save(reservation);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Commit budget when position is filled
   */
  async commitBudget(
    tenantId: string,
    requisitionId: string,
    userId: string,
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find active reservation
      const reservation = await queryRunner.manager.findOne(BudgetReservation, {
        where: { requisitionId, tenantId, status: 'RESERVED' },
      });

      if (!reservation) {
        throw new BadRequestException('No active budget reservation found');
      }

      // Lock cost center for update
      const costCenter = await queryRunner.manager.findOne(CostCenter, {
        where: { id: reservation.costCenterId, tenantId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!costCenter) {
        throw new BadRequestException('Cost center not found');
      }

      // Move from reserved to used
      costCenter.reservedAmount = Math.max(
        0,
        Number(costCenter.reservedAmount) - Number(reservation.amount),
      );
      costCenter.usedAmount = Number(costCenter.usedAmount) + Number(reservation.amount);
      await queryRunner.manager.save(costCenter);

      // Update reservation status
      reservation.status = 'CONFIRMED';
      reservation.confirmedAt = new Date();
      await queryRunner.manager.save(reservation);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get budget summary for a cost center
   */
  async getBudgetSummary(
    tenantId: string,
    costCenterId: string,
  ): Promise<{
    total: number;
    used: number;
    reserved: number;
    available: number;
    utilizationPercent: number;
  }> {
    const costCenter = await this.costCenterRepository.findOne({
      where: { id: costCenterId, tenantId },
    });

    if (!costCenter) {
      throw new BadRequestException('Cost center not found');
    }

    const total = Number(costCenter.budgetAmount);
    const used = Number(costCenter.usedAmount);
    const reserved = Number(costCenter.reservedAmount);
    const available = total - used - reserved;

    return {
      total,
      used,
      reserved,
      available,
      utilizationPercent: total > 0 ? Math.round(((used + reserved) / total) * 100) : 0,
    };
  }

  /**
   * Get all reservations for a requisition
   */
  async getReservationsForRequisition(
    tenantId: string,
    requisitionId: string,
  ): Promise<BudgetReservation[]> {
    return this.budgetReservationRepository.find({
      where: { requisitionId, tenantId },
      order: { reservedAt: 'DESC' },
    });
  }
}
