import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NLPService } from '../nlp/nlp.service';
import { Candidate } from '../database/entities/candidate.entity';
import { Job } from '../database/entities/job.entity';

export interface VectorDocument {
  id: string;
  text: string;
  embedding: number[];
  metadata: Record<string, any>;
  entityType: 'candidate' | 'job' | 'resume';
  createdAt: Date;
}

export interface SearchResult {
  id: string;
  score: number;
  text: string;
  metadata: Record<string, any>;
  entityType: string;
}

/**
 * In-memory FAISS-like vector store
 * For production, integrate with actual FAISS library or vector database (Pinecone, Weaviate, etc.)
 */
@Injectable()
export class EmbeddingsService {
  private readonly logger = new Logger(EmbeddingsService.name);
  private vectorStore: Map<string, VectorDocument> = new Map();
  private index: Map<string, VectorDocument[]> = new Map(); // Simple index by entity type

  constructor(
    private nlpService: NLPService,
    @InjectRepository(Candidate)
    private candidateRepository: Repository<Candidate>,
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
  ) {}

  /**
   * Add document to vector store
   */
  async addDocument(
    id: string,
    text: string,
    entityType: 'candidate' | 'job' | 'resume',
    metadata: Record<string, any> = {},
  ): Promise<VectorDocument> {
    try {
      const { embedding } = await this.nlpService.generateEmbedding(text);

      const document: VectorDocument = {
        id,
        text,
        embedding,
        metadata,
        entityType,
        createdAt: new Date(),
      };

      this.vectorStore.set(id, document);

      // Update index
      if (!this.index.has(entityType)) {
        this.index.set(entityType, []);
      }
      this.index.get(entityType)!.push(document);

      this.logger.log(`Added document ${id} to vector store (${entityType})`);

      return document;
    } catch (error) {
      this.logger.error(`Failed to add document to vector store: ${error.message}`);
      throw error;
    }
  }

  /**
   * Search for similar documents using semantic search
   */
  async search(
    query: string,
    entityType?: 'candidate' | 'job' | 'resume',
    topK: number = 10,
  ): Promise<SearchResult[]> {
    try {
      const { embedding: queryEmbedding } = await this.nlpService.generateEmbedding(query);

      // Get documents to search
      let documents: VectorDocument[];
      if (entityType) {
        documents = this.index.get(entityType) || [];
      } else {
        documents = Array.from(this.vectorStore.values());
      }

      // Calculate similarity scores
      const results = documents.map(doc => ({
        id: doc.id,
        score: this.cosineSimilarity(queryEmbedding, doc.embedding),
        text: doc.text,
        metadata: doc.metadata,
        entityType: doc.entityType,
      }));

      // Sort by score and return top K
      results.sort((a, b) => b.score - a.score);

      this.logger.log(`Found ${results.length} results for query, returning top ${topK}`);

      return results.slice(0, topK);
    } catch (error) {
      this.logger.error(`Failed to search vector store: ${error.message}`);
      return [];
    }
  }

  /**
   * Find similar candidates to a job description
   */
  async findSimilarCandidates(jobDescription: string, topK: number = 20): Promise<SearchResult[]> {
    return this.search(jobDescription, 'candidate', topK);
  }

  /**
   * Find similar jobs for a candidate
   */
  async findSimilarJobs(candidateProfile: string, topK: number = 10): Promise<SearchResult[]> {
    return this.search(candidateProfile, 'job', topK);
  }

  /**
   * Index all candidates in the database
   */
  async indexAllCandidates(tenantId: string): Promise<number> {
    try {
      const candidates = await this.candidateRepository.find({
        where: { tenantId },
        relations: ['resumes'],
      });

      let indexed = 0;
      for (const candidate of candidates) {
        const text = this.buildCandidateText(candidate);
        await this.addDocument(
          candidate.id,
          text,
          'candidate',
          {
            name: `${candidate.firstName} ${candidate.lastName}`,
            email: candidate.email,
            skills: candidate.skills,
            location: candidate.location,
          },
        );
        indexed++;
      }

      this.logger.log(`Indexed ${indexed} candidates for tenant ${tenantId}`);
      return indexed;
    } catch (error) {
      this.logger.error(`Failed to index candidates: ${error.message}`);
      return 0;
    }
  }

