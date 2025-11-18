import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { AiService } from '../ai/ai.service';

export class CreateJobDto {
  title: string;
  description?: string;
  company?: string;
  generateWithAI?: boolean;
}

export class PostJobDto {
  channels: string[];
}

@Controller('jobs')
export class JobsController {
  constructor(
    private readonly jobsService: JobsService,
    private readonly aiService: AiService,
  ) {}

  @Get()
  getAllJobs() {
    return {
      success: true,
      data: this.jobsService.getAllJobs(),
    };
  }

  @Get(':id')
  getJob(@Param('id') id: string) {
    const job = this.jobsService.getJobById(id);
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
      );
    }

    const job = this.jobsService.createJob(
      dto.title,
      description || '',
      dto.company,
    );

    return {
      success: true,
      data: job,
    };
  }

  @Put(':id/post')
  postJob(@Param('id') id: string, @Body() dto: PostJobDto) {
    const job = this.jobsService.postJob(id, dto.channels);

    return {
      success: !!job,
      data: job,
    };
  }
}
