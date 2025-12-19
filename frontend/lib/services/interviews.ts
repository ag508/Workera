import { apiClient } from './api-client';

export type InterviewType = 'PHONE_SCREEN' | 'TECHNICAL' | 'BEHAVIORAL' | 'CULTURE_FIT' | 'FINAL' | 'PANEL';
export type InterviewStatus = 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED' | 'NO_SHOW';

export interface Interview {
  id: string;
  applicationId: string;
  type: InterviewType;
  status: InterviewStatus;
  scheduledAt: string;
  durationMinutes: number;
  meetingLink?: string;
  location?: string;
  notes?: string;
  feedback?: {
    rating?: number;
    strengths?: string[];
    concerns?: string[];
    recommendation?: string;
    comments?: string;
  };
  application?: {
    candidate: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    job: {
      id: string;
      title: string;
      company?: string;
    };
  };
  interviewer?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Mock data for demo when backend is unavailable
const MOCK_INTERVIEWS: Interview[] = [
  {
    id: '1',
    applicationId: 'app-1',
    type: 'TECHNICAL',
    status: 'SCHEDULED',
    scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    durationMinutes: 60,
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    application: {
      candidate: { id: 'c1', firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com' },
      job: { id: 'j1', title: 'Senior Frontend Developer', company: 'TechCorp' }
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    applicationId: 'app-2',
    type: 'BEHAVIORAL',
    status: 'CONFIRMED',
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    durationMinutes: 45,
    meetingLink: 'https://zoom.us/j/1234567890',
    application: {
      candidate: { id: 'c2', firstName: 'Michael', lastName: 'Chen', email: 'michael@example.com' },
      job: { id: 'j2', title: 'Backend Engineer', company: 'StartupXYZ' }
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    applicationId: 'app-3',
    type: 'FINAL',
    status: 'SCHEDULED',
    scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    durationMinutes: 90,
    location: 'Office - Conference Room A',
    application: {
      candidate: { id: 'c3', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah@example.com' },
      job: { id: 'j3', title: 'Product Manager', company: 'InnovateCo' }
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    applicationId: 'app-4',
    type: 'PHONE_SCREEN',
    status: 'COMPLETED',
    scheduledAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
    durationMinutes: 30,
    meetingLink: 'https://meet.google.com/xyz-uvwx-yz',
    feedback: {
      rating: 4,
      strengths: ['Good communication', 'Strong technical background'],
      concerns: ['Limited team lead experience'],
      recommendation: 'Proceed to next round',
      comments: 'Great first impression. Candidate was well-prepared.'
    },
    application: {
      candidate: { id: 'c4', firstName: 'David', lastName: 'Brown', email: 'david@example.com' },
      job: { id: 'j1', title: 'Senior Frontend Developer', company: 'TechCorp' }
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '5',
    applicationId: 'app-5',
    type: 'CULTURE_FIT',
    status: 'CANCELLED',
    scheduledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    durationMinutes: 45,
    notes: 'Candidate withdrew application',
    application: {
      candidate: { id: 'c5', firstName: 'Emma', lastName: 'Wilson', email: 'emma@example.com' },
      job: { id: 'j2', title: 'Backend Engineer', company: 'StartupXYZ' }
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const interviewsService = {
  getUpcoming: async (): Promise<Interview[]> => {
    try {
      return await apiClient.get<Interview[]>('/interviews/upcoming');
    } catch (error) {
      console.warn('Backend API unavailable, falling back to demo data.', error);
      // Return only future scheduled/confirmed interviews
      return MOCK_INTERVIEWS.filter(
        i => ['SCHEDULED', 'CONFIRMED'].includes(i.status) && new Date(i.scheduledAt) > new Date()
      );
    }
  },

  getAll: async (): Promise<Interview[]> => {
    try {
      return await apiClient.get<Interview[]>('/interviews');
    } catch (error) {
      console.warn('Backend API unavailable, falling back to demo data.', error);
      return MOCK_INTERVIEWS;
    }
  },

  getById: async (id: string): Promise<Interview | null> => {
    try {
      return await apiClient.get<Interview>(`/interviews/${id}`);
    } catch (error) {
      const mock = MOCK_INTERVIEWS.find(i => i.id === id);
      return mock || null;
    }
  },

  schedule: async (data: {
    applicationId: string;
    type: InterviewType;
    scheduledAt: string;
    durationMinutes?: number;
    meetingLink?: string;
    location?: string;
    notes?: string;
    interviewerId?: string;
  }): Promise<Interview> => {
    try {
      return await apiClient.post<Interview>('/interviews', data);
    } catch (error) {
      // Return mock interview
      return {
        id: `mock-${Date.now()}`,
        ...data,
        status: 'SCHEDULED',
        durationMinutes: data.durationMinutes || 60,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as Interview;
    }
  },

  updateStatus: async (id: string, status: InterviewStatus): Promise<Interview | null> => {
    try {
      return await apiClient.put<Interview>(`/interviews/${id}/status`, { status });
    } catch (error) {
      const mock = MOCK_INTERVIEWS.find(i => i.id === id);
      if (mock) {
        mock.status = status;
        return mock;
      }
      return null;
    }
  },

  reschedule: async (id: string, newTime: string): Promise<Interview | null> => {
    try {
      return await apiClient.put<Interview>(`/interviews/${id}/reschedule`, { newTime });
    } catch (error) {
      const mock = MOCK_INTERVIEWS.find(i => i.id === id);
      if (mock) {
        mock.scheduledAt = newTime;
        mock.status = 'RESCHEDULED';
        return mock;
      }
      return null;
    }
  },

  submitFeedback: async (id: string, feedback: {
    rating?: number;
    strengths?: string[];
    concerns?: string[];
    recommendation?: string;
    comments?: string;
  }): Promise<Interview | null> => {
    try {
      return await apiClient.put<Interview>(`/interviews/${id}/feedback`, feedback);
    } catch (error) {
      const mock = MOCK_INTERVIEWS.find(i => i.id === id);
      if (mock) {
        mock.feedback = feedback;
        mock.status = 'COMPLETED';
        return mock;
      }
      return null;
    }
  }
};
