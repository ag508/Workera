import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GOOGLE_AI_API_KEY || 'AIzaSyCCl9Dsqx70cI36v2oDR7H5FGfE9gji7vU';
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateJobDescription(jobTitle: string, company?: string, requirements?: string[]): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-3-pro-preview' });

      const companyLine = company ? 'Company: ' + company : '';
      const reqLine = requirements && requirements.length > 0 ? 'Additional Requirements: ' + requirements.join(', ') : '';
      
      const prompt = 'You are an expert HR professional and job description writer. Generate a comprehensive, professional job description for the following role:\n\nJob Title: ' + jobTitle + '\n' + companyLine + '\n' + reqLine + '\n\nCreate a detailed job description that includes:\n1. About the Role (2-3 sentences describing the position)\n2. Key Responsibilities (5-7 bullet points)\n3. Required Qualifications (4-6 bullet points)\n4. Preferred Qualifications (3-4 bullet points)\n5. What We Offer (4-5 bullet points about benefits and perks)\n6. How to Apply (brief instructions)\n\nFormat the output in Markdown with proper headings and bullet points. Make it professional, engaging, and optimized for ATS systems.';

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return text;
    } catch (error) {
      console.error('Error generating job description:', error);
      throw new Error('Failed to generate job description');
    }
  }

  async analyzeResume(resumeText: string, jobDescription: string): Promise<any> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-3-pro-preview' });

      const prompt = 'As an expert recruiter, analyze how well this candidate resume matches the job description.\n\nJOB DESCRIPTION:\n' + jobDescription + '\n\nRESUME:\n' + resumeText + '\n\nProvide your analysis in JSON format with: matchScore (0-100), strengths (array), gaps (array), recommendation (string)';

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Error analyzing resume:', error);
      throw new Error('Failed to analyze resume');
    }
  }

  async parseResume(resumeText: string): Promise<any> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-3-pro-preview' });

      const prompt = `You are an expert resume parser. Extract structured information from this resume.

RESUME TEXT:
${resumeText}

Provide your output in JSON format with the following structure:
{
  "summary": "Brief professional summary (2-3 sentences)",
  "experience": [
    {
      "company": "Company name",
      "position": "Job title",
      "startDate": "YYYY-MM or YYYY",
      "endDate": "YYYY-MM or YYYY or Present",
      "description": "Key responsibilities and achievements"
    }
  ],
  "education": [
    {
      "institution": "School/University name",
      "degree": "Degree type",
      "field": "Field of study",
      "year": "Graduation year"
    }
  ],
  "skills": ["skill1", "skill2", "skill3"],
  "certifications": ["cert1", "cert2"]
}

Extract all available information. If a field is not present, use an empty array or empty string.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Error parsing resume:', error);
      // Return default structure if parsing fails
      return {
        summary: '',
        experience: [],
        education: [],
        skills: [],
        certifications: [],
      };
    }
  }
}
