import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailCampaign, Candidate } from '../database/entities';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmailCampaign, Candidate]),
    NotificationsModule,
  ],
  controllers: [CampaignsController],
  providers: [CampaignsService],
  exports: [CampaignsService],
})
export class CampaignsModule {}
