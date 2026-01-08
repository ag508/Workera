import { Controller, Get, Post, Delete, Param, Query, Body } from '@nestjs/common';
import { GDPRService } from './gdpr.service';

export class ExportDataDto {
  tenantId: string;
}

export class DeleteDataDto {
  tenantId: string;
  hardDelete?: boolean;
  keepApplicationHistory?: boolean;
}

@Controller('gdpr')
export class GDPRController {
  constructor(private readonly gdprService: GDPRService) { }

  @Get('export/:candidateId')
  async exportCandidateData(
    @Param('candidateId') candidateId: string,
    @Query('tenantId') tenantId: string
  ) {
    const data = await this.gdprService.exportCandidateData(
      candidateId,
      tenantId || '11111111-1111-1111-1111-111111111111'
    );
    return {
      success: true,
      data,
    };
  }

  @Delete('delete/:candidateId')
  async deleteCandidateData(
    @Param('candidateId') candidateId: string,
    @Body() dto: DeleteDataDto
  ) {
    const report = await this.gdprService.deleteCandidateData(
      candidateId,
      dto.tenantId || '11111111-1111-1111-1111-111111111111',
      {
        hardDelete: dto.hardDelete,
        keepApplicationHistory: dto.keepApplicationHistory,
      }
    );
    return {
      success: true,
      data: report,
    };
  }

  @Get('retention-report')
  async getDataRetentionReport(@Query('tenantId') tenantId: string) {
    const report = await this.gdprService.getDataRetentionReport(
      tenantId || '11111111-1111-1111-1111-111111111111'
    );
    return {
      success: true,
      data: report,
    };
  }

  @Get('find-by-email')
  async findCandidateByEmail(
    @Query('email') email: string,
    @Query('tenantId') tenantId: string
  ) {
    const candidate = await this.gdprService.findCandidateByEmail(
      email,
      tenantId || '11111111-1111-1111-1111-111111111111'
    );
    return {
      success: !!candidate,
      data: candidate ? { id: candidate.id, email: candidate.email } : null,
    };
  }

  @Get('consent/:candidateId')
  async verifyConsent(
    @Param('candidateId') candidateId: string,
    @Query('tenantId') tenantId: string
  ) {
    const consent = await this.gdprService.verifyConsent(
      candidateId,
      tenantId || '11111111-1111-1111-1111-111111111111'
    );
    return {
      success: true,
      data: consent,
    };
  }
}
