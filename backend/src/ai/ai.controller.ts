import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';

export class GenerateJDDto {
  jobTitle: string;
  company?: string;
  requirements?: string[];
}

export class AnalyzeResumeDto {
  resumeText: string;
  jobDescription: string;
}

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-jd')
  async generateJobDescription(@Body() dto: GenerateJDDto) {
    const jobDescription = await this.aiService.generateJobDescription(
      dto.jobTitle,
      dto.company,
      dto.requirements,
    );

    return {
      success: true,
      data: {
        jobDescription,
      },
    };
  }

  @Post('analyze-resume')
  async analyzeResume(@Body() dto: AnalyzeResumeDto) {
    const analysis = await this.aiService.analyzeResume(
      dto.resumeText,
      dto.jobDescription,
    );

    return {
      success: true,
      data: analysis,
    };
  }
}
