import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { CandidateUser } from '../database/entities/candidate-user.entity';
import { Job, JobStatus } from '../database/entities/job.entity';
import { Application, ApplicationStatus } from '../database/entities/application.entity';
import { FormSubmission } from '../database/entities/form-submission.entity';
import { AIResumeParserService, ParsedResumeData, ResumeImportSource } from '../candidates/ai-resume-parser.service';
import { WorkeraEmailService } from '../email/workera-email.service';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface CandidateProfile {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    location: string;
    title: string;
    linkedinUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
    profilePictureUrl?: string;
  };
  summary: string;
  totalYearsOfExperience: number;
  experience: any[];
  education: any[];
  skills: {
    technical: string[];
    soft: string[];
    languages: string[];
    tools: string[];
  };
  certifications: any[];
  projects: any[];
  resumeUrl?: string;
  profileCompleteness: number;
}

export interface JobRecommendation {
  job: Job;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  experienceMatch: boolean;
  recommendation: string;
}

export interface ApplicationFormTemplate {
  id: string;
  name: string;
  sections: Array<{
    id: string;
    title: string;
    description?: string;
    fields: Array<{
      id: string;
      type: 'text' | 'textarea' | 'select' | 'multiselect' | 'date' | 'file' | 'checkbox' | 'number' | 'email' | 'phone' | 'url';
      label: string;
      placeholder?: string;
      required: boolean;
      options?: string[];
      validation?: {
        minLength?: number;
        maxLength?: number;
        pattern?: string;
        min?: number;
        max?: number;
      };
    }>;
  }>;
  isDefault: boolean;
}

@Injectable()
export class CandidatePortalEnhancedService {
  private readonly logger = new Logger(CandidatePortalEnhancedService.name);
  private genAI: GoogleGenerativeAI | null = null;

