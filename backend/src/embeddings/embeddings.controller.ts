import { Controller, Post, Get, Delete, Body, Query, Param } from '@nestjs/common';
import { EmbeddingsService } from './embeddings.service';

@Controller('embeddings')
export class EmbeddingsController {
  constructor(private readonly embeddingsService: EmbeddingsService) {}

  /**
   * Add document to vector store
   * POST /embeddings/add
   */
  @Post('add')
  async addDocument(
    @Body()
    body: {
      id: string;
      text: string;
      entityType: 'candidate' | 'job' | 'resume';
      metadata?: Record<string, any>;
    },
  ) {
    return this.embeddingsService.addDocument(
      body.id,
      body.text,
      body.entityType,
      body.metadata,
    );
  }

  /**
   * Search vector store
   * POST /embeddings/search
   */
  @Post('search')
  async search(
    @Body()
    body: {
      query: string;
      entityType?: 'candidate' | 'job' | 'resume';
      topK?: number;
    },
  ) {
    return this.embeddingsService.search(
      body.query,
      body.entityType,
      body.topK || 10,
    );
  }

  /**
   * Find similar candidates to job
   * POST /embeddings/similar-candidates
   */
  @Post('similar-candidates')
  async findSimilarCandidates(
    @Body() body: { jobDescription: string; topK?: number },
  ) {
    return this.embeddingsService.findSimilarCandidates(
      body.jobDescription,
      body.topK || 20,
    );
  }

  /**
   * Find similar jobs for candidate
   * POST /embeddings/similar-jobs
   */
  @Post('similar-jobs')
  async findSimilarJobs(
    @Body() body: { candidateProfile: string; topK?: number },
  ) {
    return this.embeddingsService.findSimilarJobs(
      body.candidateProfile,
      body.topK || 10,
    );
  }

  /**
   * Index all candidates
   * POST /embeddings/index/candidates?tenantId=xxx
   */
  @Post('index/candidates')
  async indexCandidates(@Query('tenantId') tenantId: string) {
    const count = await this.embeddingsService.indexAllCandidates(tenantId);
    return {
      success: true,
      indexed: count,
      message: `Indexed ${count} candidates`,
    };
  }

  /**
   * Index all jobs
   * POST /embeddings/index/jobs?tenantId=xxx
   */
  @Post('index/jobs')
  async indexJobs(@Query('tenantId') tenantId: string) {
    const count = await this.embeddingsService.indexAllJobs(tenantId);
    return {
      success: true,
      indexed: count,
      message: `Indexed ${count} jobs`,
    };
  }

  /**
   * Remove document from vector store
   * DELETE /embeddings/:id
   */
  @Delete(':id')
  async removeDocument(@Param('id') id: string) {
    const removed = this.embeddingsService.removeDocument(id);
    return {
      success: removed,
      message: removed ? 'Document removed' : 'Document not found',
    };
  }

  /**
   * Get vector store statistics
   * GET /embeddings/stats
   */
  @Get('stats')
  async getStats() {
    return this.embeddingsService.getStats();
  }

  /**
   * Clear all documents for tenant
   * DELETE /embeddings/tenant/:tenantId
   */
  @Delete('tenant/:tenantId')
  async clearTenant(@Param('tenantId') tenantId: string) {
    const removed = this.embeddingsService.clearTenant(tenantId);
    return {
      success: true,
      removed,
      message: `Removed ${removed} documents for tenant ${tenantId}`,
    };
  }
}
