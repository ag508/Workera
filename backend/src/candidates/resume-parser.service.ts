import { Injectable } from '@nestjs/common';

export interface ParsedResume {
  summary: string;
  experience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    year: string;
  }>;
  skills: string[];
  certifications: string[];
}

@Injectable()
export class ResumeParserService {
  parseResumeText(resumeText: string): ParsedResume {
    // Basic regex-based parsing (will be enhanced with NLP in future)
    const parsed: ParsedResume = {
      summary: '',
      experience: [],
      education: [],
      skills: [],
      certifications: [],
    };

    // Extract email and phone
    const emailMatch = resumeText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    const phoneMatch = resumeText.match(/(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);

    // Extract skills (common technical skills)
    const skillKeywords = [
      'JavaScript', 'TypeScript', 'Python', 'Java', 'React', 'Node.js', 'Angular', 'Vue',
      'SQL', 'MongoDB', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes', 'Git', 'Agile',
      'Machine Learning', 'AI', 'DevOps', 'CI/CD', 'REST API', 'GraphQL', 'HTML', 'CSS',
      'C++', 'C#', 'Go', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Django', 'Flask', 'Express',
      'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Redis', 'Elasticsearch', 'Terraform'
    ];

    parsed.skills = skillKeywords.filter(skill => 
      resumeText.toLowerCase().includes(skill.toLowerCase())
    );

    // Extract summary (first paragraph or section after name)
    const summaryMatch = resumeText.match(/(?:Summary|Profile|About)\s*:?\s*([^\n]{50,500})/i);
    if (summaryMatch) {
      parsed.summary = summaryMatch[1].trim();
    }

    // Extract experience (simplified pattern matching)
    const experiencePattern = /(?:Experience|Employment|Work History)\s*:?\s*([\s\S]{100,2000}?)(?=Education|Skills|Certifications|$)/i;
    const experienceMatch = resumeText.match(experiencePattern);
    if (experienceMatch) {
      const experienceText = experienceMatch[1];
      // Parse individual experiences (this is a simplified version)
      const companyMatches = experienceText.match(/([A-Z][a-zA-Z\s&,]+(?:Inc|LLC|Corp|Ltd|Company)?)\s*[-–—]\s*([A-Z][a-zA-Z\s]+)/g);
      if (companyMatches) {
        companyMatches.slice(0, 5).forEach(match => {
          const parts = match.split(/[-–—]/);
          if (parts.length >= 2) {
            parsed.experience.push({
              company: parts[0].trim(),
              position: parts[1].trim(),
              startDate: '',
              endDate: '',
              description: ''
            });
          }
        });
      }
    }

    // Extract education
    const educationPattern = /(?:Education)\s*:?\s*([\s\S]{50,1000}?)(?=Experience|Skills|Certifications|$)/i;
    const educationMatch = resumeText.match(educationPattern);
    if (educationMatch) {
      const eduText = educationMatch[1];
      const degrees = ['Bachelor', 'Master', 'PhD', 'MBA', 'Associate', 'BS', 'BA', 'MS', 'MA'];
      degrees.forEach(degree => {
        const degreeRegex = new RegExp(`(${degree}[^\\n]{10,100})`, 'gi');
        const matches = eduText.match(degreeRegex);
        if (matches) {
          matches.slice(0, 3).forEach(match => {
            parsed.education.push({
              institution: '',
              degree: match.trim(),
              field: '',
              year: ''
            });
          });
        }
      });
    }

    // Extract certifications
    const certPattern = /(?:Certifications?|Licenses?)\s*:?\s*([\s\S]{20,500}?)(?=Experience|Education|Skills|$)/i;
    const certMatch = resumeText.match(certPattern);
    if (certMatch) {
      const certText = certMatch[1];
      const lines = certText.split('\n').filter(line => line.trim().length > 5);
      parsed.certifications = lines.slice(0, 5).map(line => line.trim());
    }

    return parsed;
  }

  extractContactInfo(resumeText: string): { email?: string; phone?: string } {
    const emailMatch = resumeText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    const phoneMatch = resumeText.match(/(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);

    return {
      email: emailMatch ? emailMatch[0] : undefined,
      phone: phoneMatch ? phoneMatch[0] : undefined,
    };
  }

  extractSkills(resumeText: string): string[] {
    const skillKeywords = [
      'JavaScript', 'TypeScript', 'Python', 'Java', 'React', 'Node.js', 'Angular', 'Vue',
      'SQL', 'MongoDB', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes', 'Git', 'Agile',
      'Machine Learning', 'AI', 'DevOps', 'CI/CD', 'REST API', 'GraphQL', 'HTML', 'CSS'
    ];

    return skillKeywords.filter(skill => 
      resumeText.toLowerCase().includes(skill.toLowerCase())
    );
  }
}
