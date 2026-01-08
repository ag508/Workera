import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { InterviewsService } from './interviews.service';
import { InterviewType, InterviewStatus } from '../database/entities';
import { Public } from '../auth/decorators/public.decorator';

export class ScheduleInterviewDto {
  applicationId: string;
  type: InterviewType;
  scheduledAt: string; // ISO date string
  durationMinutes?: number;
  meetingLink?: string;
  location?: string;
  notes?: string;
  interviewerId?: string;
  tenantId: string;
}

export class UpdateInterviewStatusDto {
  status: InterviewStatus;
  tenantId: string;
}

export class RescheduleInterviewDto {
  newTime: string; // ISO date string
  tenantId: string;
}

export class SubmitFeedbackDto {
  rating?: number;
  strengths?: string[];
  concerns?: string[];
  recommendation?: string;
  comments?: string;
  tenantId: string;
}

@Controller('interviews')
export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) { }

  @Public()
  @Get()
  async getAllInterviews(@Query('tenantId') tenantId: string) {
    const interviews = await this.interviewsService.getAllInterviews(
      tenantId || '11111111-1111-1111-1111-111111111111'
    );
    return interviews;
  }

  @Post()
  async scheduleInterview(@Body() dto: ScheduleInterviewDto) {
    const interview = await this.interviewsService.scheduleInterview({
      ...dto,
      scheduledAt: new Date(dto.scheduledAt),
      tenantId: dto.tenantId || '11111111-1111-1111-1111-111111111111',
    });
    return {
      success: true,
      data: interview,
    };
  }

  @Get('application/:applicationId')
  async getInterviewsByApplication(
    @Param('applicationId') applicationId: string,
    @Query('tenantId') tenantId: string
  ) {
    const interviews = await this.interviewsService.getInterviewsByApplication(
      applicationId,
      tenantId || '11111111-1111-1111-1111-111111111111'
    );
    return {
      success: true,
      data: interviews,
    };
  }

  @Public()
  @Get('upcoming')
  async getUpcomingInterviews(@Query('tenantId') tenantId: string) {
    const interviews = await this.interviewsService.getUpcomingInterviews(
      tenantId || '11111111-1111-1111-1111-111111111111'
    );
    return {
      success: true,
      data: interviews,
    };
  }

  @Get(':id')
  async getInterview(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string
  ) {
    const interview = await this.interviewsService.getInterviewById(
      id,
      tenantId || '11111111-1111-1111-1111-111111111111'
    );
    return {
      success: !!interview,
      data: interview,
    };
  }

  @Put(':id/status')
  async updateInterviewStatus(
    @Param('id') id: string,
    @Body() dto: UpdateInterviewStatusDto
  ) {
    const interview = await this.interviewsService.updateInterviewStatus(
      id,
      dto.status,
      dto.tenantId || '11111111-1111-1111-1111-111111111111'
    );
    return {
      success: !!interview,
      data: interview,
    };
  }

  @Put(':id/reschedule')
  async rescheduleInterview(
    @Param('id') id: string,
    @Body() dto: RescheduleInterviewDto
  ) {
    const interview = await this.interviewsService.rescheduleInterview(
      id,
      new Date(dto.newTime),
      dto.tenantId || '11111111-1111-1111-1111-111111111111'
    );
    return {
      success: !!interview,
      data: interview,
    };
  }

  @Put(':id/feedback')
  async submitFeedback(
    @Param('id') id: string,
    @Body() dto: SubmitFeedbackDto
  ) {
    const { tenantId, ...feedback } = dto;
    const interview = await this.interviewsService.submitFeedback(
      id,
      feedback,
      tenantId || '11111111-1111-1111-1111-111111111111'
    );
    return {
      success: !!interview,
      data: interview,
    };
  }

  @Post(':id/send-reminder')
  async sendReminder(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string
  ) {
    const result = await this.interviewsService.sendReminder(
      id,
      tenantId || '11111111-1111-1111-1111-111111111111'
    );
    return {
      success: result,
      message: result ? 'Reminder sent successfully' : 'Failed to send reminder',
    };
  }
}