  /**
   * Index all jobs in the database
   */
  async indexAllJobs(tenantId: string): Promise<number> {
    try {
      const jobs = await this.jobRepository.find({
        where: { tenantId },
      });

      let indexed = 0;
      for (const job of jobs) {
        const text = this.buildJobText(job);
        await this.addDocument(
          job.id,
          text,
          'job',
          {
            title: job.title,
            company: job.company,
            location: job.location,
            status: job.status,
          },
        );
        indexed++;
      }

      this.logger.log(`Indexed ${indexed} jobs for tenant ${tenantId}`);
      return indexed;
    } catch (error) {
      this.logger.error(`Failed to index jobs: ${error.message}`);
      return 0;
    }
  }

  /**
   * Remove document from vector store
   */
  removeDocument(id: string): boolean {
    const document = this.vectorStore.get(id);
    if (!document) {
      return false;
    }

    this.vectorStore.delete(id);

    // Remove from index
    const entityDocs = this.index.get(document.entityType);
    if (entityDocs) {
      const index = entityDocs.findIndex(doc => doc.id === id);
      if (index !== -1) {
        entityDocs.splice(index, 1);
      }
    }

    this.logger.log(`Removed document ${id} from vector store`);
    return true;
  }

  /**
   * Clear all documents for a tenant
   */
  clearTenant(tenantId: string): number {
    let removed = 0;
    for (const [id, doc] of this.vectorStore.entries()) {
      if (doc.metadata.tenantId === tenantId) {
        this.removeDocument(id);
        removed++;
      }
    }
    return removed;
  }

  /**
   * Get vector store statistics
   */
  getStats(): {
    totalDocuments: number;
    byEntityType: Record<string, number>;
    oldestDocument: Date | null;
    newestDocument: Date | null;
  } {
    const byEntityType: Record<string, number> = {};
    let oldest: Date | null = null;
    let newest: Date | null = null;

    for (const doc of this.vectorStore.values()) {
      byEntityType[doc.entityType] = (byEntityType[doc.entityType] || 0) + 1;

      if (!oldest || doc.createdAt < oldest) {
        oldest = doc.createdAt;
      }
      if (!newest || doc.createdAt > newest) {
        newest = doc.createdAt;
      }
    }

    return {
      totalDocuments: this.vectorStore.size,
      byEntityType,
      oldestDocument: oldest,
      newestDocument: newest,
    };
  }

  /**
   * Build searchable text from candidate
   */
  private buildCandidateText(candidate: Candidate): string {
    const parts = [
      `Name: ${candidate.firstName} ${candidate.lastName}`,
      `Email: ${candidate.email}`,
      candidate.phone ? `Phone: ${candidate.phone}` : '',
      candidate.location ? `Location: ${candidate.location}` : '',
      candidate.skills?.length ? `Skills: ${candidate.skills.join(', ')}` : '',
    ];

    return parts.filter(Boolean).join('\n');
  }

  /**
   * Build searchable text from job
   */
  private buildJobText(job: Job): string {
    const parts = [
      `Title: ${job.title}`,
      `Company: ${job.company}`,
      job.location ? `Location: ${job.location}` : '',
      job.salary ? `Salary: ${job.salary}` : '',
      job.description ? `Description: ${job.description}` : '',
      job.requirements?.length ? `Requirements: ${job.requirements.join(', ')}` : '',
      job.status ? `Status: ${job.status}` : '',
    ];

    return parts.filter(Boolean).join('\n');
  }

  /**
   * Cosine similarity between two vectors
   */
  private cosineSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) {
      return 0;
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }

    const magnitude = Math.sqrt(norm1) * Math.sqrt(norm2);
    return magnitude === 0 ? 0 : dotProduct / magnitude;
  }
}
