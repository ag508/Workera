import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require('pdf-parse');

export interface ParsedResumeData {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    location: string;
    linkedinUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
    profilePictureUrl?: string;
  };
  summary: string;
  totalYearsOfExperience: number;
  experience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    duration: string;
    location?: string;
    description: string;
    highlights: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    startYear: string;
    endYear: string;
    gpa?: string;
    honors?: string;
  }>;
  skills: {
    technical: string[];
    soft: string[];
    languages: string[];
    tools: string[];
  };
  certifications: Array<{
    name: string;
    issuer: string;
    date?: string;
    expirationDate?: string;
    credentialId?: string;
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    url?: string;
    startDate?: string;
    endDate?: string;
  }>;
  publications?: Array<{
    title: string;
    publication: string;
    date: string;
    url?: string;
  }>;
  awards?: Array<{
    name: string;
    issuer: string;
    date: string;
    description?: string;
  }>;
  volunteerExperience?: Array<{
    organization: string;
    role: string;
    startDate: string;
    endDate?: string;
    description: string;
  }>;
}

export interface ResumeImportSource {
  type: 'pdf' | 'linkedin' | 'indeed' | 'json' | 'text';
  content: string; // Base64 for PDF, URL for LinkedIn, JSON string, or plain text
}

@Injectable()
export class AIResumeParserService {
  private readonly logger = new Logger(AIResumeParserService.name);
  private genAI: GoogleGenerativeAI | null = null;
  private readonly modelName: string;

