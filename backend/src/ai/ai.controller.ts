import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';
import { AIRankingService } from './ai-ranking.service';

export class GenerateJDDto {
  jobTitle: string;
  company?: string;
  requirements?: string[];
}

export class AnalyzeResumeDto {
  resumeText: string;
  jobDescription: string;
}

export class ParseResumeDto {
  resumeText: string;
  tenantId?: string;
}

export class RankCandidateDto {
  candidate: {
    id: string;
    firstName: string;
    lastName: string;
    skills: string[];
    resumeText: string;
    experience?: any[];
    education?: any[];
  };
  job: {
    title: string;
    description: string;
    requiredSkills: string[];
    preferredSkills?: string[];
    experienceYears?: number;
  };
}

export class RankMultipleCandidatesDto {
  candidates: Array<{
    id: string;
    firstName: string;
    lastName: string;
    skills: string[];
    resumeText: string;
    experience?: any[];
    education?: any[];
  }>;
  job: {
    id: string;
    title: string;
    description: string;
    requiredSkills: string[];
    preferredSkills?: string[];
    experienceYears?: number;
  };
}

@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly rankingService: AIRankingService
  ) {}

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

  @Post('parse-resume')
  async parseResume(@Body() dto: ParseResumeDto) {
    const parsed = await this.aiService.parseResume(dto.resumeText);

    return {
      success: true,
      parsed,
      confidence: 0.85,
    };
  }

  @Post('rank-candidate')
  async rankCandidate(@Body() dto: RankCandidateDto) {
    const ranking = await this.rankingService.rankCandidate(
      dto.candidate,
      dto.job
    );

    return {
      success: true,
      data: ranking,
    };
  }

  @Post('rank-candidates')
  async rankMultipleCandidates(@Body() dto: RankMultipleCandidatesDto) {
    const rankings = await this.rankingService.rankMultipleCandidates(
      dto.candidates,
      dto.job
    );

    return {
      success: true,
      data: rankings,
    };
  }
}
