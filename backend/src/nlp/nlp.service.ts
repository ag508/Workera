import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';

export interface NLPAnalysis {
  entities: Array<{
    text: string;
    type: string;
    confidence: number;
  }>;
  skills: string[];
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  sentiment: {
    score: number;
    label: 'positive' | 'neutral' | 'negative';
  };
  keywords: string[];
  summary: string;
}

export interface TransformerEmbedding {
  embedding: number[];
  modelUsed: string;
  dimensions: number;
}

@Injectable()
export class NLPService {
  private readonly logger = new Logger(NLPService.name);
  private genAI: GoogleGenerativeAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GOOGLE_AI_API_KEY');
    if (!apiKey) {
      this.logger.warn('GOOGLE_AI_API_KEY not configured');
    }
    this.genAI = new GoogleGenerativeAI(apiKey || '');
  }

  /**
   * Extract entities, skills, and structured information from text using transformer models
   */
  async analyzeText(text: string): Promise<NLPAnalysis> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `
Analyze the following text and extract structured information in JSON format.
Extract:
1. Named entities (people, organizations, locations) with confidence scores
2. Technical skills and competencies
3. Work experience (title, company, duration, description)
4. Education (degree, institution, year)
5. Overall sentiment (positive/neutral/negative with score -1 to 1)
6. Key keywords
7. A brief summary (2-3 sentences)

Text:
${text}

Return ONLY valid JSON in this exact format:
{
  "entities": [{"text": "entity name", "type": "PERSON|ORG|LOCATION", "confidence": 0.95}],
  "skills": ["skill1", "skill2"],
  "experience": [{"title": "job title", "company": "company name", "duration": "duration", "description": "description"}],
  "education": [{"degree": "degree name", "institution": "school name", "year": "year"}],
  "sentiment": {"score": 0.8, "label": "positive"},
  "keywords": ["keyword1", "keyword2"],
  "summary": "Brief summary of the text"
}
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();

      // Extract JSON from response (handle markdown code blocks)
      let jsonText = responseText.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/g, '');
      }

      const analysis = JSON.parse(jsonText);

      this.logger.log(`Analyzed text with ${analysis.entities?.length || 0} entities, ${analysis.skills?.length || 0} skills`);

      return analysis;
    } catch (error) {
      this.logger.error('Failed to analyze text with NLP:', error);

      // Return basic analysis as fallback
      return {
        entities: [],
        skills: this.extractBasicSkills(text),
        experience: [],
        education: [],
        sentiment: { score: 0, label: 'neutral' },
        keywords: this.extractBasicKeywords(text),
        summary: text.substring(0, 200) + '...',
      };
    }
  }

  /**
   * Generate embeddings using transformer model (via Google AI)
   */
  async generateEmbedding(text: string): Promise<TransformerEmbedding> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'embedding-001' });

      const result = await model.embedContent(text);
      const embedding = result.embedding;

      return {
        embedding: embedding.values,
        modelUsed: 'embedding-001',
        dimensions: embedding.values.length,
      };
    } catch (error) {
      this.logger.error('Failed to generate embedding:', error);

      // Return zero vector as fallback
      return {
        embedding: new Array(768).fill(0),
        modelUsed: 'fallback',
        dimensions: 768,
      };
    }
  }

  /**
   * Extract semantic meaning and intent from query
   */
  async extractQueryIntent(query: string): Promise<{
    intent: 'search' | 'filter' | 'comparison' | 'question';
    entities: string[];
    filters: Record<string, any>;
    naturalLanguage: string;
  }> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `
Analyze this search query and extract the intent and structured filters.

Query: "${query}"

Return ONLY valid JSON in this format:
{
  "intent": "search|filter|comparison|question",
  "entities": ["entity1", "entity2"],
  "filters": {
    "skills": ["skill1"],
    "experience": "5+ years",
    "location": "location",
    "education": "degree"
  },
  "naturalLanguage": "A natural language interpretation of the query"
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

      return JSON.parse(responseText);
    } catch (error) {
      this.logger.error('Failed to extract query intent:', error);

      return {
        intent: 'search',
        entities: [],
        filters: {},
        naturalLanguage: query,
      };
    }
  }

  /**
   * Compare two texts for semantic similarity
   */
  async calculateSimilarity(text1: string, text2: string): Promise<number> {
    try {
      const [embedding1, embedding2] = await Promise.all([
        this.generateEmbedding(text1),
        this.generateEmbedding(text2),
      ]);

      // Calculate cosine similarity
      const similarity = this.cosineSimilarity(
        embedding1.embedding,
        embedding2.embedding,
      );

      return similarity;
    } catch (error) {
      this.logger.error('Failed to calculate similarity:', error);
      return 0;
    }
  }

  /**
   * Extract skills from job description or resume
   */
  async extractSkills(text: string): Promise<string[]> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `
Extract all technical skills, tools, technologies, and competencies from this text.
Return ONLY a JSON array of skills, no explanation.

Text:
${text}

Example output: ["JavaScript", "React", "Node.js", "AWS", "Docker"]
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

      const skills = JSON.parse(responseText);
      return Array.isArray(skills) ? skills : [];
    } catch (error) {
      this.logger.error('Failed to extract skills:', error);
      return this.extractBasicSkills(text);
    }
  }

  /**
   * Cosine similarity between two vectors
   */
  private cosineSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) {
      throw new Error('Vectors must have the same length');
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

  /**
   * Fallback: Basic skill extraction using regex
   */
  private extractBasicSkills(text: string): string[] {
    const commonSkills = [
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust',
      'React', 'Angular', 'Vue', 'Node.js', 'Express', 'NestJS', 'Django', 'Flask',
      'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'Git',
      'SQL', 'MongoDB', 'PostgreSQL', 'Redis', 'Elasticsearch',
      'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch',
      'REST', 'GraphQL', 'Microservices', 'Agile', 'Scrum',
    ];

    const foundSkills = commonSkills.filter(skill =>
      text.toLowerCase().includes(skill.toLowerCase()),
    );

    return foundSkills;
  }

  /**
   * Fallback: Basic keyword extraction
   */
  private extractBasicKeywords(text: string): string[] {
    // Simple keyword extraction: most frequent words (excluding common words)
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should']);

    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const wordFreq = new Map<string, number>();

    words.forEach(word => {
      if (word.length > 3 && !stopWords.has(word)) {
        wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
      }
    });

    return Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }
}
