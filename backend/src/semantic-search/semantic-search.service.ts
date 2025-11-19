import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';
import { EmbeddingsService, SearchResult } from '../embeddings/embeddings.service';
import { NLPService } from '../nlp/nlp.service';

export interface RAGResult {
  answer: string;
  sources: SearchResult[];
  confidence: number;
  reasoning: string;
}

export interface SemanticSearchQuery {
  query: string;
  tenantId: string;
  entityType?: 'candidate' | 'job' | 'resume';
  topK?: number;
  useRAG?: boolean;
}

export interface SemanticSearchResponse {
  results: SearchResult[];
  ragAnswer?: RAGResult;
  queryAnalysis: {
    intent: string;
    entities: string[];
    filters: Record<string, any>;
  };
  processingTime: number;
}

@Injectable()
export class SemanticSearchService {
  private readonly logger = new Logger(SemanticSearchService.name);
  private genAI: GoogleGenerativeAI;

  constructor(
    private configService: ConfigService,
    private embeddingsService: EmbeddingsService,
    private nlpService: NLPService,
  ) {
    const apiKey = this.configService.get<string>('GOOGLE_AI_API_KEY');
    this.genAI = new GoogleGenerativeAI(apiKey || '');
  }

  /**
   * Perform semantic search with optional RAG
   */
  async search(params: SemanticSearchQuery): Promise<SemanticSearchResponse> {
    const startTime = Date.now();

    try {
      // Analyze query intent
      const queryAnalysis = await this.nlpService.extractQueryIntent(params.query);

      // Perform vector search
      const results = await this.embeddingsService.search(
        params.query,
        params.entityType,
        params.topK || 10,
      );

      // Optionally use RAG for answer generation
      let ragAnswer: RAGResult | undefined;
      if (params.useRAG && results.length > 0) {
        ragAnswer = await this.generateRAGAnswer(params.query, results);
      }

      const processingTime = Date.now() - startTime;

      this.logger.log(
        `Semantic search completed in ${processingTime}ms: ${results.length} results, RAG: ${!!ragAnswer}`,
      );

      return {
        results,
        ragAnswer,
        queryAnalysis,
        processingTime,
      };
    } catch (error) {
      this.logger.error(`Semantic search failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find best matching candidates for a job using RAG
   */
  async findCandidatesForJob(
    jobDescription: string,
    tenantId: string,
    topK: number = 20,
  ): Promise<SemanticSearchResponse> {
    return this.search({
      query: jobDescription,
      tenantId,
      entityType: 'candidate',
      topK,
      useRAG: true,
    });
  }

  /**
   * Find best matching jobs for a candidate using RAG
   */
  async findJobsForCandidate(
    candidateProfile: string,
    tenantId: string,
    topK: number = 10,
  ): Promise<SemanticSearchResponse> {
    return this.search({
      query: candidateProfile,
      tenantId,
      entityType: 'job',
      topK,
      useRAG: true,
    });
  }

  /**
   * Answer questions about candidates/jobs using RAG
   */
  async answerQuestion(
    question: string,
    context: 'candidates' | 'jobs',
    tenantId: string,
  ): Promise<RAGResult> {
    try {
      // Retrieve relevant documents
      const entityType = context === 'candidates' ? 'candidate' : 'job';
      const results = await this.embeddingsService.search(question, entityType as any, 5);

      // Generate answer using RAG
      return this.generateRAGAnswer(question, results);
    } catch (error) {
      this.logger.error(`Failed to answer question: ${error.message}`);
      throw error;
    }
  }

  /**
   * RAG: Generate answer based on retrieved context
   */
  private async generateRAGAnswer(
    query: string,
    retrievedDocs: SearchResult[],
  ): Promise<RAGResult> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-3-pro-preview' });

      // Build context from retrieved documents
      const context = retrievedDocs
        .map(
          (doc, idx) =>
            `[Document ${idx + 1}] (Relevance: ${(doc.score * 100).toFixed(1)}%)\n${doc.text}`,
        )
        .join('\n\n');

      const prompt = `
You are an AI assistant helping with recruitment and candidate matching.

Context (Retrieved Documents):
${context}

Question: ${query}

Based on the context above, provide a detailed and accurate answer. If the context doesn't contain enough information, say so.

Return your response in JSON format:
{
  "answer": "Your detailed answer here",
  "confidence": 0.85,
  "reasoning": "Explain why you gave this answer and which documents supported it"
}
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let responseText = response.text().trim();

      // Extract JSON from response
      if (responseText.startsWith('```json')) {
        responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (responseText.startsWith('```')) {
        responseText = responseText.replace(/```\n?/g, '');
      }

      const parsed = JSON.parse(responseText);

      return {
        answer: parsed.answer,
        sources: retrievedDocs,
        confidence: parsed.confidence || 0.5,
        reasoning: parsed.reasoning || '',
      };
    } catch (error) {
      this.logger.error(`Failed to generate RAG answer: ${error.message}`);

      return {
        answer: 'I apologize, but I encountered an error generating an answer based on the retrieved information.',
        sources: retrievedDocs,
        confidence: 0,
        reasoning: error.message,
      };
    }
  }

  /**
   * Batch process candidates/jobs for semantic indexing
   */
  async batchIndex(
    entityType: 'candidate' | 'job',
    tenantId: string,
  ): Promise<{ indexed: number; errors: number }> {
    try {
      let indexed: number;

      if (entityType === 'candidate') {
        indexed = await this.embeddingsService.indexAllCandidates(tenantId);
      } else {
        indexed = await this.embeddingsService.indexAllJobs(tenantId);
      }

      this.logger.log(`Batch indexed ${indexed} ${entityType}s for tenant ${tenantId}`);

      return { indexed, errors: 0 };
    } catch (error) {
      this.logger.error(`Batch indexing failed: ${error.message}`);
      return { indexed: 0, errors: 1 };
    }
  }

  /**
   * Explain why a candidate matches a job
   */
  async explainMatch(
    candidateText: string,
    jobText: string,
  ): Promise<{
    matchScore: number;
    explanation: string;
    strengths: string[];
    weaknesses: string[];
  }> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-3-pro-preview' });

      const prompt = `
Analyze the match between this candidate and job description.

CANDIDATE:
${candidateText}

JOB:
${jobText}

Provide a detailed match analysis in JSON format:
{
  "matchScore": 0.85,
  "explanation": "Overall explanation of the match",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2"]
}
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let responseText = response.text().trim();

      // Extract JSON
      if (responseText.startsWith('```json')) {
        responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (responseText.startsWith('```')) {
        responseText = responseText.replace(/```\n?/g, '');
      }

      return JSON.parse(responseText);
    } catch (error) {
      this.logger.error(`Failed to explain match: ${error.message}`);

      // Calculate basic similarity as fallback
      const similarity = await this.nlpService.calculateSimilarity(
        candidateText,
        jobText,
      );

      return {
        matchScore: similarity,
        explanation: 'Match score calculated using semantic similarity',
        strengths: [],
        weaknesses: [],
      };
    }
  }

  /**
   * Get semantic search statistics
   */
  getStats() {
    return this.embeddingsService.getStats();
  }
}