  constructor(
    @InjectRepository(CandidateUser)
    private candidateUserRepository: Repository<CandidateUser>,
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(FormSubmission)
    private formSubmissionRepository: Repository<FormSubmission>,
    private aiResumeParser: AIResumeParserService,
    private emailService: WorkeraEmailService,
  ) {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  /**
   * Import resume and parse it using AI
   */
  async importAndParseResume(
    candidateId: string,
    tenantId: string,
    source: ResumeImportSource,
  ): Promise<ParsedResumeData> {
    this.logger.log(`Importing resume for candidate ${candidateId} from ${source.type}`);

    // Parse the resume
    const parsedData = await this.aiResumeParser.parseResume(source);

    // Update candidate profile with parsed data
    await this.updateCandidateFromParsedResume(candidateId, tenantId, parsedData);

    return parsedData;
  }

  /**
   * Update candidate profile from parsed resume data
   */
  async updateCandidateFromParsedResume(
    candidateId: string,
    tenantId: string,
    parsedData: ParsedResumeData,
  ): Promise<CandidateUser> {
    const candidate = await this.candidateUserRepository.findOne({
      where: { id: candidateId, tenantId },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    // Only update fields that are empty or if new data is available
    if (!candidate.firstName && parsedData.personalInfo.firstName) {
      candidate.firstName = parsedData.personalInfo.firstName;
    }
    if (!candidate.lastName && parsedData.personalInfo.lastName) {
      candidate.lastName = parsedData.personalInfo.lastName;
    }
    if (!candidate.phone && parsedData.personalInfo.phone) {
      candidate.phone = parsedData.personalInfo.phone;
    }
    if (!candidate.location && parsedData.personalInfo.location) {
      candidate.location = parsedData.personalInfo.location;
    }
    if (!candidate.linkedinUrl && parsedData.personalInfo.linkedinUrl) {
      candidate.linkedinUrl = parsedData.personalInfo.linkedinUrl;
    }
    if (!candidate.githubUrl && parsedData.personalInfo.githubUrl) {
      candidate.githubUrl = parsedData.personalInfo.githubUrl;
    }
    if (!candidate.portfolioUrl && parsedData.personalInfo.portfolioUrl) {
      candidate.portfolioUrl = parsedData.personalInfo.portfolioUrl;
    }
    if (!candidate.bio && parsedData.summary) {
      candidate.bio = parsedData.summary;
    }

    // Merge skills
    const existingSkills = candidate.skills || [];
    const allNewSkills = [
      ...parsedData.skills.technical,
      ...parsedData.skills.soft,
      ...parsedData.skills.tools,
    ];
    candidate.skills = [...new Set([...existingSkills, ...allNewSkills])];

    // Store full parsed data in a JSON field (experience, education, etc.)
    const extendedProfile = {
      experience: parsedData.experience,
      education: parsedData.education,
      certifications: parsedData.certifications,
      projects: parsedData.projects,
      totalYearsOfExperience: parsedData.totalYearsOfExperience,
      skillsDetailed: parsedData.skills,
    };

    // Store in candidateProfileData column (needs to be added to entity)
    (candidate as any).profileData = extendedProfile;

    return this.candidateUserRepository.save(candidate);
  }

  /**
   * Get enhanced candidate profile with all data
   */
  async getEnhancedProfile(
    candidateId: string,
    tenantId: string,
  ): Promise<CandidateProfile> {
    const candidate = await this.candidateUserRepository.findOne({
      where: { id: candidateId, tenantId },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    const profileData = (candidate as any).profileData || {};

    // Calculate profile completeness
    const completeness = this.calculateProfileCompleteness(candidate, profileData);

    return {
      personalInfo: {
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        email: candidate.email,
        phone: candidate.phone || '',
        location: candidate.location || '',
        title: profileData.currentTitle || '',
        linkedinUrl: candidate.linkedinUrl,
        githubUrl: candidate.githubUrl,
        portfolioUrl: candidate.portfolioUrl,
        profilePictureUrl: candidate.profilePictureUrl,
      },
      summary: candidate.bio || '',
      totalYearsOfExperience: profileData.totalYearsOfExperience || 0,
      experience: profileData.experience || [],
      education: profileData.education || [],
      skills: profileData.skillsDetailed || {
        technical: candidate.skills || [],
        soft: [],
        languages: [],
        tools: [],
      },
      certifications: profileData.certifications || [],
      projects: profileData.projects || [],
      resumeUrl: candidate.resumeUrl,
      profileCompleteness: completeness,
    };
  }

  /**
   * Calculate profile completeness percentage
   */
  private calculateProfileCompleteness(candidate: CandidateUser, profileData: any): number {
    const weights = {
      firstName: 5,
      lastName: 5,
      email: 5,
      phone: 5,
      location: 5,
      bio: 10,
      skills: 15,
      experience: 20,
      education: 15,
      linkedin: 5,
      resumeUrl: 10,
    };

    let score = 0;
    let total = 0;

    // Basic info
    if (candidate.firstName) score += weights.firstName;
    total += weights.firstName;

    if (candidate.lastName) score += weights.lastName;
    total += weights.lastName;

    if (candidate.email) score += weights.email;
    total += weights.email;

    if (candidate.phone) score += weights.phone;
    total += weights.phone;

    if (candidate.location) score += weights.location;
    total += weights.location;

    if (candidate.bio) score += weights.bio;
    total += weights.bio;

    if (candidate.skills && candidate.skills.length > 0) score += weights.skills;
    total += weights.skills;

    if (profileData.experience && profileData.experience.length > 0) score += weights.experience;
    total += weights.experience;

    if (profileData.education && profileData.education.length > 0) score += weights.education;
    total += weights.education;

    if (candidate.linkedinUrl) score += weights.linkedin;
    total += weights.linkedin;

    if (candidate.resumeUrl) score += weights.resumeUrl;
    total += weights.resumeUrl;

    return Math.round((score / total) * 100);
  }

  /**
   * Get AI-powered job recommendations based on resume
   */
  async getJobRecommendations(
    candidateId: string,
    tenantId: string,
    options?: {
      limit?: number;
      location?: string;
      jobType?: string;
    },
  ): Promise<JobRecommendation[]> {
    const profile = await this.getEnhancedProfile(candidateId, tenantId);

    // Get available jobs
    const query = this.jobRepository
      .createQueryBuilder('job')
      .where('job.tenantId = :tenantId', { tenantId })
      .andWhere('job.status = :status', { status: JobStatus.POSTED });

    if (options?.location) {
      query.andWhere('job.location ILIKE :location', { location: `%${options.location}%` });
    }

    const jobs = await query
      .orderBy('job.createdAt', 'DESC')
      .limit(50)
      .getMany();

    // Calculate match scores for each job
    const recommendations: JobRecommendation[] = [];

    for (const job of jobs) {
      const jobSkills = (job as any).requirements || [];
      const minExperience = this.extractMinExperience(job.description || '');

      const matchResult = await this.aiResumeParser.calculateJobMatchScore(
        {
          personalInfo: profile.personalInfo,
          summary: profile.summary,
          totalYearsOfExperience: profile.totalYearsOfExperience,
          experience: profile.experience,
          education: profile.education,
          skills: profile.skills,
          certifications: profile.certifications,
          projects: profile.projects,
        },
        {
          skills: jobSkills,
          minExperience,
        },
      );

      recommendations.push({
        job,
        matchScore: matchResult.score,
        matchedSkills: matchResult.matchedSkills,
        missingSkills: matchResult.missingSkills,
        experienceMatch: matchResult.breakdown.experienceMatch >= 70,
        recommendation: matchResult.recommendations[0] || 'Good match for your profile!',
      });
    }

    // Sort by match score and return top results
    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    return recommendations.slice(0, options?.limit || 10);
  }

  /**
   * AI-powered job search based on natural language query
   */
  async searchJobsWithAI(
    tenantId: string,
    query: string,
    candidateId?: string,
  ): Promise<{
    jobs: Array<Job & { matchScore?: number; relevanceReason?: string }>;
    suggestions: string[];
  }> {
    // Extract search criteria from natural language query
    const searchCriteria = await this.parseSearchQuery(query);

    // Build database query
    const dbQuery = this.jobRepository
      .createQueryBuilder('job')
      .where('job.tenantId = :tenantId', { tenantId })
      .andWhere('job.status = :status', { status: JobStatus.POSTED });

    if (searchCriteria.keywords.length > 0) {
      const keywordConditions = searchCriteria.keywords.map((keyword, index) => {
        dbQuery.setParameter(`keyword${index}`, `%${keyword}%`);
        return `(job.title ILIKE :keyword${index} OR job.description ILIKE :keyword${index})`;
      });
      dbQuery.andWhere(`(${keywordConditions.join(' OR ')})`);
    }

    if (searchCriteria.location) {
      dbQuery.andWhere('job.location ILIKE :location', {
        location: `%${searchCriteria.location}%`,
      });
    }

    const jobs = await dbQuery
      .orderBy('job.createdAt', 'DESC')
      .limit(20)
      .getMany();

    // If candidate is logged in, calculate match scores
    let enrichedJobs: Array<Job & { matchScore?: number; relevanceReason?: string }> = jobs;

    if (candidateId) {
      try {
        const profile = await this.getEnhancedProfile(candidateId, tenantId);
        enrichedJobs = await Promise.all(jobs.map(async (job) => {
          const matchResult = await this.aiResumeParser.calculateJobMatchScore(
            {
              personalInfo: profile.personalInfo,
              summary: profile.summary,
              totalYearsOfExperience: profile.totalYearsOfExperience,
              experience: profile.experience,
              education: profile.education,
              skills: profile.skills,
              certifications: profile.certifications,
              projects: profile.projects,
            },
            {
              skills: (job as any).requirements || [],
            },
          );

          return {
            ...job,
            matchScore: matchResult.score,
            relevanceReason: matchResult.matchedSkills.length > 0
              ? `Matches your skills: ${matchResult.matchedSkills.slice(0, 3).join(', ')}`
              : 'Based on your search criteria',
          };
        }));

        // Sort by match score
        enrichedJobs.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
      } catch (error) {
        this.logger.warn('Could not calculate match scores', error);
      }
    }

    // Generate search suggestions
    const suggestions = this.generateSearchSuggestions(query, jobs);

    return { jobs: enrichedJobs, suggestions };
  }

  /**
   * Parse natural language search query
   */
  private async parseSearchQuery(query: string): Promise<{
    keywords: string[];
    location?: string;
    jobType?: string;
    experience?: string;
    salary?: { min?: number; max?: number };
  }> {
    // Simple keyword extraction
    const keywords: string[] = [];
    let location: string | undefined;
    let jobType: string | undefined;

    // Check for location patterns
    const locationPatterns = [
      /in\s+([A-Za-z\s,]+?)(?:\s+(?:area|region|city))?(?:\s|$)/i,
      /(?:at|near|around)\s+([A-Za-z\s,]+?)(?:\s|$)/i,
      /(remote|hybrid|on-site|onsite)/i,
    ];

    for (const pattern of locationPatterns) {
      const match = query.match(pattern);
      if (match) {
        location = match[1].trim();
        break;
      }
    }

    // Check for job type
    if (/full[\s-]?time/i.test(query)) jobType = 'full-time';
    if (/part[\s-]?time/i.test(query)) jobType = 'part-time';
    if (/contract/i.test(query)) jobType = 'contract';
    if (/intern/i.test(query)) jobType = 'internship';

    // Extract job-related keywords
    const techKeywords = [
      'react', 'angular', 'vue', 'javascript', 'typescript', 'python', 'java',
      'node', 'backend', 'frontend', 'full stack', 'devops', 'cloud', 'aws',
      'data scientist', 'machine learning', 'ai', 'product manager', 'designer',
      'engineer', 'developer', 'architect', 'analyst', 'consultant', 'manager',
      'senior', 'junior', 'lead', 'principal', 'staff', 'head of',
    ];

    const queryLower = query.toLowerCase();
    for (const keyword of techKeywords) {
      if (queryLower.includes(keyword)) {
        keywords.push(keyword);
      }
    }

    // If no keywords found, use the entire query
    if (keywords.length === 0) {
      keywords.push(...query.split(/\s+/).filter(w => w.length > 2));
    }

    return { keywords, location, jobType };
  }

  /**
   * Generate search suggestions based on query and results
   */
  private generateSearchSuggestions(query: string, jobs: Job[]): string[] {
    const suggestions: string[] = [];

    if (jobs.length === 0) {
      suggestions.push('Try broader search terms');
      suggestions.push('Remove location filters');
      suggestions.push('Search for related job titles');
    } else if (jobs.length < 5) {
      suggestions.push('Expand your search area');
      suggestions.push('Consider related roles');
    }

    // Suggest based on common job titles in results
    const titles = [...new Set(jobs.slice(0, 5).map(j => j.title))];
    titles.forEach(title => {
      if (!query.toLowerCase().includes(title.toLowerCase().split(' ')[0])) {
        suggestions.push(`Try searching for "${title}"`);
      }
    });

    return suggestions.slice(0, 3);
  }

  /**
   * Extract minimum experience requirement from job description
   */
  private extractMinExperience(description: string): number | undefined {
    const patterns = [
      /(\d+)\+?\s*years?\s*(?:of\s*)?experience/i,
      /experience[:\s]*(\d+)\+?\s*years?/i,
      /minimum\s*(\d+)\s*years?/i,
    ];

    for (const pattern of patterns) {
      const match = description.match(pattern);
      if (match) {
        return parseInt(match[1]);
      }
    }

    return undefined;
  }

  /**
   * Get application form template for a job
   */
  async getApplicationFormTemplate(
    jobId: string,
    tenantId: string,
  ): Promise<ApplicationFormTemplate> {
    const job = await this.jobRepository.findOne({
      where: { id: jobId, tenantId },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // Check if job has a custom form template
    const customTemplate = (job as any).applicationFormTemplate;
    if (customTemplate) {
      return customTemplate;
    }

    // Return default Workday-style template
    return this.getDefaultApplicationTemplate(job);
  }

  /**
   * Get default Workday-style application template
   */
  private getDefaultApplicationTemplate(job: Job): ApplicationFormTemplate {
    return {
      id: 'default',
      name: 'Standard Application Form',
      isDefault: true,
      sections: [
        {
          id: 'personal',
          title: 'Personal Information',
          description: 'Please provide your contact details',
          fields: [
            {
              id: 'firstName',
              type: 'text',
              label: 'First Name',
              placeholder: 'Enter your first name',
              required: true,
              validation: { minLength: 2, maxLength: 50 },
            },
            {
              id: 'lastName',
              type: 'text',
              label: 'Last Name',
              placeholder: 'Enter your last name',
              required: true,
              validation: { minLength: 2, maxLength: 50 },
            },
            {
              id: 'email',
              type: 'email',
              label: 'Email Address',
              placeholder: 'you@example.com',
              required: true,
            },
            {
              id: 'phone',
              type: 'phone',
              label: 'Phone Number',
              placeholder: '+1 (555) 000-0000',
              required: true,
            },
            {
              id: 'location',
              type: 'text',
              label: 'Current Location',
              placeholder: 'City, State/Country',
              required: true,
            },
          ],
        },
        {
          id: 'resume',
          title: 'Resume',
          description: 'Upload your resume or import from other platforms',
          fields: [
            {
              id: 'resumeFile',
              type: 'file',
              label: 'Upload Resume (PDF, DOC, DOCX)',
              required: false,
            },
            {
              id: 'linkedinUrl',
              type: 'url',
              label: 'LinkedIn Profile URL',
              placeholder: 'https://linkedin.com/in/yourprofile',
              required: false,
            },
          ],
        },
        {
          id: 'experience',
          title: 'Work Experience',
          description: 'Tell us about your relevant experience',
          fields: [
            {
              id: 'yearsOfExperience',
              type: 'select',
              label: 'Total Years of Experience',
              required: true,
              options: [
                '0-1 years',
                '1-3 years',
                '3-5 years',
                '5-7 years',
                '7-10 years',
                '10+ years',
              ],
            },
            {
              id: 'currentTitle',
              type: 'text',
              label: 'Current/Most Recent Job Title',
              placeholder: 'e.g., Senior Software Engineer',
              required: true,
            },
            {
              id: 'currentCompany',
              type: 'text',
              label: 'Current/Most Recent Company',
              placeholder: 'Company name',
              required: true,
            },
          ],
        },
        {
          id: 'education',
          title: 'Education',
          description: 'Your educational background',
          fields: [
            {
              id: 'highestDegree',
              type: 'select',
              label: 'Highest Level of Education',
              required: true,
              options: [
                'High School',
                'Associate Degree',
                'Bachelor\'s Degree',
                'Master\'s Degree',
                'Doctorate (PhD)',
                'Professional Degree (MD, JD, etc.)',
                'Other',
              ],
            },
            {
              id: 'fieldOfStudy',
              type: 'text',
              label: 'Field of Study',
              placeholder: 'e.g., Computer Science',
              required: false,
            },
          ],
        },
        {
          id: 'additional',
          title: 'Additional Information',
          description: 'Help us understand more about you',
          fields: [
            {
              id: 'whyInterested',
              type: 'textarea',
              label: 'Why are you interested in this role?',
              placeholder: 'Tell us what excites you about this opportunity...',
              required: true,
              validation: { minLength: 50, maxLength: 2000 },
            },
            {
              id: 'expectedSalary',
              type: 'text',
              label: 'Expected Salary Range',
              placeholder: 'e.g., $100,000 - $120,000',
              required: false,
            },
            {
              id: 'startDate',
              type: 'select',
              label: 'Availability to Start',
              required: true,
              options: [
                'Immediately',
                '2 weeks notice',
                '1 month notice',
                '2 months notice',
                'Other',
              ],
            },
            {
              id: 'workAuthorization',
              type: 'select',
              label: 'Are you authorized to work in this country?',
              required: true,
              options: ['Yes', 'No', 'Requires Sponsorship'],
            },
            {
              id: 'referralSource',
              type: 'select',
              label: 'How did you hear about this position?',
              required: false,
              options: [
                'Company Website',
                'LinkedIn',
                'Indeed',
                'Glassdoor',
                'Employee Referral',
                'Recruiter',
                'Job Fair',
                'Other',
              ],
            },
          ],
        },
        {
          id: 'voluntary',
          title: 'Voluntary Self-Identification (Optional)',
          description: 'This information is used for diversity tracking and will not affect your application',
          fields: [
            {
              id: 'gender',
              type: 'select',
              label: 'Gender',
              required: false,
              options: ['Male', 'Female', 'Non-Binary', 'Prefer not to say'],
            },
            {
              id: 'ethnicity',
              type: 'select',
              label: 'Ethnicity',
              required: false,
              options: [
                'American Indian or Alaska Native',
                'Asian',
                'Black or African American',
                'Hispanic or Latino',
                'Native Hawaiian or Other Pacific Islander',
                'White',
                'Two or More Races',
                'Prefer not to say',
              ],
            },
            {
              id: 'veteranStatus',
              type: 'select',
              label: 'Veteran Status',
              required: false,
              options: [
                'I am a protected veteran',
                'I am not a protected veteran',
                'Prefer not to say',
              ],
            },
          ],
        },
        {
          id: 'consent',
          title: 'Agreements',
          fields: [
            {
              id: 'privacyConsent',
              type: 'checkbox',
              label: 'I have read and agree to the Privacy Policy and Terms of Use',
              required: true,
            },
            {
              id: 'dataProcessingConsent',
              type: 'checkbox',
              label: 'I consent to the processing of my personal data for recruitment purposes',
              required: true,
            },
          ],
        },
      ],
    };
  }

  /**
   * Submit application with form data
   */
  async submitApplication(
    candidateId: string,
    jobId: string,
    tenantId: string,
    formData: Record<string, any>,
    resumeData?: ParsedResumeData,
  ): Promise<{
    success: boolean;
    applicationId: string;
    matchScore?: number;
    message: string;
  }> {
    const candidate = await this.candidateUserRepository.findOne({
      where: { id: candidateId, tenantId },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    const job = await this.jobRepository.findOne({
      where: { id: jobId, tenantId, status: JobStatus.POSTED },
    });

    if (!job) {
      throw new BadRequestException('Job is not available for applications');
    }

    // Check for duplicate applications
    const existingApplication = await this.applicationRepository.findOne({
      where: {
        jobId,
        candidateId: candidate.id,
      },
    });

    if (existingApplication) {
      throw new BadRequestException('You have already applied for this position');
    }

    // Calculate match score if resume data is available
    let matchScore: number | undefined;
    if (resumeData) {
      const matchResult = await this.aiResumeParser.calculateJobMatchScore(
        resumeData,
        { skills: (job as any).requirements || [] },
      );
      matchScore = matchResult.score;
    }

    // Create application
    const application = this.applicationRepository.create({
      jobId,
      candidateId: candidate.id,
      status: ApplicationStatus.APPLIED,
      matchScore,
      aiAnalysis: resumeData ? {
        parsed: true,
        experience: resumeData.totalYearsOfExperience,
        skills: resumeData.skills,
      } : undefined,
    });

    const savedApplication = await this.applicationRepository.save(application) as Application;

    // Store form submission data
    const submission = this.formSubmissionRepository.create({
      candidateUserId: candidate.id,
      applicationId: savedApplication.id,
      tenantId,
      data: formData,
      status: 'pending',
    } as any);

    await this.formSubmissionRepository.save(submission);

    this.logger.log(`Application submitted: ${savedApplication.id} for job ${jobId}`);

    // Send confirmation email to candidate
    try {
      await this.emailService.sendApplicationSubmitted(candidate.email, {
        candidateName: `${candidate.firstName} ${candidate.lastName}`.trim() || 'Applicant',
        jobTitle: job.title,
        companyName: (job as any).company || 'Workera',
        applicationId: savedApplication.id,
        submittedDate: new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        trackingUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/portal/applications`,
      });
    } catch (emailError) {
      this.logger.warn(`Failed to send application confirmation email: ${emailError}`);
    }

    return {
      success: true,
      applicationId: savedApplication.id,
      matchScore,
      message: 'Your application has been submitted successfully!',
    };
  }
}
