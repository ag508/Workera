import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Candidate } from '../database/entities/candidate.entity';
import { Resume } from '../database/entities/resume.entity';
import { AiService } from '../ai/ai.service';

export interface DatabaseConfig {
  type: 'mysql' | 'postgresql' | 'mssql' | 'oracle' | 'mongodb';
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  // Table/Collection mapping
  candidatesTable?: string;
  resumesTable?: string;
}

export interface ImportMapping {
  // Field mappings from external DB to Workera
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  location?: string;
  resumeText?: string;
  resumeUrl?: string;
  skills?: string; // Can be JSON or comma-separated
  customFields?: Record<string, string>;
}

@Injectable()
export class DatabaseImportService {
  private readonly logger = new Logger(DatabaseImportService.name);

  constructor(
    @InjectRepository(Candidate)
    private candidateRepository: Repository<Candidate>,
    @InjectRepository(Resume)
    private resumeRepository: Repository<Resume>,
    private aiService: AiService,
  ) {}

  /**
   * Import candidates from external SQL database
   */
  async importFromSQLDatabase(
    config: DatabaseConfig,
    mapping: ImportMapping,
    tenantId: string,
    options: {
      parseResumes?: boolean;
      limit?: number;
      offset?: number;
      whereClause?: string;
    } = {},
  ): Promise<{
    imported: number;
    failed: number;
    errors: string[];
  }> {
    const { parseResumes = true, limit = 1000, offset = 0, whereClause = '' } = options;

    try {
      // Dynamic database connection
      const knex = require('knex')({
        client: config.type,
        connection: {
          host: config.host,
          port: config.port,
          user: config.username,
          password: config.password,
          database: config.database,
        },
      });

      // Build query
      let query = knex(config.candidatesTable || 'candidates')
        .select('*')
        .limit(limit)
        .offset(offset);

      // Note: whereClause is intentionally disabled to prevent SQL injection
      // Use the filter parameter in importFromMongoDB for safe filtering
      // or implement parameterized queries if SQL filtering is needed
      if (whereClause) {
        this.logger.warn('whereClause parameter is disabled for security. Use structured filters instead.');
      }

      const externalCandidates = await query;

      this.logger.log(
        `Fetched ${externalCandidates.length} candidates from external database`,
      );

      let imported = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const extCandidate of externalCandidates) {
        try {
          // Map fields
          const candidateData = {
            email: extCandidate[mapping.email],
            firstName: extCandidate[mapping.firstName],
            lastName: extCandidate[mapping.lastName],
            phone: mapping.phone ? extCandidate[mapping.phone] : null,
            location: mapping.location ? extCandidate[mapping.location] : null,
            skills: mapping.skills
              ? this.parseSkills(extCandidate[mapping.skills])
              : [],
            tenantId,
          };

          // Check if candidate already exists
          const existing = await this.candidateRepository.findOne({
            where: { email: candidateData.email, tenantId },
          });

          let candidate: Candidate;
          if (existing) {
            // Update existing
            Object.assign(existing, candidateData);
            candidate = await this.candidateRepository.save(existing);
          } else {
            // Create new
            candidate = this.candidateRepository.create(candidateData);
            candidate = await this.candidateRepository.save(candidate);
          }

          // Import resume if available
          if (mapping.resumeText && extCandidate[mapping.resumeText]) {
            const resumeText = extCandidate[mapping.resumeText];

            // Parse resume with AI if enabled
            let parsedData = null;
            if (parseResumes) {
              parsedData = await this.aiService.parseResume(resumeText);
            }

            const resume = this.resumeRepository.create({
              candidateId: candidate.id,
              rawText: resumeText,
              summary: parsedData?.summary || '',
              experience: parsedData?.experience || [],
              education: parsedData?.education || [],
              skills: parsedData?.skills || [],
              certifications: parsedData?.certifications || [],
              isParsed: !!parsedData,
            });

            await this.resumeRepository.save(resume);
          }

          // Fetch resume from URL if provided
          if (mapping.resumeUrl && extCandidate[mapping.resumeUrl]) {
            await this.fetchAndImportResume(
              candidate.id,
              extCandidate[mapping.resumeUrl],
              tenantId,
              parseResumes,
            );
          }

          imported++;
        } catch (error) {
          failed++;
          errors.push(`Failed to import ${extCandidate[mapping.email]}: ${error.message}`);
          this.logger.error(`Import error for ${extCandidate[mapping.email]}:`, error);
        }
      }

      // Close connection
      await knex.destroy();

      this.logger.log(
        `Database import completed: ${imported} imported, ${failed} failed`,
      );

      return { imported, failed, errors };
    } catch (error) {
      this.logger.error('Database import failed:', error);
      throw error;
    }
  }

  /**
   * Import candidates from MongoDB
   */
  async importFromMongoDB(
    config: DatabaseConfig,
    mapping: ImportMapping,
    tenantId: string,
    options: {
      parseResumes?: boolean;
      limit?: number;
      skip?: number;
      filter?: Record<string, any>;
    } = {},
  ): Promise<{
    imported: number;
    failed: number;
    errors: string[];
  }> {
    const { parseResumes = true, limit = 1000, skip = 0, filter = {} } = options;

    try {
      const { MongoClient } = require('mongodb');
      const uri = `mongodb://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`;

      const client = new MongoClient(uri);
      await client.connect();

      const db = client.db(config.database);
      const collection = db.collection(config.candidatesTable || 'candidates');

      const externalCandidates = await collection
        .find(filter)
        .limit(limit)
        .skip(skip)
        .toArray();

      this.logger.log(
        `Fetched ${externalCandidates.length} candidates from MongoDB`,
      );

      let imported = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const extCandidate of externalCandidates) {
        try {
          const candidateData = {
            email: this.getNestedValue(extCandidate, mapping.email),
            firstName: this.getNestedValue(extCandidate, mapping.firstName),
            lastName: this.getNestedValue(extCandidate, mapping.lastName),
            phone: mapping.phone ? this.getNestedValue(extCandidate, mapping.phone) : null,
            location: mapping.location ? this.getNestedValue(extCandidate, mapping.location) : null,
            skills: mapping.skills
              ? this.parseSkills(this.getNestedValue(extCandidate, mapping.skills))
              : [],
            tenantId,
          };

          const existing = await this.candidateRepository.findOne({
            where: { email: candidateData.email, tenantId },
          });

          let candidate: Candidate;
          if (existing) {
            Object.assign(existing, candidateData);
            candidate = await this.candidateRepository.save(existing);
          } else {
            candidate = this.candidateRepository.create(candidateData);
            candidate = await this.candidateRepository.save(candidate);
          }

          // Import resume if available
          if (mapping.resumeText) {
            const resumeText = this.getNestedValue(extCandidate, mapping.resumeText);
            if (resumeText) {
              let parsedData = null;
              if (parseResumes) {
                parsedData = await this.aiService.parseResume(resumeText);
              }

              const resume = this.resumeRepository.create({
                candidateId: candidate.id,
                rawText: resumeText,
                summary: parsedData?.summary || '',
                experience: parsedData?.experience || [],
                education: parsedData?.education || [],
                skills: parsedData?.skills || [],
                certifications: parsedData?.certifications || [],
                isParsed: !!parsedData,
              });

              await this.resumeRepository.save(resume);
            }
          }

          imported++;
        } catch (error) {
          failed++;
          const email = this.getNestedValue(extCandidate, mapping.email);
          errors.push(`Failed to import ${email}: ${error.message}`);
          this.logger.error(`Import error for ${email}:`, error);
        }
      }

      await client.close();

      this.logger.log(
        `MongoDB import completed: ${imported} imported, ${failed} failed`,
      );

      return { imported, failed, errors };
    } catch (error) {
      this.logger.error('MongoDB import failed:', error);
      throw error;
    }
  }

  /**
   * Fetch resume from external URL (S3, file server, etc.)
   */
  private async fetchAndImportResume(
    candidateId: string,
    resumeUrl: string,
    tenantId: string,
    parseResume: boolean,
  ): Promise<void> {
    try {
      const axios = require('axios');
      const response = await axios.get(resumeUrl, {
        responseType: 'text',
        timeout: 30000,
      });

      const resumeText = response.data;

      let parsedData = null;
      if (parseResume) {
        parsedData = await this.aiService.parseResume(resumeText);
      }

      const resume = this.resumeRepository.create({
        candidateId,
        fileUrl: resumeUrl,
        rawText: resumeText,
        summary: parsedData?.summary || '',
        experience: parsedData?.experience || [],
        education: parsedData?.education || [],
        skills: parsedData?.skills || [],
        certifications: parsedData?.certifications || [],
        isParsed: !!parsedData,
      });

      await this.resumeRepository.save(resume);
    } catch (error) {
      this.logger.error(`Failed to fetch resume from ${resumeUrl}:`, error);
      throw error;
    }
  }

  /**
   * Parse skills from various formats
   */
  private parseSkills(skillsData: any): string[] {
    if (!skillsData) return [];

    if (Array.isArray(skillsData)) {
      return skillsData;
    }

    if (typeof skillsData === 'string') {
      try {
        // Try parsing as JSON
        const parsed = JSON.parse(skillsData);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch {
        // Parse as comma-separated
        return skillsData.split(',').map(s => s.trim()).filter(Boolean);
      }
    }

    return [];
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}
