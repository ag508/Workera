import { Module } from '@nestjs/common';
import { SemanticSearchService } from './semantic-search.service';
import { SemanticSearchController } from './semantic-search.controller';
import { EmbeddingsModule } from '../embeddings/embeddings.module';
import { NLPModule } from '../nlp/nlp.module';

@Module({
  imports: [EmbeddingsModule, NLPModule],
  controllers: [SemanticSearchController],
  providers: [SemanticSearchService],
  exports: [SemanticSearchService],
})
export class SemanticSearchModule {}
