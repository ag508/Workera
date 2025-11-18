import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { NLPService } from './nlp.service';

@Controller('nlp')
export class NLPController {
  constructor(private readonly nlpService: NLPService) {}

  /**
   * Analyze text with NLP
   * POST /nlp/analyze
   */
  @Post('analyze')
  async analyzeText(@Body() body: { text: string }) {
    return this.nlpService.analyzeText(body.text);
  }

  /**
   * Generate embeddings for text
   * POST /nlp/embed
   */
  @Post('embed')
  async generateEmbedding(@Body() body: { text: string }) {
    return this.nlpService.generateEmbedding(body.text);
  }

  /**
   * Extract query intent
   * POST /nlp/intent
   */
  @Post('intent')
  async extractIntent(@Body() body: { query: string }) {
    return this.nlpService.extractQueryIntent(body.query);
  }

  /**
   * Extract skills from text
   * POST /nlp/skills
   */
  @Post('skills')
  async extractSkills(@Body() body: { text: string }) {
    const skills = await this.nlpService.extractSkills(body.text);
    return { skills };
  }

  /**
   * Calculate semantic similarity between two texts
   * POST /nlp/similarity
   */
  @Post('similarity')
  async calculateSimilarity(@Body() body: { text1: string; text2: string }) {
    const similarity = await this.nlpService.calculateSimilarity(
      body.text1,
      body.text2,
    );
    return { similarity };
  }
}
