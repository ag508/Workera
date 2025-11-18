import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';

export interface CandidateRanking {
  candidateId: string;
  candidateName: string;
  score: number; // 0-100
  reasoning: string;
  strengths: string[];
  weaknesses: string[];
  recommendation: 'strong_match' | 'good_match' | 'moderate_match' | 'weak_match' | 'poor_match';
  skillMatchPercentage: number;
  experienceMatch: string;
}

export interface RankedCandidateList {
  jobId: string;
  jobTitle: string;
  rankings: CandidateRanking[];
  totalCandidates: number;
  generatedAt: Date;
}

@Injectable()
export class AIRankingService {
  private readonly logger = new Logger(AIRankingService.name);
  private genAI: GoogleGenerativeAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GOOGLE_AI_API_KEY');
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.logger.log('AI Ranking Service initialized');
    } else {
      this.logger.warn('GOOGLE_AI_API_KEY not found - AI ranking will not be available');
    }
  }

  /**
   * Rank a single candidate against a job description
   */
  async rankCandidate(
    candidateData: {
      id: string;
      firstName: string;
      lastName: string;
      skills: string[];
      resumeText: string;
      experience?: any[];
      education?: any[];
    },
    jobRequirements: {
      title: string;
      description: string;
      requiredSkills: string[];
      preferredSkills?: string[];
      experienceYears?: number;
    }
  ): Promise<CandidateRanking> {
    if (!this.genAI) {
      throw new Error('AI service not initialized');
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `You are an expert HR professional and recruitment AI. Analyze the following candidate against the job requirements and provide a detailed ranking.

JOB REQUIREMENTS:
Title: ${jobRequirements.title}
Description: ${jobRequirements.description}
Required Skills: ${jobRequirements.requiredSkills.join(', ')}
${jobRequirements.preferredSkills ? `Preferred Skills: ${jobRequirements.preferredSkills.join(', ')}` : ''}
${jobRequirements.experienceYears ? `Required Experience: ${jobRequirements.experienceYears} years` : ''}

CANDIDATE PROFILE:
Name: ${candidateData.firstName} ${candidateData.lastName}
Skills: ${candidateData.skills.join(', ')}
Resume Summary:
${candidateData.resumeText.substring(0, 2000)}

Provide your analysis in the following JSON format (respond with ONLY valid JSON, no markdown):
{
  "score": <number 0-100>,
  "reasoning": "<detailed explanation of the score>",
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "weaknesses": ["<weakness 1>", "<weakness 2>", ...],
  "recommendation": "<strong_match|good_match|moderate_match|weak_match|poor_match>",
  "skillMatchPercentage": <number 0-100>,
  "experienceMatch": "<brief assessment of experience level fit>"
}

Scoring Guidelines:
- 90-100: Exceptional match, exceeds requirements
- 75-89: Strong match, meets all key requirements
- 60-74: Good match, meets most requirements
- 40-59: Moderate match, some gaps
- 0-39: Poor match, significant gaps`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();

      // Parse the AI response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid AI response format');
      }

      const analysis = JSON.parse(jsonMatch[0]);

      const ranking: CandidateRanking = {
        candidateId: candidateData.id,
        candidateName: `${candidateData.firstName} ${candidateData.lastName}`,
        score: analysis.score,
        reasoning: analysis.reasoning,
        strengths: analysis.strengths || [],
        weaknesses: analysis.weaknesses || [],
        recommendation: analysis.recommendation || 'moderate_match',
        skillMatchPercentage: analysis.skillMatchPercentage || 0,
        experienceMatch: analysis.experienceMatch || 'Unknown',
      };

      this.logger.log(`Ranked candidate ${candidateData.id} with score ${ranking.score}`);
      return ranking;

    } catch (error) {
      this.logger.error(`Error ranking candidate: ${error.message}`);

      // Fallback to basic skill matching if AI fails
      return this.fallbackRanking(candidateData, jobRequirements);
    }
  }

  /**
   * Rank multiple candidates against a job and return sorted list
   */
  async rankMultipleCandidates(
    candidates: Array<{
      id: string;
      firstName: string;
      lastName: string;
      skills: string[];
      resumeText: string;
      experience?: any[];
      education?: any[];
    }>,
    jobRequirements: {
      id: string;
      title: string;
      description: string;
      requiredSkills: string[];
      preferredSkills?: string[];
      experienceYears?: number;
    }
  ): Promise<RankedCandidateList> {
    this.logger.log(`Ranking ${candidates.length} candidates for job ${jobRequirements.id}`);

    const rankings: CandidateRanking[] = [];

    // Rank each candidate (with rate limiting to avoid API limits)
    for (const candidate of candidates) {
      try {
        const ranking = await this.rankCandidate(candidate, jobRequirements);
        rankings.push(ranking);

        // Small delay to avoid rate limits (500ms between requests)
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        this.logger.error(`Failed to rank candidate ${candidate.id}: ${error.message}`);
        // Continue with other candidates
      }
    }

    // Sort by score (highest first)
    rankings.sort((a, b) => b.score - a.score);

    return {
      jobId: jobRequirements.id,
      jobTitle: jobRequirements.title,
      rankings,
      totalCandidates: candidates.length,
      generatedAt: new Date(),
    };
  }

  /**
   * Fallback ranking method using basic skill matching (when AI is unavailable)
   */
  private fallbackRanking(
    candidateData: {
      id: string;
      firstName: string;
      lastName: string;
      skills: string[];
      resumeText: string;
    },
    jobRequirements: {
      title: string;
      description: string;
      requiredSkills: string[];
      preferredSkills?: string[];
    }
  ): CandidateRanking {
    const candidateSkills = candidateData.skills.map(s => s.toLowerCase());
    const requiredSkills = jobRequirements.requiredSkills.map(s => s.toLowerCase());
    const preferredSkills = (jobRequirements.preferredSkills || []).map(s => s.toLowerCase());

    // Calculate skill match
    const requiredMatches = requiredSkills.filter(skill =>
      candidateSkills.some(cs => cs.includes(skill) || skill.includes(cs))
    ).length;

    const preferredMatches = preferredSkills.filter(skill =>
      candidateSkills.some(cs => cs.includes(skill) || skill.includes(cs))
    ).length;

    const requiredMatchPercent = requiredSkills.length > 0
      ? (requiredMatches / requiredSkills.length) * 100
      : 50;

    const preferredMatchPercent = preferredSkills.length > 0
      ? (preferredMatches / preferredSkills.length) * 100
      : 0;

    // Calculate overall score (70% required, 30% preferred)
    const score = Math.round(requiredMatchPercent * 0.7 + preferredMatchPercent * 0.3);

    // Determine recommendation
    let recommendation: CandidateRanking['recommendation'];
    if (score >= 90) recommendation = 'strong_match';
    else if (score >= 75) recommendation = 'good_match';
    else if (score >= 60) recommendation = 'moderate_match';
    else if (score >= 40) recommendation = 'weak_match';
    else recommendation = 'poor_match';

    const matchedSkills = candidateSkills.filter(cs =>
      requiredSkills.some(rs => cs.includes(rs) || rs.includes(cs)) ||
      preferredSkills.some(ps => cs.includes(ps) || ps.includes(cs))
    );

    const missingSkills = requiredSkills.filter(rs =>
      !candidateSkills.some(cs => cs.includes(rs) || rs.includes(cs))
    );

    return {
      candidateId: candidateData.id,
      candidateName: `${candidateData.firstName} ${candidateData.lastName}`,
      score,
      reasoning: `Basic skill matching: ${requiredMatches}/${requiredSkills.length} required skills matched`,
      strengths: matchedSkills.length > 0
        ? [`Has ${matchedSkills.length} relevant skills: ${matchedSkills.slice(0, 5).join(', ')}`]
        : ['Experience in the field'],
      weaknesses: missingSkills.length > 0
        ? [`Missing ${missingSkills.length} required skills: ${missingSkills.slice(0, 3).join(', ')}`]
        : ['No significant weaknesses identified'],
      recommendation,
      skillMatchPercentage: requiredMatchPercent,
      experienceMatch: 'Unable to assess (AI unavailable)',
    };
  }
}
