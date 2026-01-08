import { Controller, Get, Query, Res, BadRequestException, Logger, Post, Body } from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../database/entities/tenant.entity';
import { LinkedInOAuthService, LinkedInOAuthConfig } from './linkedin-oauth.service';
import { GoogleCalendarService, GoogleOAuthConfig } from './google-calendar.service';
import { Public } from '../auth/decorators/public.decorator';

interface OAuthState {
  tenantId: string;
  provider: string;
  redirectUrl?: string;
  timestamp: number;
}

@Controller('oauth')
export class OAuthCallbackController {
  private readonly logger = new Logger(OAuthCallbackController.name);
  private readonly stateStore: Map<string, OAuthState> = new Map();

  constructor(
    private configService: ConfigService,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    private linkedInOAuthService: LinkedInOAuthService,
    private googleCalendarService: GoogleCalendarService,
  ) {}

  /**
   * Generate OAuth state token
   */
  private generateState(tenantId: string, provider: string, redirectUrl?: string): string {
    const state = Buffer.from(JSON.stringify({
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
    })).toString('base64');

    this.stateStore.set(state, {
      tenantId,
      provider,
      redirectUrl,
      timestamp: Date.now(),
    });

    // Clean up old states (older than 10 minutes)
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
    for (const [key, value] of this.stateStore.entries()) {
      if (value.timestamp < tenMinutesAgo) {
        this.stateStore.delete(key);
      }
    }

    return state;
  }

  /**
   * Validate and consume OAuth state token
   */
  private validateState(state: string): OAuthState | null {
    const stored = this.stateStore.get(state);
    if (!stored) return null;

    // Check if state is expired (10 minutes)
    if (Date.now() - stored.timestamp > 10 * 60 * 1000) {
      this.stateStore.delete(state);
      return null;
    }

    this.stateStore.delete(state);
    return stored;
  }

  /**
   * Get tenant integration settings
   */
  private async getTenantConfig(tenantId: string, provider: string): Promise<any> {
    const tenant = await this.tenantRepository.findOne({ where: { id: tenantId } });
    if (!tenant) {
      throw new BadRequestException('Tenant not found');
    }
    return tenant.settings?.integrations?.[provider] || {};
  }

  /**
   * Get base URL for callbacks
   */
  private getBaseUrl(): string {
    return this.configService.get('APP_URL') || 'http://localhost:3001';
  }

  // ============================================================================
  // LINKEDIN OAuth
  // ============================================================================

  /**
   * Initiate LinkedIn OAuth flow
   * GET /oauth/linkedin/authorize
   */
  @Public()
  @Get('linkedin/authorize')
  async linkedInAuthorize(
    @Query('tenantId') tenantId: string,
    @Query('redirectUrl') redirectUrl: string,
    @Res() res: Response,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    const tenantConfig = await this.getTenantConfig(tenantId, 'linkedin');

    if (!tenantConfig.clientId || !tenantConfig.clientSecret) {
      throw new BadRequestException('LinkedIn integration not configured. Please add Client ID and Secret first.');
    }

    const state = this.generateState(tenantId, 'linkedin', redirectUrl);

    const config: LinkedInOAuthConfig = {
      clientId: tenantConfig.clientId,
      clientSecret: tenantConfig.clientSecret,
      redirectUri: `${this.getBaseUrl()}/oauth/linkedin/callback`,
    };

    const authUrl = this.linkedInOAuthService.getAuthorizationUrl(config, state);

    return res.redirect(authUrl);
  }

