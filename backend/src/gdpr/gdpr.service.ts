import { Injectable, Logger, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Candidate, Resume, Application } from '../database/entities';

export interface GDPRDataExport {
  candidate: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    location: string;
    skills: string[];
    createdAt: Date;
    updatedAt: Date;
  };
  resumes: Array<{
    id: string;
    uploadedAt: Date;
    rawText: string;
    summary: string;
    experience: any[];
    education: any[];
    skills: string[];
    certifications: string[];
  }>;
  applications: Array<{
    id: string;
    jobId: string;
    jobTitle: string;
    company: string;
    status: string;
    matchScore: number;
    aiAnalysis: any;
    notes: string;
    appliedAt: Date;
    updatedAt: Date;
  }>;
  metadata: {
    exportDate: Date;
    dataRetentionPolicy: string;
    privacyPolicy: string;
  };
}

export interface GDPRDeletionReport {
  candidateId: string;
  email: string;
  deletedAt: Date;
  itemsDeleted: {
    candidate: boolean;
    resumes: number;
    applications: number;
  };
  anonymizedData: {
    applications: number; // Applications anonymized instead of deleted (for compliance)
  };
}

@Injectable()
export class GDPRService {
  private readonly logger = new Logger(GDPRService.name);

  constructor(
    @InjectRepository(Candidate)
    private candidateRepository: Repository<Candidate>,
    @InjectRepository(Resume)
    private resumeRepository: Repository<Resume>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
  ) { }

