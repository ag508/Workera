import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { AiService } from '../ai/ai.service';

export class CreateJobDto {
  title: string;
  description?: string;
  company?: string;
  generateWithAI?: boolean;
  tenantId?: string; // In production, from auth context
  requirements?: string[];
}

export class PostJobDto {
  channels: string[];
  tenantId?: string; // In production, from auth context
}

@Controller('jobs')
export class JobsController {
  constructor(
    private readonly jobsService: JobsService,
    private readonly aiService: AiService,
  ) {}

  @Get()
  async getAllJobs(@Query('tenantId') tenantId?: string) {
    const jobs = await this.jobsService.getAllJobs(tenantId || 'default-tenant');
    return {
      success: true,
      data: jobs,
    };
  }

  @Get(':id')
  async getJob(
    @Param('id') id: string,
    @Query('tenantId') tenantId?: string
  ) {
    const job = await this.jobsService.getJobById(id, tenantId || 'default-tenant');
    return {
      success: !!job,
      data: job,
    };
  }

  @Post()
  async createJob(@Body() dto: CreateJobDto) {
    let description = dto.description;

    if (dto.generateWithAI && !description) {
      description = await this.aiService.generateJobDescription(
        dto.title,
        dto.company,
        dto.requirements,
      );
    }

    const job = await this.jobsService.createJob(
      dto.title,
      description || '',
      dto.tenantId || 'default-tenant',
      dto.company,
      dto.requirements,
    );

    return {
      success: true,
      data: job,
    };
  }

  @Put(':id/post')
  async postJob(@Param('id') id: string, @Body() dto: PostJobDto) {
    const job = await this.jobsService.postJob(
      id,
      dto.tenantId || 'default-tenant',
      dto.channels
    );

    return {
      success: !!job,
      data: job,
    };
  }
}
