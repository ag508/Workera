import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Candidate, Resume, Application } from '../database/entities';
import { GDPRController } from './gdpr.controller';
import { GDPRService } from './gdpr.service';

@Module({
  imports: [TypeOrmModule.forFeature([Candidate, Resume, Application])],
  controllers: [GDPRController],
  providers: [GDPRService],
  exports: [GDPRService],
})
export class GDPRModule {}
