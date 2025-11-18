import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Candidate } from '../database/entities/candidate.entity';
import { Job } from '../database/entities/job.entity';
import { EmbeddingsService } from './embeddings.service';
import { EmbeddingsController } from './embeddings.controller';
import { NLPModule } from '../nlp/nlp.module';

@Module({
  imports: [TypeOrmModule.forFeature([Candidate, Job]), NLPModule],
  controllers: [EmbeddingsController],
  providers: [EmbeddingsService],
  exports: [EmbeddingsService],
})
export class EmbeddingsModule {}