  /**
   * Export all personal data for a candidate (GDPR Article 15 - Right of Access)
   */
  async exportCandidateData(
    candidateId: string,
    tenantId: string
  ): Promise<GDPRDataExport> {
    this.logger.log(`Exporting data for candidate ${candidateId} in tenant ${tenantId}`);

    // Get candidate with all relations
    const candidate = await this.candidateRepository.findOne({
      where: { id: candidateId, tenantId },
      relations: ['resumes', 'applications', 'applications.job'],
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found or access denied');
    }

    const exportData: GDPRDataExport = {
      candidate: {
        id: candidate.id,
        email: candidate.email,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        phone: candidate.phone || '',
        location: candidate.location || '',
        skills: candidate.skills || [],
        createdAt: candidate.createdAt,
        updatedAt: candidate.updatedAt,
      },
      resumes: candidate.resumes?.map(resume => ({
        id: resume.id,
        uploadedAt: resume.createdAt,
        rawText: resume.rawText,
        summary: resume.summary,
        experience: resume.experience,
        education: resume.education,
        skills: resume.skills,
        certifications: resume.certifications,
      })) || [],
      applications: candidate.applications?.map(app => ({
        id: app.id,
        jobId: app.jobId,
        jobTitle: app.job?.title || 'N/A',
        company: app.job?.company || 'N/A',
        status: app.status,
        matchScore: app.matchScore,
        aiAnalysis: app.aiAnalysis,
        notes: app.notes,
        appliedAt: app.createdAt,
        updatedAt: app.updatedAt,
      })) || [],
      metadata: {
        exportDate: new Date(),
        dataRetentionPolicy: 'Data is retained for 2 years after last activity',
        privacyPolicy: 'https://workera.com/privacy',
      },
    };

    this.logger.log(`Successfully exported data for candidate ${candidateId}`);
    return exportData;
  }

  /**
   * Delete all personal data for a candidate (GDPR Article 17 - Right to Erasure / Right to be Forgotten)
   */
  async deleteCandidateData(
    candidateId: string,
    tenantId: string,
    options: {
      hardDelete?: boolean; // If false, will anonymize instead
      keepApplicationHistory?: boolean; // If true, anonymizes applications instead of deleting
    } = {}
  ): Promise<GDPRDeletionReport> {
    this.logger.warn(`Deleting/anonymizing data for candidate ${candidateId} in tenant ${tenantId}`);

    const candidate = await this.candidateRepository.findOne({
      where: { id: candidateId, tenantId },
      relations: ['resumes', 'applications'],
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found or access denied');
    }

    const report: GDPRDeletionReport = {
      candidateId: candidate.id,
      email: candidate.email,
      deletedAt: new Date(),
      itemsDeleted: {
        candidate: false,
        resumes: 0,
        applications: 0,
      },
      anonymizedData: {
        applications: 0,
      },
    };

    try {
      // Delete all resumes
      if (candidate.resumes && candidate.resumes.length > 0) {
        await this.resumeRepository.delete({ candidateId });
        report.itemsDeleted.resumes = candidate.resumes.length;
        this.logger.log(`Deleted ${candidate.resumes.length} resumes for candidate ${candidateId}`);
      }

      // Handle applications
      if (candidate.applications && candidate.applications.length > 0) {
        if (options.keepApplicationHistory) {
          // Anonymize applications instead of deleting (for compliance/audit trail)
          for (const app of candidate.applications) {
            app.notes = '[REDACTED - GDPR Deletion Request]';
            app.aiAnalysis = null;
            await this.applicationRepository.save(app);
          }
          report.anonymizedData.applications = candidate.applications.length;
          this.logger.log(`Anonymized ${candidate.applications.length} applications for candidate ${candidateId}`);
        } else {
          // Hard delete applications
          await this.applicationRepository.delete({ candidateId });
          report.itemsDeleted.applications = candidate.applications.length;
          this.logger.log(`Deleted ${candidate.applications.length} applications for candidate ${candidateId}`);
        }
      }

      // Delete or anonymize candidate
      if (options.hardDelete) {
        await this.candidateRepository.delete(candidateId);
        report.itemsDeleted.candidate = true;
        this.logger.log(`Hard deleted candidate ${candidateId}`);
      } else {
        // Anonymize candidate (soft delete)
        candidate.email = `deleted-${candidateId}@anonymized.local`;
        candidate.firstName = 'DELETED';
        candidate.lastName = 'USER';
        candidate.phone = null;
        candidate.location = null;
        candidate.skills = [];
        await this.candidateRepository.save(candidate);
        this.logger.log(`Anonymized candidate ${candidateId}`);
      }

      this.logger.log(`GDPR deletion completed for candidate ${candidateId}`);
      return report;

    } catch (error) {
      this.logger.error(`Error during GDPR deletion for candidate ${candidateId}:`, error);
      throw new InternalServerErrorException(`Failed to delete candidate data: ${error.message}`);
    }
  }

  /**
   * Get data retention report for a tenant
   */
  async getDataRetentionReport(tenantId: string): Promise<{
    totalCandidates: number;
    candidatesOlderThan2Years: number;
    candidatesOlderThan5Years: number;
    totalResumes: number;
    totalApplications: number;
    recommendations: string[];
  }> {
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

    const [
      totalCandidates,
      candidatesOlderThan2Years,
      candidatesOlderThan5Years,
      totalResumes,
      totalApplications,
    ] = await Promise.all([
      this.candidateRepository.count({ where: { tenantId } }),
      this.candidateRepository.count({
        where: { tenantId },
      }),
      this.candidateRepository.count({
        where: { tenantId },
      }),
      this.resumeRepository
        .createQueryBuilder('resume')
        .leftJoin('resume.candidate', 'candidate')
        .where('candidate.tenantId = :tenantId', { tenantId })
        .getCount(),
      this.applicationRepository
        .createQueryBuilder('application')
        .leftJoin('application.job', 'job')
        .where('job.tenantId = :tenantId', { tenantId })
        .getCount(),
    ]);

    // Get actual counts for older candidates
    const oldCandidates2Years = await this.candidateRepository
      .createQueryBuilder('candidate')
      .where('candidate.tenantId = :tenantId', { tenantId })
      .andWhere('candidate.updatedAt < :date', { date: twoYearsAgo })
      .getCount();

    const oldCandidates5Years = await this.candidateRepository
      .createQueryBuilder('candidate')
      .where('candidate.tenantId = :tenantId', { tenantId })
      .andWhere('candidate.updatedAt < :date', { date: fiveYearsAgo })
      .getCount();

    const recommendations: string[] = [];

    if (oldCandidates2Years > 0) {
      recommendations.push(
        `${oldCandidates2Years} candidates have not been updated in 2+ years. Consider archiving or requesting consent renewal.`
      );
    }

    if (oldCandidates5Years > 0) {
      recommendations.push(
        `${oldCandidates5Years} candidates have not been updated in 5+ years. Consider deletion per GDPR guidelines.`
      );
    }

    if (totalCandidates > 10000) {
      recommendations.push(
        'Large candidate database detected. Implement automated data retention policies.'
      );
    }

    return {
      totalCandidates,
      candidatesOlderThan2Years: oldCandidates2Years,
      candidatesOlderThan5Years: oldCandidates5Years,
      totalResumes,
      totalApplications,
      recommendations,
    };
  }

  /**
   * Find candidates by email for data portability
   */
  async findCandidateByEmail(
    email: string,
    tenantId: string
  ): Promise<Candidate | null> {
    return await this.candidateRepository.findOne({
      where: { email, tenantId },
    });
  }

  /**
   * Verify candidate consent based on registration and application history
   * Consent is considered valid if:
   * 1. Candidate exists and was created (implied consent at registration)
   * 2. Candidate has submitted applications (active consent through action)
   *
   * For full GDPR compliance, implement a dedicated consent management system
   * that tracks explicit consent with timestamps and consent versions.
   */
  async verifyConsent(candidateId: string, tenantId: string): Promise<{
    hasConsent: boolean;
    consentDate?: Date;
    consentType?: 'explicit' | 'implicit' | 'none';
    consentSource?: string;
  }> {
    const candidate = await this.candidateRepository.findOne({
      where: { id: candidateId, tenantId },
    });

    if (!candidate) {
      return {
        hasConsent: false,
        consentType: 'none',
        consentSource: 'candidate_not_found'
      };
    }

    // Check if candidate has any applications (active consent through action)
    const applicationCount = await this.applicationRepository.count({
      where: { candidateId },
    });

    if (applicationCount > 0) {
      // Active consent - candidate has taken action to apply
      return {
        hasConsent: true,
        consentDate: candidate.createdAt,
        consentType: 'explicit',
        consentSource: 'application_submission',
      };
    }

    // Registration implies initial consent to process data
    // Note: For stricter GDPR compliance, require explicit checkbox consent at registration
    return {
      hasConsent: true,
      consentDate: candidate.createdAt,
      consentType: 'implicit',
      consentSource: 'registration',
    };
  }
}
