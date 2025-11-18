import { Controller, Get, Query, Param } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  async getDashboardMetrics(@Query('tenantId') tenantId: string) {
    const metrics = await this.analyticsService.getDashboardMetrics(
      tenantId || 'default-tenant'
    );
    return {
      success: true,
      data: metrics,
    };
  }

  @Get('application-status')
  async getApplicationStatusDistribution(@Query('tenantId') tenantId: string) {
    const distribution = await this.analyticsService.getApplicationStatusDistribution(
      tenantId || 'default-tenant'
    );
    return {
      success: true,
      data: distribution,
    };
  }

  @Get('hiring-funnel')
  async getHiringFunnelMetrics(
    @Query('tenantId') tenantId: string,
    @Query('jobId') jobId?: string
  ) {
    const funnel = await this.analyticsService.getHiringFunnelMetrics(
      tenantId || 'default-tenant',
      jobId
    );
    return {
      success: true,
      data: funnel,
    };
  }

  @Get('top-skills')
  async getTopSkills(
    @Query('tenantId') tenantId: string,
    @Query('limit') limit?: string
  ) {
    const skills = await this.analyticsService.getTopSkills(
      tenantId || 'default-tenant',
      limit ? parseInt(limit) : 10
    );
    return {
      success: true,
      data: skills,
    };
  }

  @Get('interview-metrics')
  async getInterviewMetrics(@Query('tenantId') tenantId: string) {
    const metrics = await this.analyticsService.getInterviewMetrics(
      tenantId || 'default-tenant'
    );
    return {
      success: true,
      data: metrics,
    };
  }

  @Get('job-performance')
  async getJobPerformance(
    @Query('tenantId') tenantId: string,
    @Query('limit') limit?: string
  ) {
    const performance = await this.analyticsService.getJobPerformance(
      tenantId || 'default-tenant',
      limit ? parseInt(limit) : 10
    );
    return {
      success: true,
      data: performance,
    };
  }

  @Get('time-to-hire')
  async getTimeToHire(@Query('tenantId') tenantId: string) {
    const timeToHire = await this.analyticsService.getTimeToHire(
      tenantId || 'default-tenant'
    );
    return {
      success: true,
      data: timeToHire,
    };
  }

  @Get('application-trends')
  async getApplicationTrends(
    @Query('tenantId') tenantId: string,
    @Query('days') days?: string
  ) {
    const trends = await this.analyticsService.getApplicationTrends(
      tenantId || 'default-tenant',
      days ? parseInt(days) : 30
    );
    return {
      success: true,
      data: trends,
    };
  }
}
