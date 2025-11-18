import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Candidate, Resume, Application } from '../database/entities';
import { ResumeParserService } from './resume-parser.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class CandidatesService {
  constructor(
    @InjectRepository(Candidate)
    private candidateRepository: Repository<Candidate>,
    @InjectRepository(Resume)
    private resumeRepository: Repository<Resume>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    private resumeParserService: ResumeParserService,
    private aiService: AiService,
  ) {}

  async createCandidate(data: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    location?: string;
    tenantId: string;
  }) {
    const candidate = this.candidateRepository.create(data);
    return await this.candidateRepository.save(candidate);
  }

  async getAllCandidates(tenantId: string) {
    return await this.candidateRepository.find({
      where: { tenantId },
      relations: ['resumes', 'applications'],
      order: { createdAt: 'DESC' },
    });
  }

  async getCandidateById(id: string, tenantId: string) {
    return await this.candidateRepository.findOne({
      where: { id, tenantId },
      relations: ['resumes', 'applications'],
    });
  }

  async uploadResume(candidateId: string, resumeText: string, tenantId: string) {
    const candidate = await this.getCandidateById(candidateId, tenantId);
    if (!candidate) {
      throw new Error('Candidate not found');
    }

    // Parse the resume
    const parsed = this.resumeParserService.parseResumeText(resumeText);

    // Create resume record
    const resume = this.resumeRepository.create({
      candidateId,
      rawText: resumeText,
      summary: parsed.summary,
      experience: parsed.experience,
      education: parsed.education,
      skills: parsed.skills,
      certifications: parsed.certifications,
      isParsed: true,
    });

    const savedResume = await this.resumeRepository.save(resume);

    // Update candidate skills
    await this.candidateRepository.update(candidateId, {
      skills: [...new Set([...candidate.skills, ...parsed.skills])],
    });

    return savedResume;
  }

  async searchCandidates(query: {
    skills?: string[];
    location?: string;
    tenantId: string;
  }) {
    const queryBuilder = this.candidateRepository
      .createQueryBuilder('candidate')
      .where('candidate.tenantId = :tenantId', { tenantId: query.tenantId });

    if (query.skills && query.skills.length > 0) {
      queryBuilder.andWhere('candidate.skills && :skills', { skills: query.skills });
    }

    if (query.location) {
      queryBuilder.andWhere('candidate.location ILIKE :location', {
        location: `%${query.location}%`,
      });
    }

    return await queryBuilder
      .leftJoinAndSelect('candidate.resumes', 'resume')
      .orderBy('candidate.createdAt', 'DESC')
      .getMany();
  }

  async analyzeCandidate(candidateId: string, jobDescription: string, tenantId: string) {
    const candidate = await this.candidateRepository.findOne({
      where: { id: candidateId, tenantId },
      relations: ['resumes'],
    });

    if (!candidate || !candidate.resumes || candidate.resumes.length === 0) {
      throw new Error('Candidate or resume not found');
    }

    const latestResume = candidate.resumes[candidate.resumes.length - 1];
    const analysis = await this.aiService.analyzeResume(latestResume.rawText, jobDescription);

    return {
      candidate,
      analysis,
    };
  }
}
