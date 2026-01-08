import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../database/entities/tenant.entity';
import { Job, JobStatus } from '../database/entities/job.entity';
import { Candidate } from '../database/entities/candidate.entity';
import axios from 'axios';

export interface LinkedInOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes?: string[];
}

export interface LinkedInTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  tokenType: string;
  expiresAt?: Date;
}

export interface LinkedInProfile {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  headline?: string;
  profilePictureUrl?: string;
  vanityName?: string;
}

export interface LinkedInOrganization {
  id: string;
  name: string;
  vanityName: string;
  logoUrl?: string;
  websiteUrl?: string;
  industry?: string;
  companySize?: string;
}

export interface LinkedInJobPosting {
  id?: string;
  title: string;
  description: string;
  location: {
    country: string;
    city?: string;
    postalCode?: string;
  };
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'TEMPORARY' | 'INTERNSHIP';
  experienceLevel: 'ENTRY_LEVEL' | 'ASSOCIATE' | 'MID_SENIOR_LEVEL' | 'DIRECTOR' | 'EXECUTIVE';
  industries?: string[];
  skills?: string[];
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
  applicationDeadline?: Date;
  externalApplyUrl?: string;
}

export interface LinkedInCandidateProfile {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  headline: string;
  summary?: string;
  location: string;
  profileUrl: string;
  profilePictureUrl?: string;
  skills: string[];
  experience: {
    title: string;
    company: string;
    companyId?: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description?: string;
  }[];
  education: {
    school: string;
    degree?: string;
    fieldOfStudy?: string;
    startDate?: string;
    endDate?: string;
  }[];
  certifications?: {
    name: string;
    authority?: string;
    issueDate?: string;
    expirationDate?: string;
  }[];
}

@Injectable()
export class LinkedInOAuthService {
  private readonly logger = new Logger(LinkedInOAuthService.name);
  private readonly AUTH_URL = 'https://www.linkedin.com/oauth/v2';
  private readonly API_URL = 'https://api.linkedin.com/v2';
  private readonly RECRUITER_API_URL = 'https://api.linkedin.com/rest';

  constructor(
    private configService: ConfigService,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    @InjectRepository(Candidate)
    private candidateRepository: Repository<Candidate>,
  ) {}