  /**
   * Handle LinkedIn OAuth callback
   * GET /oauth/linkedin/callback
   */
  @Public()
  @Get('linkedin/callback')
  async linkedInCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Query('error_description') errorDescription: string,
    @Res() res: Response,
  ) {
    if (error) {
      this.logger.error(`LinkedIn OAuth error: ${error} - ${errorDescription}`);
      return res.redirect(`/dashboard/settings/integrations?error=${encodeURIComponent(errorDescription || error)}`);
    }

    const storedState = this.validateState(state);
    if (!storedState) {
      return res.redirect('/dashboard/settings/integrations?error=Invalid or expired state');
    }

    try {
      const tenantConfig = await this.getTenantConfig(storedState.tenantId, 'linkedin');

      const config: LinkedInOAuthConfig = {
        clientId: tenantConfig.clientId,
        clientSecret: tenantConfig.clientSecret,
        redirectUri: `${this.getBaseUrl()}/oauth/linkedin/callback`,
      };

      const tokens = await this.linkedInOAuthService.exchangeCodeForTokens(code, config);

      // Save tokens to tenant
      await this.linkedInOAuthService.saveTokensToTenant(storedState.tenantId, tokens);

      // Get user profile to verify connection
      const profile = await this.linkedInOAuthService.getCurrentUserProfile(tokens.accessToken);

      this.logger.log(`LinkedIn OAuth successful for tenant ${storedState.tenantId}, user: ${profile.firstName} ${profile.lastName}`);

      const redirectUrl = storedState.redirectUrl || '/dashboard/settings/integrations';
      return res.redirect(`${redirectUrl}?success=linkedin&message=${encodeURIComponent(`Connected as ${profile.firstName} ${profile.lastName}`)}`);
    } catch (err: any) {
      this.logger.error('LinkedIn OAuth callback error:', err);
      return res.redirect(`/dashboard/settings/integrations?error=${encodeURIComponent(err.message)}`);
    }
  }

  /**
   * Refresh LinkedIn access token
   * POST /oauth/linkedin/refresh
   */
  @Post('linkedin/refresh')
  async linkedInRefresh(
    @Body() body: { tenantId: string },
  ): Promise<{ success: boolean; message: string }> {
    try {
      const tenantConfig = await this.getTenantConfig(body.tenantId, 'linkedin');

      if (!tenantConfig.refreshToken) {
        return { success: false, message: 'No refresh token available. Please re-authenticate.' };
      }

      const config: LinkedInOAuthConfig = {
        clientId: tenantConfig.clientId,
        clientSecret: tenantConfig.clientSecret,
        redirectUri: `${this.getBaseUrl()}/oauth/linkedin/callback`,
      };

      const tokens = await this.linkedInOAuthService.refreshAccessToken(
        tenantConfig.refreshToken,
        config,
      );

      await this.linkedInOAuthService.saveTokensToTenant(body.tenantId, tokens);

      return { success: true, message: 'Token refreshed successfully' };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  // ============================================================================
  // GOOGLE CALENDAR OAuth
  // ============================================================================

  /**
   * Initiate Google Calendar OAuth flow
   * GET /oauth/google-calendar/authorize
   */
  @Public()
  @Get('google-calendar/authorize')
  async googleCalendarAuthorize(
    @Query('tenantId') tenantId: string,
    @Query('redirectUrl') redirectUrl: string,
    @Res() res: Response,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    const tenantConfig = await this.getTenantConfig(tenantId, 'googleCalendar');

    if (!tenantConfig.clientId || !tenantConfig.clientSecret) {
      throw new BadRequestException('Google Calendar integration not configured. Please add Client ID and Secret first.');
    }

    const state = this.generateState(tenantId, 'googleCalendar', redirectUrl);

    const config: GoogleOAuthConfig = {
      clientId: tenantConfig.clientId,
      clientSecret: tenantConfig.clientSecret,
      redirectUri: `${this.getBaseUrl()}/oauth/google-calendar/callback`,
    };

    const authUrl = this.googleCalendarService.getAuthorizationUrl(config, state);

    return res.redirect(authUrl);
  }

  /**
   * Handle Google Calendar OAuth callback
   * GET /oauth/google-calendar/callback
   */
  @Public()
  @Get('google-calendar/callback')
  async googleCalendarCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Res() res: Response,
  ) {
    if (error) {
      this.logger.error(`Google Calendar OAuth error: ${error}`);
      return res.redirect(`/dashboard/settings/integrations?error=${encodeURIComponent(error)}`);
    }

    const storedState = this.validateState(state);
    if (!storedState) {
      return res.redirect('/dashboard/settings/integrations?error=Invalid or expired state');
    }

    try {
      const tenantConfig = await this.getTenantConfig(storedState.tenantId, 'googleCalendar');

      const config: GoogleOAuthConfig = {
        clientId: tenantConfig.clientId,
        clientSecret: tenantConfig.clientSecret,
        redirectUri: `${this.getBaseUrl()}/oauth/google-calendar/callback`,
      };

      const tokens = await this.googleCalendarService.exchangeCodeForTokens(code, config);

      // Save tokens to tenant
      await this.googleCalendarService.saveTokensToTenant(storedState.tenantId, tokens);

      // Get primary calendar to verify connection
      const calendar = await this.googleCalendarService.getPrimaryCalendar(tokens.accessToken);

      this.logger.log(`Google Calendar OAuth successful for tenant ${storedState.tenantId}`);

      const redirectUrl = storedState.redirectUrl || '/dashboard/settings/integrations';
      return res.redirect(`${redirectUrl}?success=googleCalendar&message=${encodeURIComponent(`Connected to ${calendar?.summary || 'Google Calendar'}`)}`);
    } catch (err: any) {
      this.logger.error('Google Calendar OAuth callback error:', err);
      return res.redirect(`/dashboard/settings/integrations?error=${encodeURIComponent(err.message)}`);
    }
  }

  /**
   * Refresh Google Calendar access token
   * POST /oauth/google-calendar/refresh
   */
  @Post('google-calendar/refresh')
  async googleCalendarRefresh(
    @Body() body: { tenantId: string },
  ): Promise<{ success: boolean; message: string }> {
    try {
      const tenantConfig = await this.getTenantConfig(body.tenantId, 'googleCalendar');

      if (!tenantConfig.refreshToken) {
        return { success: false, message: 'No refresh token available. Please re-authenticate.' };
      }

      const config: GoogleOAuthConfig = {
        clientId: tenantConfig.clientId,
        clientSecret: tenantConfig.clientSecret,
        redirectUri: `${this.getBaseUrl()}/oauth/google-calendar/callback`,
      };

      const tokens = await this.googleCalendarService.refreshAccessToken(
        tenantConfig.refreshToken,
        config,
      );

      await this.googleCalendarService.saveTokensToTenant(body.tenantId, tokens);

      return { success: true, message: 'Token refreshed successfully' };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  // ============================================================================
  // CONNECTION TEST ENDPOINTS
  // ============================================================================

  /**
   * Test LinkedIn connection
   * POST /oauth/linkedin/test
   */
  @Post('linkedin/test')
  async testLinkedInConnection(
    @Body() body: { tenantId: string },
  ): Promise<{ success: boolean; message: string }> {
    try {
      const tenantConfig = await this.getTenantConfig(body.tenantId, 'linkedin');

      if (!tenantConfig.accessToken) {
        return { success: false, message: 'Not connected. Please authenticate first.' };
      }

      const result = await this.linkedInOAuthService.testConnection(tenantConfig.accessToken);
      return result;
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Test Google Calendar connection
   * POST /oauth/google-calendar/test
   */
  @Post('google-calendar/test')
  async testGoogleCalendarConnection(
    @Body() body: { tenantId: string },
  ): Promise<{ success: boolean; message: string }> {
    try {
      const tenantConfig = await this.getTenantConfig(body.tenantId, 'googleCalendar');

      if (!tenantConfig.accessToken) {
        return { success: false, message: 'Not connected. Please authenticate first.' };
      }

      const result = await this.googleCalendarService.testConnection(tenantConfig.accessToken);
      return result;
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  // ============================================================================
  // DISCONNECT ENDPOINTS
  // ============================================================================

  /**
   * Disconnect LinkedIn integration
   * POST /oauth/linkedin/disconnect
   */
  @Post('linkedin/disconnect')
  async disconnectLinkedIn(
    @Body() body: { tenantId: string },
  ): Promise<{ success: boolean; message: string }> {
    try {
      const tenant = await this.tenantRepository.findOne({ where: { id: body.tenantId } });
      if (!tenant) {
        throw new BadRequestException('Tenant not found');
      }

      if (tenant.settings?.integrations?.linkedin) {
        // Remove tokens but keep client credentials
        tenant.settings.integrations.linkedin = {
          clientId: tenant.settings.integrations.linkedin.clientId,
          clientSecret: tenant.settings.integrations.linkedin.clientSecret,
        };
        await this.tenantRepository.save(tenant);
      }

      return { success: true, message: 'LinkedIn disconnected successfully' };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Disconnect Google Calendar integration
   * POST /oauth/google-calendar/disconnect
   */
  @Post('google-calendar/disconnect')
  async disconnectGoogleCalendar(
    @Body() body: { tenantId: string },
  ): Promise<{ success: boolean; message: string }> {
    try {
      const tenant = await this.tenantRepository.findOne({ where: { id: body.tenantId } });
      if (!tenant) {
        throw new BadRequestException('Tenant not found');
      }

      if (tenant.settings?.integrations?.googleCalendar) {
        // Remove tokens but keep client credentials
        tenant.settings.integrations.googleCalendar = {
          clientId: tenant.settings.integrations.googleCalendar.clientId,
          clientSecret: tenant.settings.integrations.googleCalendar.clientSecret,
        };
        await this.tenantRepository.save(tenant);
      }

      return { success: true, message: 'Google Calendar disconnected successfully' };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  // ============================================================================
  // GET AUTHORIZATION URLS
  // ============================================================================

  /**
   * Get authorization URL for a provider
   * GET /oauth/authorize-url
   */
  @Get('authorize-url')
  async getAuthorizationUrl(
    @Query('tenantId') tenantId: string,
    @Query('provider') provider: string,
    @Query('redirectUrl') redirectUrl?: string,
  ): Promise<{ url: string }> {
    if (!tenantId || !provider) {
      throw new BadRequestException('Tenant ID and provider are required');
    }

    const tenantConfig = await this.getTenantConfig(tenantId, provider);
    const state = this.generateState(tenantId, provider, redirectUrl);

    let url: string;

    switch (provider) {
      case 'linkedin':
        if (!tenantConfig.clientId || !tenantConfig.clientSecret) {
          throw new BadRequestException('LinkedIn Client ID and Secret are required');
        }
        url = this.linkedInOAuthService.getAuthorizationUrl(
          {
            clientId: tenantConfig.clientId,
            clientSecret: tenantConfig.clientSecret,
            redirectUri: `${this.getBaseUrl()}/oauth/linkedin/callback`,
          },
          state,
        );
        break;

      case 'googleCalendar':
        if (!tenantConfig.clientId || !tenantConfig.clientSecret) {
          throw new BadRequestException('Google Calendar Client ID and Secret are required');
        }
        url = this.googleCalendarService.getAuthorizationUrl(
          {
            clientId: tenantConfig.clientId,
            clientSecret: tenantConfig.clientSecret,
            redirectUri: `${this.getBaseUrl()}/oauth/google-calendar/callback`,
          },
          state,
        );
        break;

      default:
        throw new BadRequestException(`Unsupported provider: ${provider}`);
    }

    return { url };
  }
}
