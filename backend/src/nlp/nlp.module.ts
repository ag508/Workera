import { Module } from '@nestjs/common';
import { NLPService } from './nlp.service';
import { NLPController } from './nlp.controller';

@Module({
  controllers: [NLPController],
  providers: [NLPService],
  exports: [NLPService],
})
export class NLPModule {}