  constructor() {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    this.modelName = process.env.GOOGLE_AI_MODEL || 'gemini-pro';
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.logger.log(`AI Resume Parser initialized with model: ${this.modelName}`);
    }
  }

  /**
   * Parse resume from various sources using AI
   */
  async parseResume(source: ResumeImportSource): Promise<ParsedResumeData> {
    this.logger.log(`Parsing resume from source: ${source.type}`);

    let resumeText = '';

    switch (source.type) {
      case 'pdf':
        resumeText = await this.extractTextFromPDF(source.content);
        break;
      case 'linkedin':
        resumeText = await this.extractFromLinkedInProfile(source.content);
        break;
      case 'indeed':
        resumeText = await this.extractFromIndeedProfile(source.content);
        break;
      case 'json':
        return this.parseFromJSON(source.content);
      case 'text':
        resumeText = source.content;
        break;
    }

    // Use AI to parse the resume text
    return this.parseResumeWithAI(resumeText);
  }

  /**
   * Extract text from PDF (base64 encoded)
   * Uses pdf-parse library for real PDF text extraction
   */
  private async extractTextFromPDF(base64Content: string): Promise<string> {
    try {
      // Decode base64 to buffer
      const buffer = Buffer.from(base64Content, 'base64');

      this.logger.log(`Parsing PDF file (${buffer.length} bytes)`);

      // Use pdf-parse to extract text from PDF
      const data = await pdfParse(buffer, {
        // Options for better text extraction
        max: 0, // No page limit
      });

      const extractedText = data.text;

      // Clean up extracted text
      const cleanedText = extractedText
        .replace(/\s+/g, ' ') // Normalize whitespace
        .replace(/[^\x20-\x7E\n\r]/g, '') // Remove non-printable characters
        .trim();

      this.logger.log(`Extracted ${cleanedText.length} characters from PDF (${data.numpages} pages)`);

      if (cleanedText.length < 50) {
        this.logger.warn('PDF text extraction yielded minimal content, PDF may be image-based');
        return `[Image-based PDF - ${buffer.length} bytes, ${data.numpages} pages. Consider using OCR for better results.]`;
      }

      return cleanedText;
    } catch (error) {
      this.logger.error(`Failed to extract text from PDF: ${error.message}`);

      // Return a meaningful error message instead of empty string
      if (error.message?.includes('Invalid PDF')) {
        return '[Error: Invalid or corrupted PDF file]';
      }
      if (error.message?.includes('encrypted')) {
        return '[Error: PDF is password protected]';
      }

      return `[Error extracting PDF content: ${error.message}]`;
    }
  }

  /**
   * Extract data from LinkedIn profile URL
   */
  private async extractFromLinkedInProfile(profileUrl: string): Promise<string> {
    // In production, you would use LinkedIn API or scraping service
    // For demo, return simulated data
    this.logger.log(`Extracting from LinkedIn: ${profileUrl}`);

    // Extract username from URL for demo purposes
    const username = profileUrl.split('/').filter(Boolean).pop() || 'user';

    return `
      LinkedIn Profile: ${username}
      Professional with extensive experience in software development.
      Currently seeking new opportunities in technology.
    `;
  }

  /**
   * Extract data from Indeed profile
   */
  private async extractFromIndeedProfile(profileUrl: string): Promise<string> {
    this.logger.log(`Extracting from Indeed: ${profileUrl}`);
    return `Indeed Profile Data`;
  }

  /**
   * Parse from JSON format (e.g., JSON Resume standard)
   */
  private parseFromJSON(jsonContent: string): ParsedResumeData {
    try {
      const data = JSON.parse(jsonContent);

      // Handle JSON Resume format
      if (data.basics) {
        return this.parseJSONResumeFormat(data);
      }

      // Handle our custom format
      return data as ParsedResumeData;
    } catch (error) {
      this.logger.error('Failed to parse JSON resume', error);
      return this.getEmptyResumeData();
    }
  }

  /**
   * Parse JSON Resume standard format
   */
  private parseJSONResumeFormat(data: any): ParsedResumeData {
    const nameParts = (data.basics?.name || '').split(' ');

    return {
      personalInfo: {
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: data.basics?.email || '',
        phone: data.basics?.phone || '',
        location: data.basics?.location?.city || '',
        linkedinUrl: data.basics?.profiles?.find((p: any) => p.network === 'LinkedIn')?.url,
        githubUrl: data.basics?.profiles?.find((p: any) => p.network === 'GitHub')?.url,
        portfolioUrl: data.basics?.url,
      },
      summary: data.basics?.summary || '',
      totalYearsOfExperience: this.calculateTotalExperience(data.work || []),
      experience: (data.work || []).map((job: any) => ({
        company: job.name || job.company || '',
        position: job.position || '',
        startDate: job.startDate || '',
        endDate: job.endDate || 'Present',
        isCurrent: !job.endDate,
        duration: this.calculateDuration(job.startDate, job.endDate),
        location: job.location,
        description: job.summary || '',
        highlights: job.highlights || [],
      })),
      education: (data.education || []).map((edu: any) => ({
        institution: edu.institution || '',
        degree: edu.studyType || '',
        field: edu.area || '',
        startYear: edu.startDate?.split('-')[0] || '',
        endYear: edu.endDate?.split('-')[0] || '',
        gpa: edu.gpa,
      })),
      skills: {
        technical: (data.skills || []).flatMap((s: any) => s.keywords || []),
        soft: [],
        languages: (data.languages || []).map((l: any) => l.language),
        tools: [],
      },
      certifications: (data.certificates || []).map((cert: any) => ({
        name: cert.name || '',
        issuer: cert.issuer || '',
        date: cert.date,
      })),
      projects: (data.projects || []).map((proj: any) => ({
        name: proj.name || '',
        description: proj.description || '',
        technologies: proj.keywords || [],
        url: proj.url,
        startDate: proj.startDate,
        endDate: proj.endDate,
      })),
    };
  }

  /**
   * Use AI to parse resume text and extract structured data
   */
  async parseResumeWithAI(resumeText: string): Promise<ParsedResumeData> {
    if (!this.genAI) {
      this.logger.warn('Google AI not configured, using regex-based parsing');
      return this.parseWithRegex(resumeText);
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: this.modelName });

      const prompt = `
        Parse the following resume text and extract structured information.
        Return a JSON object with the following structure:

        {
          "personalInfo": {
            "firstName": "",
            "lastName": "",
            "email": "",
            "phone": "",
            "location": "",
            "linkedinUrl": "",
            "githubUrl": "",
            "portfolioUrl": ""
          },
          "summary": "",
          "totalYearsOfExperience": 0,
          "experience": [
            {
              "company": "",
              "position": "",
              "startDate": "YYYY-MM",
              "endDate": "YYYY-MM or Present",
              "isCurrent": false,
              "duration": "X years Y months",
              "location": "",
              "description": "",
              "highlights": []
            }
          ],
          "education": [
            {
              "institution": "",
              "degree": "",
              "field": "",
              "startYear": "",
              "endYear": "",
              "gpa": "",
              "honors": ""
            }
          ],
          "skills": {
            "technical": [],
            "soft": [],
            "languages": [],
            "tools": []
          },
          "certifications": [
            {
              "name": "",
              "issuer": "",
              "date": "",
              "credentialId": ""
            }
          ],
          "projects": [
            {
              "name": "",
              "description": "",
              "technologies": [],
              "url": ""
            }
          ]
        }

        Important instructions:
        1. Calculate totalYearsOfExperience by summing up all work experience durations.
           If dates are not explicit, infer from context (e.g., "5+ years experience in X").
        2. For experience duration, calculate from start and end dates.
        3. Extract ALL skills mentioned, categorizing them appropriately.
        4. Parse dates in various formats and normalize to YYYY-MM.
        5. If information is not available, use empty string or empty array.
        6. For isCurrent, set to true if endDate contains "Present", "Current", or is empty.

        Resume text:
        ${resumeText}

        Return ONLY the JSON object, no additional text.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return this.validateAndEnhanceData(parsed);
      }

      return this.parseWithRegex(resumeText);
    } catch (error) {
      this.logger.error('AI parsing failed, falling back to regex', error);
      return this.parseWithRegex(resumeText);
    }
  }

  /**
   * Fallback regex-based parsing
   */
  private parseWithRegex(resumeText: string): ParsedResumeData {
    const data = this.getEmptyResumeData();

    // Extract email
    const emailMatch = resumeText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    if (emailMatch) {
      data.personalInfo.email = emailMatch[0];
    }

    // Extract phone
    const phoneMatch = resumeText.match(/(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    if (phoneMatch) {
      data.personalInfo.phone = phoneMatch[0];
    }

    // Extract LinkedIn URL
    const linkedInMatch = resumeText.match(/linkedin\.com\/in\/[\w-]+/i);
    if (linkedInMatch) {
      data.personalInfo.linkedinUrl = `https://${linkedInMatch[0]}`;
    }

    // Extract GitHub URL
    const githubMatch = resumeText.match(/github\.com\/[\w-]+/i);
    if (githubMatch) {
      data.personalInfo.githubUrl = `https://${githubMatch[0]}`;
    }

    // Extract skills
    const skillKeywords = [
      'JavaScript', 'TypeScript', 'Python', 'Java', 'React', 'Node.js', 'Angular', 'Vue',
      'SQL', 'MongoDB', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes', 'Git', 'Agile',
      'Machine Learning', 'AI', 'DevOps', 'CI/CD', 'REST API', 'GraphQL', 'HTML', 'CSS',
      'C++', 'C#', 'Go', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Django', 'Flask', 'Express',
      'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Redis', 'Elasticsearch', 'Terraform',
      'Next.js', 'Nest.js', 'Spring Boot', 'FastAPI', 'Rust', 'Scala', 'R', 'MATLAB',
      'Azure', 'GCP', 'Heroku', 'Vercel', 'Netlify', 'Jenkins', 'CircleCI', 'GitHub Actions',
      'Figma', 'Sketch', 'Adobe XD', 'Photoshop', 'Illustrator', 'Jira', 'Confluence',
      'Scrum', 'Kanban', 'TDD', 'BDD', 'Microservices', 'REST', 'SOAP', 'gRPC'
    ];

    data.skills.technical = skillKeywords.filter(skill =>
      resumeText.toLowerCase().includes(skill.toLowerCase())
    );

    // Infer years of experience
    const yearsMatch = resumeText.match(/(\d+)\+?\s*years?\s*(of)?\s*experience/i);
    if (yearsMatch) {
      data.totalYearsOfExperience = parseInt(yearsMatch[1]);
    }

    // Extract summary
    const summaryPatterns = [
      /(?:Summary|Profile|About|Objective)\s*:?\s*([^\n]{50,500})/i,
      /^([A-Z][^.!?]*(?:[.!?][^.!?]*){1,3})/m
    ];

    for (const pattern of summaryPatterns) {
      const match = resumeText.match(pattern);
      if (match) {
        data.summary = match[1].trim();
        break;
      }
    }

    // Extract name (first line that looks like a name)
    const nameMatch = resumeText.match(/^([A-Z][a-z]+)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/m);
    if (nameMatch) {
      data.personalInfo.firstName = nameMatch[1];
      data.personalInfo.lastName = nameMatch[2];
    }

    return data;
  }

  /**
   * Validate and enhance parsed data
   */
  private validateAndEnhanceData(data: any): ParsedResumeData {
    const result = this.getEmptyResumeData();

    // Merge personal info
    if (data.personalInfo) {
      result.personalInfo = { ...result.personalInfo, ...data.personalInfo };
    }

    result.summary = data.summary || '';
    result.totalYearsOfExperience = data.totalYearsOfExperience || 0;

    // If total experience is 0, calculate from experience entries
    if (result.totalYearsOfExperience === 0 && data.experience?.length > 0) {
      result.totalYearsOfExperience = this.calculateTotalExperience(data.experience);
    }

    result.experience = (data.experience || []).map((exp: any) => ({
      company: exp.company || '',
      position: exp.position || '',
      startDate: exp.startDate || '',
      endDate: exp.endDate || '',
      isCurrent: exp.isCurrent || false,
      duration: exp.duration || this.calculateDuration(exp.startDate, exp.endDate),
      location: exp.location || '',
      description: exp.description || '',
      highlights: exp.highlights || [],
    }));

    result.education = (data.education || []).map((edu: any) => ({
      institution: edu.institution || '',
      degree: edu.degree || '',
      field: edu.field || '',
      startYear: edu.startYear || '',
      endYear: edu.endYear || '',
      gpa: edu.gpa || '',
      honors: edu.honors || '',
    }));

    result.skills = {
      technical: data.skills?.technical || [],
      soft: data.skills?.soft || [],
      languages: data.skills?.languages || [],
      tools: data.skills?.tools || [],
    };

    result.certifications = data.certifications || [];
    result.projects = data.projects || [];
    result.publications = data.publications || [];
    result.awards = data.awards || [];
    result.volunteerExperience = data.volunteerExperience || [];

    return result;
  }

  /**
   * Calculate total years of experience from work history
   */
  private calculateTotalExperience(experience: any[]): number {
    let totalMonths = 0;

    for (const job of experience) {
      const startDate = this.parseDate(job.startDate);
      const endDate = job.endDate && !['Present', 'Current', ''].includes(job.endDate)
        ? this.parseDate(job.endDate)
        : new Date();

      if (startDate && endDate) {
        const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
                       (endDate.getMonth() - startDate.getMonth());
        totalMonths += Math.max(0, months);
      }
    }

    return Math.round(totalMonths / 12 * 10) / 10; // Round to 1 decimal place
  }

  /**
   * Calculate duration between two dates
   */
  private calculateDuration(startDate: string, endDate: string): string {
    const start = this.parseDate(startDate);
    const end = endDate && !['Present', 'Current', ''].includes(endDate)
      ? this.parseDate(endDate)
      : new Date();

    if (!start || !end) return '';

    const months = (end.getFullYear() - start.getFullYear()) * 12 +
                   (end.getMonth() - start.getMonth());

    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (years === 0) {
      return `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
    }

    if (remainingMonths === 0) {
      return `${years} year${years !== 1 ? 's' : ''}`;
    }

    return `${years} year${years !== 1 ? 's' : ''} ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
  }

  /**
   * Parse date string to Date object
   */
  private parseDate(dateStr: string): Date | null {
    if (!dateStr) return null;

    // Try various formats
    const formats = [
      /^(\d{4})-(\d{2})(?:-\d{2})?$/, // YYYY-MM or YYYY-MM-DD
      /^(\d{2})\/(\d{4})$/, // MM/YYYY
      /^([A-Za-z]+)\s+(\d{4})$/, // Month YYYY
      /^(\d{4})$/, // Just year
    ];

    for (const format of formats) {
      const match = dateStr.match(format);
      if (match) {
        if (match.length === 2) {
          // Just year
          return new Date(parseInt(match[1]), 0);
        }

        let year: number, month: number;

        if (isNaN(parseInt(match[1]))) {
          // Month name format
          const monthNames = ['january', 'february', 'march', 'april', 'may', 'june',
                            'july', 'august', 'september', 'october', 'november', 'december'];
          month = monthNames.indexOf(match[1].toLowerCase());
          year = parseInt(match[2]);
        } else if (match[1].length === 4) {
          // YYYY-MM format
          year = parseInt(match[1]);
          month = parseInt(match[2]) - 1;
        } else {
          // MM/YYYY format
          month = parseInt(match[1]) - 1;
          year = parseInt(match[2]);
        }

        return new Date(year, month);
      }
    }

    // Try native Date parsing as fallback
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  /**
   * Get empty resume data structure
   */
  private getEmptyResumeData(): ParsedResumeData {
    return {
      personalInfo: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        location: '',
        linkedinUrl: '',
        githubUrl: '',
        portfolioUrl: '',
      },
      summary: '',
      totalYearsOfExperience: 0,
      experience: [],
      education: [],
      skills: {
        technical: [],
        soft: [],
        languages: [],
        tools: [],
      },
      certifications: [],
      projects: [],
    };
  }

  /**
   * Calculate match score between resume and job requirements
   */
  async calculateJobMatchScore(
    resumeData: ParsedResumeData,
    jobRequirements: {
      skills: string[];
      minExperience?: number;
      education?: string[];
      certifications?: string[];
    },
  ): Promise<{
    score: number;
    breakdown: {
      skillsMatch: number;
      experienceMatch: number;
      educationMatch: number;
      certificationsMatch: number;
    };
    matchedSkills: string[];
    missingSkills: string[];
    recommendations: string[];
  }> {
    const allResumeSkills = [
      ...resumeData.skills.technical,
      ...resumeData.skills.soft,
      ...resumeData.skills.tools,
    ].map(s => s.toLowerCase());

    const requiredSkills = jobRequirements.skills.map(s => s.toLowerCase());

    // Skills match
    const matchedSkills = requiredSkills.filter(skill =>
      allResumeSkills.some(resumeSkill =>
        resumeSkill.includes(skill) || skill.includes(resumeSkill)
      )
    );
    const missingSkills = requiredSkills.filter(skill => !matchedSkills.includes(skill));
    const skillsMatch = requiredSkills.length > 0
      ? (matchedSkills.length / requiredSkills.length) * 100
      : 100;

    // Experience match
    let experienceMatch = 100;
    if (jobRequirements.minExperience) {
      if (resumeData.totalYearsOfExperience >= jobRequirements.minExperience) {
        experienceMatch = 100;
      } else if (resumeData.totalYearsOfExperience >= jobRequirements.minExperience * 0.7) {
        experienceMatch = 70;
      } else if (resumeData.totalYearsOfExperience >= jobRequirements.minExperience * 0.5) {
        experienceMatch = 50;
      } else {
        experienceMatch = 30;
      }
    }

    // Education match
    let educationMatch = 100;
    if (jobRequirements.education && jobRequirements.education.length > 0) {
      const candidateDegrees = resumeData.education.map(e =>
        `${e.degree} ${e.field}`.toLowerCase()
      );
      const hasRequiredEducation = jobRequirements.education.some(reqEdu =>
        candidateDegrees.some(candEdu => candEdu.includes(reqEdu.toLowerCase()))
      );
      educationMatch = hasRequiredEducation ? 100 : 50;
    }

    // Certifications match
    let certificationsMatch = 100;
    if (jobRequirements.certifications && jobRequirements.certifications.length > 0) {
      const candidateCerts = resumeData.certifications.map(c => c.name.toLowerCase());
      const matchedCerts = jobRequirements.certifications.filter(reqCert =>
        candidateCerts.some(candCert => candCert.includes(reqCert.toLowerCase()))
      );
      certificationsMatch = (matchedCerts.length / jobRequirements.certifications.length) * 100;
    }

    // Calculate weighted score
    const score = Math.round(
      skillsMatch * 0.4 +
      experienceMatch * 0.3 +
      educationMatch * 0.2 +
      certificationsMatch * 0.1
    );

    // Generate recommendations
    const recommendations: string[] = [];
    if (missingSkills.length > 0) {
      recommendations.push(`Consider gaining experience in: ${missingSkills.slice(0, 3).join(', ')}`);
    }
    if (experienceMatch < 70 && jobRequirements.minExperience) {
      recommendations.push(`Position requires ${jobRequirements.minExperience}+ years of experience`);
    }
    if (educationMatch < 100 && jobRequirements.education) {
      recommendations.push(`Preferred education: ${jobRequirements.education.join(' or ')}`);
    }

    return {
      score,
      breakdown: {
        skillsMatch: Math.round(skillsMatch),
        experienceMatch: Math.round(experienceMatch),
        educationMatch: Math.round(educationMatch),
        certificationsMatch: Math.round(certificationsMatch),
      },
      matchedSkills: matchedSkills.map(s => jobRequirements.skills.find(
        js => js.toLowerCase() === s
      ) || s),
      missingSkills: missingSkills.map(s => jobRequirements.skills.find(
        js => js.toLowerCase() === s
      ) || s),
      recommendations,
    };
  }
}
