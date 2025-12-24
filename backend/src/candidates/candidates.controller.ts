import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { CandidatesService } from './candidates.service';

export class CreateCandidateDto {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  location?: string;
  tenantId: string; // In production, this would come from auth context
}

export class UpdateCandidateDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  location?: string;
  skills?: string[];
  summary?: string;
  experience?: any[];
  education?: any[];
  certifications?: string[];
  projects?: any[];
  linkedin?: string;
  github?: string;
  portfolio?: string;
  tenantId: string;
}

export class UploadResumeDto {
  resumeText: string;
  tenantId: string; // In production, this would come from auth context
}

export class SearchCandidatesDto {
  skills?: string[];
  location?: string;
  tenantId: string; // In production, this would come from auth context
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  searchTerm?: string;
  createdAfter?: string; // ISO date string
  createdBefore?: string; // ISO date string
}

export class CreateApplicationDto {
  candidateId: string;
  jobId: string;
  tenantId: string;
}

export class UpdateApplicationStatusDto {
  status: string;
  tenantId: string;
}

export class BulkImportCandidatesDto {
  candidates: Array<{
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    location?: string;
    skills?: string[];
  }>;
  tenantId: string;
}

export class BulkUpdateApplicationStatusDto {
  applicationIds: string[];
  status: string;
  tenantId: string;
}

export class BulkTagCandidatesDto {
  candidateIds: string[];
  tags: string[];
  tenantId: string;
}

export class BulkSendEmailDto {
  candidateIds: string[];
  subject: string;
  message: string;
  tenantId: string;
}

export class BulkExportCandidatesDto {
  candidateIds: string[];
  tenantId: string;
}

export class BulkDeleteCandidatesDto {
  candidateIds: string[];
  tenantId: string;
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

  @Put(':id')
  async updateCandidate(
    @Param('id') id: string,
    @Body() dto: UpdateCandidateDto
  ) {
    const candidate = await this.candidatesService.updateCandidate(
      id,
      dto,
      dto.tenantId || 'default-tenant'
    );
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
    const result = await this.candidatesService.searchCandidates({
      skills: dto.skills,
      location: dto.location,
      tenantId: dto.tenantId || 'default-tenant',
      page: dto.page,
      limit: dto.limit,
      sortBy: dto.sortBy,
      sortOrder: dto.sortOrder,
      searchTerm: dto.searchTerm,
      createdAfter: dto.createdAfter ? new Date(dto.createdAfter) : undefined,
      createdBefore: dto.createdBefore ? new Date(dto.createdBefore) : undefined,
    });
    return {
      success: true,
      ...result,
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

  @Post('applications')
  async createApplication(@Body() dto: CreateApplicationDto) {
    const application = await this.candidatesService.createApplication(dto);
    return {
      success: true,
      data: application,
    };
  }

  @Put('applications/:id/status')
  async updateApplicationStatus(
    @Param('id') id: string,
    @Body() dto: UpdateApplicationStatusDto
  ) {
    const application = await this.candidatesService.updateApplicationStatus(
      id,
      dto.status,
      dto.tenantId || 'default-tenant'
    );
    return {
      success: true,
      data: application,
    };
  }

  // Bulk Operations

  @Post('bulk/import')
  async bulkImportCandidates(@Body() dto: BulkImportCandidatesDto) {
    const result = await this.candidatesService.bulkImportCandidates(
      dto.candidates,
      dto.tenantId || 'default-tenant'
    );
    return {
      success: true,
      data: result,
    };
  }

  @Put('bulk/applications/status')
  async bulkUpdateApplicationStatus(@Body() dto: BulkUpdateApplicationStatusDto) {
    const result = await this.candidatesService.bulkUpdateApplicationStatus(
      dto.applicationIds,
      dto.status,
      dto.tenantId || 'default-tenant'
    );
    return {
      success: true,
      data: result,
    };
  }

  @Post('bulk/tag')
  async bulkTagCandidates(@Body() dto: BulkTagCandidatesDto) {
    const result = await this.candidatesService.bulkTagCandidates(
      dto.candidateIds,
      dto.tags,
      dto.tenantId || 'default-tenant'
    );
    return {
      success: true,
      data: result,
    };
  }

  @Post('bulk/email')
  async bulkSendEmail(@Body() dto: BulkSendEmailDto) {
    const result = await this.candidatesService.bulkSendEmail(
      dto.candidateIds,
      dto.subject,
      dto.message,
      dto.tenantId || 'default-tenant'
    );
    return {
      success: true,
      data: result,
    };
  }

  @Post('bulk/export')
  async bulkExportCandidates(@Body() dto: BulkExportCandidatesDto) {
    const candidates = await this.candidatesService.bulkExportCandidates(
      dto.candidateIds,
      dto.tenantId || 'default-tenant'
    );
    return {
      success: true,
      data: candidates,
    };
  }

  @Post('bulk/delete')
  async bulkDeleteCandidates(@Body() dto: BulkDeleteCandidatesDto) {
    const result = await this.candidatesService.bulkDeleteCandidates(
      dto.candidateIds,
      dto.tenantId || 'default-tenant'
    );
    return {
      success: true,
      data: result,
    };
  }
}
