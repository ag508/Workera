import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { CandidatesService } from './candidates.service';

export class CreateCandidateDto {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  location?: string;
  tenantId: string; // In production, this would come from auth context
}

export class UploadResumeDto {
  resumeText: string;
  tenantId: string; // In production, this would come from auth context
}

export class SearchCandidatesDto {
  skills?: string[];
  location?: string;
  tenantId: string; // In production, this would come from auth context
}

@Controller('candidates')
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  @Post()
  async createCandidate(@Body() dto: CreateCandidateDto) {
    const candidate = await this.candidatesService.createCandidate(dto);
    return {
      success: true,
      data: candidate,
    };
  }

  @Get()
  async getAllCandidates(@Query('tenantId') tenantId: string) {
    // In production, tenantId comes from authenticated user context
    const candidates = await this.candidatesService.getAllCandidates(tenantId || 'default-tenant');
    return {
      success: true,
      data: candidates,
    };
  }

  @Get(':id')
  async getCandidate(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string
  ) {
    const candidate = await this.candidatesService.getCandidateById(id, tenantId || 'default-tenant');
    return {
      success: !!candidate,
      data: candidate,
    };
  }

  @Post(':id/resume')
  async uploadResume(
    @Param('id') id: string,
    @Body() dto: UploadResumeDto
  ) {
    const resume = await this.candidatesService.uploadResume(
      id,
      dto.resumeText,
      dto.tenantId || 'default-tenant'
    );
    return {
      success: true,
      data: resume,
    };
  }

  @Post('search')
  async searchCandidates(@Body() dto: SearchCandidatesDto) {
    const candidates = await this.candidatesService.searchCandidates({
      ...dto,
      tenantId: dto.tenantId || 'default-tenant',
    });
    return {
      success: true,
      data: candidates,
    };
  }

  @Post(':id/analyze')
  async analyzeCandidate(
    @Param('id') id: string,
    @Body() body: { jobDescription: string; tenantId?: string }
  ) {
    const result = await this.candidatesService.analyzeCandidate(
      id,
      body.jobDescription,
      body.tenantId || 'default-tenant'
    );
    return {
      success: true,
      data: result,
    };
  }
}
