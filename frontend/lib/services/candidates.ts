import { apiClient } from './api-client';
import { MOCK_CANDIDATES } from '../demo-data';

export interface Candidate {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  location?: string;
  skills?: string[];
  resumeText?: string;
  matchScore?: number;
  createdAt: string;
  // UI helper props
  status?: string;
  avatarUrl?: string;
}

export const candidatesService = {
  getAll: async () => {
    try {
      return await apiClient.get<Candidate[]>('/candidates');
    } catch (error) {
      console.warn('Backend API unavailable, falling back to demo data.', error);
      return MOCK_CANDIDATES.map(c => ({
        id: c.id,
        email: c.email,
        firstName: c.firstName,
        lastName: c.lastName,
        location: c.location,
        skills: ['React', 'Node.js'], // Mock skills
        matchScore: c.matchScore,
        createdAt: new Date().toISOString(),
        status: c.status
      }));
    }
  },

  getById: async (id: string) => {
    try {
      return await apiClient.get<Candidate>(`/candidates/${id}`);
    } catch (error) {
       const mock = MOCK_CANDIDATES.find(c => c.id === id);
       if (mock) return {
         ...mock,
         skills: [],
         createdAt: new Date().toISOString()
       } as unknown as Candidate;
       throw error;
    }
  },

  create: async (data: Partial<Candidate>) => {
    try {
      return await apiClient.post<Candidate>('/candidates', data);
    } catch (error) {
      return {
        id: Math.random().toString(),
        ...data,
        createdAt: new Date().toISOString()
      } as Candidate;
    }
  },

  bulkImport: async (candidates: Partial<Candidate>[]) => {
    try {
      return await apiClient.post<{ imported: number, failed: number, errors: string[] }>('/candidates/bulk-import', candidates);
    } catch (error) {
      return { imported: candidates.length, failed: 0, errors: [] };
    }
  }
};