  /**
   * Generate OAuth authorization URL
   */
  getAuthorizationUrl(config: LinkedInOAuthConfig, state: string): string {
    const scopes = config.scopes || [
      'r_liteprofile',
      'r_emailaddress',
      'w_member_social',
      'r_organization_social',
      'w_organization_social',
      'rw_organization_admin',
      'r_ads',
      'r_ads_reporting',
    ];

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      state,
      scope: scopes.join(' '),
    });

    return `${this.AUTH_URL}/authorization?${params.toString()}`;
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(
    code: string,
    config: LinkedInOAuthConfig,
  ): Promise<LinkedInTokens> {
    try {
      const response = await axios.post(
        `${this.AUTH_URL}/accessToken`,
        new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: config.redirectUri,
          client_id: config.clientId,
          client_secret: config.clientSecret,
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + response.data.expires_in);

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in,
        tokenType: response.data.token_type,
        expiresAt,
      };
    } catch (error) {
      this.logger.error('Failed to exchange code for tokens:', error);
      throw new BadRequestException('Failed to authenticate with LinkedIn');
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(
    refreshToken: string,
    config: LinkedInOAuthConfig,
  ): Promise<LinkedInTokens> {
    try {
      const response = await axios.post(
        `${this.AUTH_URL}/accessToken`,
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: config.clientId,
          client_secret: config.clientSecret,
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + response.data.expires_in);

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token || refreshToken,
        expiresIn: response.data.expires_in,
        tokenType: response.data.token_type,
        expiresAt,
      };
    } catch (error) {
      this.logger.error('Failed to refresh token:', error);
      throw new BadRequestException('Failed to refresh LinkedIn token');
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUserProfile(accessToken: string): Promise<LinkedInProfile> {
    try {
      const [profileResponse, emailResponse] = await Promise.all([
        axios.get(`${this.API_URL}/me`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
        axios.get(
          `${this.API_URL}/emailAddress?q=members&projection=(elements*(handle~))`,
          { headers: { Authorization: `Bearer ${accessToken}` } },
        ),
      ]);

      const profile = profileResponse.data;
      const email = emailResponse.data.elements?.[0]?.['handle~']?.emailAddress;

      return {
        id: profile.id,
        firstName: profile.localizedFirstName,
        lastName: profile.localizedLastName,
        email,
        headline: profile.headline?.localized?.en_US,
        vanityName: profile.vanityName,
      };
    } catch (error) {
      this.logger.error('Failed to get user profile:', error);
      throw new BadRequestException('Failed to fetch LinkedIn profile');
    }
  }

  /**
   * Get organizations the user has admin access to
   */
  async getUserOrganizations(accessToken: string): Promise<LinkedInOrganization[]> {
    try {
      const response = await axios.get(
        `${this.API_URL}/organizationalEntityAcls?q=roleAssignee&role=ADMINISTRATOR`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0',
          },
        },
      );

      const orgUrns = response.data.elements?.map(
        (e: any) => e.organizationalTarget,
      ) || [];

      const organizations: LinkedInOrganization[] = [];

      for (const urn of orgUrns) {
        const orgId = urn.split(':').pop();
        try {
          const orgResponse = await axios.get(
            `${this.API_URL}/organizations/${orgId}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'X-Restli-Protocol-Version': '2.0.0',
              },
            },
          );

          organizations.push({
            id: orgId,
            name: orgResponse.data.localizedName,
            vanityName: orgResponse.data.vanityName,
            websiteUrl: orgResponse.data.website?.localized?.en_US,
            industry: orgResponse.data.industries?.[0],
          });
        } catch (error) {
          this.logger.warn(`Failed to fetch organization ${orgId}`);
        }
      }

      return organizations;
    } catch (error) {
      this.logger.error('Failed to get organizations:', error);
      throw new BadRequestException('Failed to fetch LinkedIn organizations');
    }
  }

  /**
   * Post a job to LinkedIn
   */
  async postJob(
    accessToken: string,
    organizationId: string,
    job: LinkedInJobPosting,
  ): Promise<{ success: boolean; linkedInJobId?: string; error?: string }> {
    try {
      const jobData = {
        author: `urn:li:organization:${organizationId}`,
        lifecycleState: 'PUBLISHED',
        visibility: 'PUBLIC',
        jobPosting: {
          title: job.title,
          description: {
            text: job.description,
          },
          location: {
            country: job.location.country,
            city: job.location.city,
            postalCode: job.location.postalCode,
          },
          employmentType: job.employmentType,
          experienceLevel: job.experienceLevel,
          industries: job.industries || [],
          skills: job.skills || [],
          ...(job.salaryRange && {
            compensation: {
              baseSalary: {
                minAmount: { amount: job.salaryRange.min, currencyCode: job.salaryRange.currency },
                maxAmount: { amount: job.salaryRange.max, currencyCode: job.salaryRange.currency },
              },
            },
          }),
          ...(job.applicationDeadline && {
            applicationDeadline: job.applicationDeadline.toISOString(),
          }),
          ...(job.externalApplyUrl && {
            applyMethod: {
              externalApply: { url: job.externalApplyUrl },
            },
          }),
        },
      };

      const response = await axios.post(
        `${this.RECRUITER_API_URL}/jobPostings`,
        jobData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0',
            'LinkedIn-Version': '202401',
          },
        },
      );

      const linkedInJobId = response.headers['x-restli-id'] || response.data.id;

      this.logger.log(`Posted job to LinkedIn: ${linkedInJobId}`);

      return { success: true, linkedInJobId };
    } catch (error: any) {
      this.logger.error('Failed to post job to LinkedIn:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Get job postings from LinkedIn organization
   */
  async getOrganizationJobs(
    accessToken: string,
    organizationId: string,
    options: { status?: string; limit?: number } = {},
  ): Promise<LinkedInJobPosting[]> {
    try {
      const { status = 'LISTED', limit = 100 } = options;

      const response = await axios.get(
        `${this.RECRUITER_API_URL}/jobPostings?q=organization&organization=urn:li:organization:${organizationId}&status=${status}&count=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0',
            'LinkedIn-Version': '202401',
          },
        },
      );

      return response.data.elements?.map((job: any) => ({
        id: job.id,
        title: job.jobPosting?.title,
        description: job.jobPosting?.description?.text,
        location: job.jobPosting?.location,
        employmentType: job.jobPosting?.employmentType,
        experienceLevel: job.jobPosting?.experienceLevel,
        industries: job.jobPosting?.industries,
        skills: job.jobPosting?.skills,
      })) || [];
    } catch (error) {
      this.logger.error('Failed to get organization jobs:', error);
      throw new BadRequestException('Failed to fetch LinkedIn jobs');
    }
  }

  /**
   * Get job applicants from LinkedIn
   */
  async getJobApplicants(
    accessToken: string,
    jobId: string,
    options: { limit?: number; start?: number } = {},
  ): Promise<LinkedInCandidateProfile[]> {
    try {
      const { limit = 50, start = 0 } = options;

      const response = await axios.get(
        `${this.RECRUITER_API_URL}/jobApplications?q=jobPosting&jobPosting=urn:li:jobPosting:${jobId}&start=${start}&count=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0',
            'LinkedIn-Version': '202401',
          },
        },
      );

      const applicants: LinkedInCandidateProfile[] = [];

      for (const application of response.data.elements || []) {
        try {
          const candidateUrn = application.candidate;
          const candidateId = candidateUrn.split(':').pop();

          const candidateResponse = await axios.get(
            `${this.RECRUITER_API_URL}/candidates/${candidateId}?projection=(firstName,lastName,headline,location,publicProfileUrl,skills,positions,educations)`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'X-Restli-Protocol-Version': '2.0.0',
                'LinkedIn-Version': '202401',
              },
            },
          );

          const candidate = candidateResponse.data;

          applicants.push({
            id: candidateId,
            firstName: candidate.firstName,
            lastName: candidate.lastName,
            headline: candidate.headline || '',
            location: candidate.location?.name || '',
            profileUrl: candidate.publicProfileUrl || '',
            skills: candidate.skills?.map((s: any) => s.name) || [],
            experience: candidate.positions?.map((p: any) => ({
              title: p.title,
              company: p.companyName,
              startDate: p.startDate,
              endDate: p.endDate,
              current: p.isCurrent,
              description: p.description,
            })) || [],
            education: candidate.educations?.map((e: any) => ({
              school: e.schoolName,
              degree: e.degree,
              fieldOfStudy: e.fieldOfStudy,
              startDate: e.startDate,
              endDate: e.endDate,
            })) || [],
          });
        } catch (error) {
          this.logger.warn(`Failed to fetch applicant details`);
        }
      }

      return applicants;
    } catch (error) {
      this.logger.error('Failed to get job applicants:', error);
      throw new BadRequestException('Failed to fetch LinkedIn applicants');
    }
  }

  /**
   * Search for candidates (Recruiter API required)
   */
  async searchCandidates(
    accessToken: string,
    searchCriteria: {
      keywords?: string;
      location?: string;
      skills?: string[];
      currentCompany?: string;
      experienceYears?: { min?: number; max?: number };
      schools?: string[];
    },
    options: { limit?: number; start?: number } = {},
  ): Promise<LinkedInCandidateProfile[]> {
    try {
      const { limit = 25, start = 0 } = options;

      const facets: any = {};
      if (searchCriteria.skills?.length) {
        facets.skills = searchCriteria.skills;
      }
      if (searchCriteria.currentCompany) {
        facets.currentCompany = [searchCriteria.currentCompany];
      }
      if (searchCriteria.schools?.length) {
        facets.schools = searchCriteria.schools;
      }

      const searchData = {
        keywords: searchCriteria.keywords,
        ...(searchCriteria.location && { geoRegion: searchCriteria.location }),
        ...(Object.keys(facets).length > 0 && { facets }),
        start,
        count: limit,
      };

      const response = await axios.post(
        `${this.RECRUITER_API_URL}/talentSearch`,
        searchData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0',
            'LinkedIn-Version': '202401',
          },
        },
      );

      return response.data.elements?.map((candidate: any) => ({
        id: candidate.id,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        headline: candidate.headline || '',
        location: candidate.location?.name || '',
        profileUrl: candidate.publicProfileUrl || '',
        skills: candidate.skills || [],
        experience: candidate.positions || [],
        education: candidate.educations || [],
      })) || [];
    } catch (error) {
      this.logger.error('Failed to search candidates:', error);
      throw new BadRequestException('Failed to search LinkedIn candidates');
    }
  }

  /**
   * Import candidates from LinkedIn to local database
   */
  async importCandidates(
    candidates: LinkedInCandidateProfile[],
    tenantId: string,
  ): Promise<{ imported: number; failed: number; errors: string[] }> {
    let imported = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const linkedInCandidate of candidates) {
      try {
        const email = linkedInCandidate.email || `linkedin-${linkedInCandidate.id}@import.local`;

        const existing = await this.candidateRepository.findOne({
          where: { email, tenantId },
        });

        const candidateData = {
          email,
          firstName: linkedInCandidate.firstName,
          lastName: linkedInCandidate.lastName,
          location: linkedInCandidate.location,
          skills: linkedInCandidate.skills,
          linkedin: linkedInCandidate.profileUrl,
          tenantId,
        };

        if (existing) {
          Object.assign(existing, candidateData);
          await this.candidateRepository.save(existing);
        } else {
          const newCandidate = this.candidateRepository.create(candidateData);
          await this.candidateRepository.save(newCandidate);
        }

        imported++;
      } catch (error: any) {
        failed++;
        errors.push(`Failed to import ${linkedInCandidate.firstName} ${linkedInCandidate.lastName}: ${error.message}`);
      }
    }

    return { imported, failed, errors };
  }

  /**
   * Test connection to LinkedIn
   */
  async testConnection(accessToken: string): Promise<{ success: boolean; message: string }> {
    try {
      const profile = await this.getCurrentUserProfile(accessToken);
      return {
        success: true,
        message: `Connected as ${profile.firstName} ${profile.lastName}`,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to connect to LinkedIn',
      };
    }
  }

  /**
   * Save LinkedIn tokens to tenant settings
   */
  async saveTokensToTenant(tenantId: string, tokens: LinkedInTokens): Promise<void> {
    const tenant = await this.tenantRepository.findOne({ where: { id: tenantId } });
    if (!tenant) {
      throw new BadRequestException('Tenant not found');
    }

    if (!tenant.settings) {
      tenant.settings = {};
    }

    tenant.settings.integrations = {
      ...(tenant.settings.integrations || {}),
      linkedin: {
        ...(tenant.settings.integrations?.linkedin || {}),
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt?.toISOString(),
      },
    };

    await this.tenantRepository.save(tenant);
  }
}
