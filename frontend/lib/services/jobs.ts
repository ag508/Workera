import { apiClient } from './api-client';
import { MOCK_JOBS } from '../demo-data';

export interface Job {
  id: string;
  title: string;
  description: string;
  company?: string;
  location?: string;
  type?: string;
  requirements?: string[];
  status: 'DRAFT' | 'POSTED' | 'CLOSED' | 'ARCHIVED' | 'Active'; // Added Active for mock compatibility
  channels?: string[];
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  applicantCount?: number;
}

export interface CreateJobDto {
  title: string;
  description?: string;
  company?: string;
  requirements?: string[];
  generateWithAI?: boolean;
}

export const jobsService = {
  getAll: async () => {
    try {
      return await apiClient.get<Job[]>('/jobs');
    } catch (error) {
      console.warn('Backend API unavailable, falling back to demo data.', error);
      // Fallback to MOCK_JOBS
      return MOCK_JOBS.map(j => ({
        id: j.id,
        title: j.title,
        description: 'This is a demo job description used when the backend is unavailable.',
        company: j.department,
        location: j.location,
        type: j.type,
        status: j.status as any,
        tenantId: 'demo-tenant',
        createdAt: j.postedAt,
        updatedAt: j.postedAt,
        applicantCount: j.applicants,
        requirements: ['React', 'TypeScript', 'Node.js'],
        channels: []
      }));
    }
  },

  getById: async (id: string) => {
    try {
      return await apiClient.get<Job>(`/jobs/${id}`);
    } catch (error) {
      const mock = MOCK_JOBS.find(j => j.id === id);
      if (mock) {
        return {
          ...mock,
          description: 'Mock description',
          company: mock.department,
          tenantId: 'demo',
          createdAt: mock.postedAt,
          updatedAt: mock.postedAt,
          status: mock.status as any,
          requirements: []
        } as unknown as Job;
      }
      throw error;
    }
  },

  create: async (data: CreateJobDto) => {
    try {
      return await apiClient.post<Job>('/jobs', data);
    } catch (error) {
      console.warn('Backend API unavailable, simulating creation.');
      return {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        description: data.description || '',
        status: 'DRAFT',
        tenantId: 'demo',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        channels: [],
        applicantCount: 0
      } as Job;
    }
  },

  post: async (id: string, channels: string[]) => {
    try {
      return await apiClient.put<Job>(`/jobs/${id}/post`, { channels });
    } catch (error) {
      return null;
    }
  },

  update: async (id: string, data: Partial<Job>) => {
    try {
      return await apiClient.put<Job>(`/jobs/${id}`, data);
    } catch (error) {
      return null;
    }
  },

  delete: async (id: string) => {
    try {
      await apiClient.delete(`/jobs/${id}`);
      return true;
    } catch (error) {
      console.warn('Backend API unavailable, simulating deletion.');
      return true;
    }
  },

  duplicate: async (id: string) => {
    try {
      return await apiClient.post<Job>(`/jobs/${id}/duplicate`, {});
    } catch (error) {
      console.warn('Backend API unavailable, simulating duplication.');
      return null;
    }
  }
};
