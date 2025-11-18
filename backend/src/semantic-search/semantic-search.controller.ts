import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { SemanticSearchService, SemanticSearchQuery } from './semantic-search.service';

@Controller('semantic-search')
export class SemanticSearchController {
  constructor(private readonly semanticSearchService: SemanticSearchService) {}

  /**
   * Perform semantic search
   * POST /semantic-search
   */
  @Post()
  async search(@Body() query: SemanticSearchQuery) {
    return this.semanticSearchService.search(query);
  }

  /**
   * Find candidates for job using RAG
   * POST /semantic-search/candidates-for-job
   */
  @Post('candidates-for-job')
  async findCandidatesForJob(
    @Body()
    body: {
      jobDescription: string;
      tenantId: string;
      topK?: number;
    },
  ) {
    return this.semanticSearchService.findCandidatesForJob(
      body.jobDescription,
      body.tenantId,
      body.topK || 20,
    );
  }

  /**
   * Find jobs for candidate using RAG
   * POST /semantic-search/jobs-for-candidate
   */
  @Post('jobs-for-candidate')
  async findJobsForCandidate(
    @Body()
    body: {
      candidateProfile: string;
      tenantId: string;
      topK?: number;
    },
  ) {
    return this.semanticSearchService.findJobsForCandidate(
      body.candidateProfile,
      body.tenantId,
      body.topK || 10,
    );
  }

  /**
   * Answer question using RAG
   * POST /semantic-search/answer
   */
  @Post('answer')
  async answerQuestion(
    @Body()
    body: {
      question: string;
      context: 'candidates' | 'jobs';
      tenantId: string;
    },
  ) {
    return this.semanticSearchService.answerQuestion(
      body.question,
      body.context,
      body.tenantId,
    );
  }

  /**
   * Batch index entities
   * POST /semantic-search/batch-index
   */
  @Post('batch-index')
  async batchIndex(
    @Body()
    body: {
      entityType: 'candidate' | 'job';
      tenantId: string;
    },
  ) {
    return this.semanticSearchService.batchIndex(body.entityType, body.tenantId);
  }

  /**
   * Explain match between candidate and job
   * POST /semantic-search/explain-match
   */
  @Post('explain-match')
  async explainMatch(
    @Body()
    body: {
      candidateText: string;
      jobText: string;
    },
  ) {
    return this.semanticSearchService.explainMatch(
      body.candidateText,
      body.jobText,
    );
  }

  /**
   * Get semantic search statistics
   * GET /semantic-search/stats
   */
  @Get('stats')
  async getStats() {
    return this.semanticSearchService.getStats();
  }
}
