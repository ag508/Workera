import { Controller, Get, Query, Param } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) { }

  @Public()
  @Get('dashboard')
  async getDashboardMetrics(@Query('tenantId') tenantId: string) {
    const metrics = await this.analyticsService.getDashboardMetrics(
      tenantId || '11111111-1111-1111-1111-111111111111'
    );
    return {
      success: true,
      data: metrics,
    };
  }

  @Public()
  @Get('application-status')
  async getApplicationStatusDistribution(@Query('tenantId') tenantId: string) {
    const distribution = await this.analyticsService.getApplicationStatusDistribution(
      tenantId || '11111111-1111-1111-1111-111111111111'
    );
    return {
      success: true,
      data: distribution,
    };
  }

  @Public()
  @Get('hiring-funnel')
  async getHiringFunnelMetrics(
    @Query('tenantId') tenantId: string,
    @Query('jobId') jobId?: string
  ) {
    const funnel = await this.analyticsService.getHiringFunnelMetrics(
      tenantId || '11111111-1111-1111-1111-111111111111',
      jobId
    );
    return {
      success: true,
      data: funnel,
    };
  }

  @Public()
  @Get('top-skills')
  async getTopSkills(
    @Query('tenantId') tenantId: string,
    @Query('limit') limit?: string
  ) {
    const skills = await this.analyticsService.getTopSkills(
      tenantId || '11111111-1111-1111-1111-111111111111',
      limit ? parseInt(limit) : 10
    );
    return {
      success: true,
      data: skills,
    };
  }

  @Public()
  @Get('interview-metrics')
  async getInterviewMetrics(@Query('tenantId') tenantId: string) {
    const metrics = await this.analyticsService.getInterviewMetrics(
      tenantId || '11111111-1111-1111-1111-111111111111'
    );
    return {
      success: true,
      data: metrics,
    };
  }

  @Public()
  @Get('job-performance')
  async getJobPerformance(
    @Query('tenantId') tenantId: string,
    @Query('limit') limit?: string
  ) {
    const performance = await this.analyticsService.getJobPerformance(
      tenantId || '11111111-1111-1111-1111-111111111111',
      limit ? parseInt(limit) : 10
    );
    return {
      success: true,
      data: performance,
    };
  }

  @Public()
  @Get('time-to-hire')
  async getTimeToHire(@Query('tenantId') tenantId: string) {
    const timeToHire = await this.analyticsService.getTimeToHire(
      tenantId || '11111111-1111-1111-1111-111111111111'
    );
    return {
      success: true,
      data: timeToHire,
    };
  }

  @Public()
  @Get('application-trends')
  async getApplicationTrends(
    @Query('tenantId') tenantId: string,
    @Query('days') days?: string
  ) {
    const trends = await this.analyticsService.getApplicationTrends(
      tenantId || '11111111-1111-1111-1111-111111111111',
      days ? parseInt(days) : 30
    );
    return {
      success: true,
      data: trends,
    };
  }
}
