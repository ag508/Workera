const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = {
  async generateJobDescription(jobTitle: string, company?: string, requirements?: string[]) {
    const response = await fetch(`${API_BASE_URL}/ai/generate-jd`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jobTitle,
        company,
        requirements,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate job description');
    }

    const data = await response.json();
    return data.data.jobDescription;
  },

  async analyzeResume(resumeText: string, jobDescription: string) {
    const response = await fetch(`${API_BASE_URL}/ai/analyze-resume`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeText,
        jobDescription,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze resume');
    }

    const data = await response.json();
    return data.data;
  },

  async createJob(title: string, description?: string, company?: string, generateWithAI?: boolean) {
    const response = await fetch(`${API_BASE_URL}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        description,
        company,
        generateWithAI,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create job');
    }

    const data = await response.json();
    return data.data;
  },

  async postJob(jobId: string, channels: string[]) {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/post`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channels,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to post job');
    }

    const data = await response.json();
    return data.data;
  },
};
