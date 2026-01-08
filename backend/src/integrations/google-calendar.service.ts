import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../database/entities/tenant.entity';
import { Interview } from '../database/entities/interview.entity';
import axios from 'axios';

export interface GoogleOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes?: string[];
}

export interface GoogleTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  tokenType: string;
  expiresAt?: Date;
  scope?: string;
}

export interface GoogleCalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: {
    email: string;
    displayName?: string;
    responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted';
    optional?: boolean;
  }[];
  conferenceData?: {
    createRequest?: {
      requestId: string;
      conferenceSolutionKey: {
        type: 'hangoutsMeet';
      };
    };
    entryPoints?: {
      entryPointType: string;
      uri: string;
      label?: string;
    }[];
  };
  reminders?: {
    useDefault: boolean;
    overrides?: {
      method: 'email' | 'popup';
      minutes: number;
    }[];
  };
  visibility?: 'default' | 'public' | 'private' | 'confidential';
  status?: 'confirmed' | 'tentative' | 'cancelled';
  colorId?: string;
  recurrence?: string[];
}

export interface GoogleCalendar {
  id: string;
  summary: string;
  description?: string;
  timeZone: string;
  primary?: boolean;
  accessRole: 'freeBusyReader' | 'reader' | 'writer' | 'owner';
  backgroundColor?: string;
  foregroundColor?: string;
}

export interface FreeBusySlot {
  start: string;
  end: string;
}

export interface InterviewScheduleRequest {
  title: string;
  description?: string;
  candidateEmail: string;
  candidateName: string;
  interviewerEmails: string[];
  startTime: Date;
  endTime: Date;
  timeZone: string;
  location?: string;
  createMeetLink?: boolean;
  sendInvites?: boolean;
  reminders?: { method: 'email' | 'popup'; minutes: number }[];
}

@Injectable()
export class GoogleCalendarService {
  private readonly logger = new Logger(GoogleCalendarService.name);
  private readonly AUTH_URL = 'https://accounts.google.com/o/oauth2';
  private readonly TOKEN_URL = 'https://oauth2.googleapis.com/token';
  private readonly API_URL = 'https://www.googleapis.com/calendar/v3';

  constructor(
    private configService: ConfigService,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(Interview)
    private interviewRepository: Repository<Interview>,
  ) {}

  /**
   * Generate OAuth authorization URL
   */
  getAuthorizationUrl(config: GoogleOAuthConfig, state: string): string {
    const scopes = config.scopes || [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/calendar.readonly',
    ];

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      state,
      scope: scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent',
    });

    return `${this.AUTH_URL}/auth?${params.toString()}`;
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(
    code: string,
    config: GoogleOAuthConfig,
  ): Promise<GoogleTokens> {
    try {
      const response = await axios.post(
        this.TOKEN_URL,
        new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: config.redirectUri,
          client_id: config.clientId,
          client_secret: config.clientSecret,
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + response.data.expires_in);

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in,
        tokenType: response.data.token_type,
        scope: response.data.scope,
        expiresAt,
      };
    } catch (error) {
      this.logger.error('Failed to exchange code for tokens:', error);
      throw new BadRequestException('Failed to authenticate with Google');
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(
    refreshToken: string,
    config: GoogleOAuthConfig,
  ): Promise<GoogleTokens> {
    try {
      const response = await axios.post(
        this.TOKEN_URL,
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: config.clientId,
          client_secret: config.clientSecret,
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + response.data.expires_in);

      return {
        accessToken: response.data.access_token,
        refreshToken: refreshToken, // Google doesn't always return a new refresh token
        expiresIn: response.data.expires_in,
        tokenType: response.data.token_type,
        scope: response.data.scope,
        expiresAt,
      };
    } catch (error) {
      this.logger.error('Failed to refresh token:', error);
      throw new BadRequestException('Failed to refresh Google token');
    }
  }

  /**
   * Get list of calendars for user
   */
  async getCalendarList(accessToken: string): Promise<GoogleCalendar[]> {
    try {
      const response = await axios.get(
        `${this.API_URL}/users/me/calendarList`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      return response.data.items?.map((cal: any) => ({
        id: cal.id,
        summary: cal.summary,
        description: cal.description,
        timeZone: cal.timeZone,
        primary: cal.primary,
        accessRole: cal.accessRole,
        backgroundColor: cal.backgroundColor,
        foregroundColor: cal.foregroundColor,
      })) || [];
    } catch (error) {
      this.logger.error('Failed to get calendar list:', error);
      throw new BadRequestException('Failed to fetch calendars');
    }
  }

  /**
   * Get primary calendar
   */
  async getPrimaryCalendar(accessToken: string): Promise<GoogleCalendar | null> {
    const calendars = await this.getCalendarList(accessToken);
    return calendars.find(cal => cal.primary) || calendars[0] || null;
  }

  /**
   * Create calendar event
   */
  async createEvent(
    accessToken: string,
    calendarId: string,
    event: GoogleCalendarEvent,
    options: { sendUpdates?: 'all' | 'externalOnly' | 'none'; conferenceDataVersion?: number } = {},
  ): Promise<GoogleCalendarEvent> {
    try {
      const { sendUpdates = 'all', conferenceDataVersion } = options;

      const params = new URLSearchParams({ sendUpdates });
      if (conferenceDataVersion) {
        params.append('conferenceDataVersion', conferenceDataVersion.toString());
      }

      const response = await axios.post(
        `${this.API_URL}/calendars/${encodeURIComponent(calendarId)}/events?${params.toString()}`,
        event,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(`Created calendar event: ${response.data.id}`);

      return {
        id: response.data.id,
        summary: response.data.summary,
        description: response.data.description,
        location: response.data.location,
        start: response.data.start,
        end: response.data.end,
        attendees: response.data.attendees,
        conferenceData: response.data.conferenceData,
        status: response.data.status,
      };
    } catch (error: any) {
      this.logger.error('Failed to create event:', error.response?.data || error.message);
      throw new BadRequestException('Failed to create calendar event');
    }
  }

  /**
   * Update calendar event
   */
  async updateEvent(
    accessToken: string,
    calendarId: string,
    eventId: string,
    updates: Partial<GoogleCalendarEvent>,
    options: { sendUpdates?: 'all' | 'externalOnly' | 'none' } = {},
  ): Promise<GoogleCalendarEvent> {
    try {
      const { sendUpdates = 'all' } = options;

      const response = await axios.patch(
        `${this.API_URL}/calendars/${encodeURIComponent(calendarId)}/events/${eventId}?sendUpdates=${sendUpdates}`,
        updates,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(`Updated calendar event: ${eventId}`);

      return response.data;
    } catch (error: any) {
      this.logger.error('Failed to update event:', error.response?.data || error.message);
      throw new BadRequestException('Failed to update calendar event');
    }
  }

  /**
   * Delete calendar event
   */
  async deleteEvent(
    accessToken: string,
    calendarId: string,
    eventId: string,
    options: { sendUpdates?: 'all' | 'externalOnly' | 'none' } = {},
  ): Promise<void> {
    try {
      const { sendUpdates = 'all' } = options;

      await axios.delete(
        `${this.API_URL}/calendars/${encodeURIComponent(calendarId)}/events/${eventId}?sendUpdates=${sendUpdates}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      this.logger.log(`Deleted calendar event: ${eventId}`);
    } catch (error: any) {
      this.logger.error('Failed to delete event:', error.response?.data || error.message);
      throw new BadRequestException('Failed to delete calendar event');
    }
  }

  /**
   * Get events for a calendar
   */
  async getEvents(
    accessToken: string,
    calendarId: string,
    options: {
      timeMin?: Date;
      timeMax?: Date;
      maxResults?: number;
      q?: string;
    } = {},
  ): Promise<GoogleCalendarEvent[]> {
    try {
      const params = new URLSearchParams();
      if (options.timeMin) params.append('timeMin', options.timeMin.toISOString());
      if (options.timeMax) params.append('timeMax', options.timeMax.toISOString());
      if (options.maxResults) params.append('maxResults', options.maxResults.toString());
      if (options.q) params.append('q', options.q);
      params.append('singleEvents', 'true');
      params.append('orderBy', 'startTime');

      const response = await axios.get(
        `${this.API_URL}/calendars/${encodeURIComponent(calendarId)}/events?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      return response.data.items || [];
    } catch (error: any) {
      this.logger.error('Failed to get events:', error.response?.data || error.message);
      throw new BadRequestException('Failed to fetch calendar events');
    }
  }

  /**
   * Check free/busy times for multiple calendars
   */
  async getFreeBusy(
    accessToken: string,
    calendarIds: string[],
    timeMin: Date,
    timeMax: Date,
  ): Promise<Record<string, FreeBusySlot[]>> {
    try {
      const response = await axios.post(
        `${this.API_URL}/freeBusy`,
        {
          timeMin: timeMin.toISOString(),
          timeMax: timeMax.toISOString(),
          items: calendarIds.map(id => ({ id })),
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const result: Record<string, FreeBusySlot[]> = {};
      for (const [calendarId, data] of Object.entries(response.data.calendars || {})) {
        result[calendarId] = (data as any).busy || [];
      }

      return result;
    } catch (error: any) {
      this.logger.error('Failed to get free/busy:', error.response?.data || error.message);
      throw new BadRequestException('Failed to check availability');
    }
  }

  /**
   * Find available time slots for scheduling
   */
  async findAvailableSlots(
    accessToken: string,
    calendarIds: string[],
    dateRange: { start: Date; end: Date },
    slotDuration: number, // minutes
    workingHours: { start: number; end: number } = { start: 9, end: 17 },
  ): Promise<{ start: Date; end: Date }[]> {
    const freeBusy = await this.getFreeBusy(
      accessToken,
      calendarIds,
      dateRange.start,
      dateRange.end,
    );

    // Merge all busy slots
    const allBusySlots: { start: Date; end: Date }[] = [];
    for (const slots of Object.values(freeBusy)) {
      for (const slot of slots) {
        allBusySlots.push({
          start: new Date(slot.start),
          end: new Date(slot.end),
        });
      }
    }

    // Sort busy slots
    allBusySlots.sort((a, b) => a.start.getTime() - b.start.getTime());

    // Find available slots
    const availableSlots: { start: Date; end: Date }[] = [];
    let currentDate = new Date(dateRange.start);
    currentDate.setHours(workingHours.start, 0, 0, 0);

    while (currentDate < dateRange.end) {
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(workingHours.end, 0, 0, 0);

      let slotStart = new Date(currentDate);

      while (slotStart < dayEnd) {
        const slotEnd = new Date(slotStart.getTime() + slotDuration * 60000);

        if (slotEnd > dayEnd) break;

        // Check if slot overlaps with any busy slot
        const isAvailable = !allBusySlots.some(
          busy =>
            (slotStart >= busy.start && slotStart < busy.end) ||
            (slotEnd > busy.start && slotEnd <= busy.end) ||
            (slotStart <= busy.start && slotEnd >= busy.end),
        );

        if (isAvailable) {
          availableSlots.push({ start: new Date(slotStart), end: slotEnd });
        }

        slotStart = new Date(slotStart.getTime() + 30 * 60000); // Move by 30 mins
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
      currentDate.setHours(workingHours.start, 0, 0, 0);
    }

    return availableSlots;
  }

  /**
   * Schedule an interview with calendar event
   */
  async scheduleInterview(
    accessToken: string,
    calendarId: string,
    request: InterviewScheduleRequest,
  ): Promise<{ event: GoogleCalendarEvent; meetLink?: string }> {
    const attendees = [
      { email: request.candidateEmail, displayName: request.candidateName },
      ...request.interviewerEmails.map(email => ({ email })),
    ];

    const event: GoogleCalendarEvent = {
      summary: request.title,
      description: request.description,
      location: request.location,
      start: {
        dateTime: request.startTime.toISOString(),
        timeZone: request.timeZone,
      },
      end: {
        dateTime: request.endTime.toISOString(),
        timeZone: request.timeZone,
      },
      attendees,
      reminders: request.reminders
        ? { useDefault: false, overrides: request.reminders }
        : { useDefault: true },
    };

    if (request.createMeetLink) {
      event.conferenceData = {
        createRequest: {
          requestId: `interview-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      };
    }

    const createdEvent = await this.createEvent(
      accessToken,
      calendarId,
      event,
      {
        sendUpdates: request.sendInvites ? 'all' : 'none',
        conferenceDataVersion: request.createMeetLink ? 1 : undefined,
      },
    );

    const meetLink = createdEvent.conferenceData?.entryPoints?.find(
      ep => ep.entryPointType === 'video',
    )?.uri;

    return { event: createdEvent, meetLink };
  }

  /**
   * Sync interview to local database
   */
  async syncInterviewFromCalendar(
    accessToken: string,
    calendarId: string,
    eventId: string,
    tenantId: string,
  ): Promise<Interview | null> {
    try {
      const response = await axios.get(
        `${this.API_URL}/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      const event = response.data;

      // Find or create interview in local database
      let interview = await this.interviewRepository.findOne({
        where: { googleEventId: eventId, tenantId },
      });

      if (!interview) {
        interview = this.interviewRepository.create({
          googleEventId: eventId,
          tenantId,
        });
      }

      interview.title = event.summary;
      interview.scheduledAt = new Date(event.start.dateTime || event.start.date);
      interview.duration = this.calculateDuration(event.start, event.end);
      interview.location = event.location;
      interview.meetingLink = event.conferenceData?.entryPoints?.find(
        (ep: any) => ep.entryPointType === 'video',
      )?.uri;
      interview.status = event.status === 'cancelled' ? 'CANCELLED' : 'SCHEDULED';

      return await this.interviewRepository.save(interview);
    } catch (error) {
      this.logger.error('Failed to sync interview:', error);
      return null;
    }
  }

  /**
   * Watch for calendar changes (webhooks)
   */
  async watchCalendar(
    accessToken: string,
    calendarId: string,
    webhookUrl: string,
    channelId: string,
    expirationDays: number = 7,
  ): Promise<{ channelId: string; resourceId: string; expiration: Date }> {
    try {
      const expiration = new Date();
      expiration.setDate(expiration.getDate() + expirationDays);

      const response = await axios.post(
        `${this.API_URL}/calendars/${encodeURIComponent(calendarId)}/events/watch`,
        {
          id: channelId,
          type: 'web_hook',
          address: webhookUrl,
          expiration: expiration.getTime(),
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return {
        channelId: response.data.id,
        resourceId: response.data.resourceId,
        expiration: new Date(parseInt(response.data.expiration)),
      };
    } catch (error: any) {
      this.logger.error('Failed to set up calendar watch:', error.response?.data || error.message);
      throw new BadRequestException('Failed to set up calendar notifications');
    }
  }

  /**
   * Stop watching calendar
   */
  async stopWatchingCalendar(
    accessToken: string,
    channelId: string,
    resourceId: string,
  ): Promise<void> {
    try {
      await axios.post(
        `${this.API_URL}/channels/stop`,
        { id: channelId, resourceId },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(`Stopped watching calendar channel: ${channelId}`);
    } catch (error: any) {
      this.logger.error('Failed to stop watching calendar:', error.response?.data || error.message);
    }
  }

  /**
   * Test connection to Google Calendar
   */
  async testConnection(accessToken: string): Promise<{ success: boolean; message: string }> {
    try {
      const calendars = await this.getCalendarList(accessToken);
      const primaryCalendar = calendars.find(c => c.primary);
      return {
        success: true,
        message: `Connected to ${primaryCalendar?.summary || 'Google Calendar'}`,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to connect to Google Calendar',
      };
    }
  }

  /**
   * Save Google tokens to tenant settings
   */
  async saveTokensToTenant(tenantId: string, tokens: GoogleTokens): Promise<void> {
    const tenant = await this.tenantRepository.findOne({ where: { id: tenantId } });
    if (!tenant) {
      throw new BadRequestException('Tenant not found');
    }

    if (!tenant.settings) {
      tenant.settings = {};
    }

    tenant.settings.integrations = {
      ...(tenant.settings.integrations || {}),
      googleCalendar: {
        ...(tenant.settings.integrations?.googleCalendar || {}),
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt?.toISOString(),
      },
    };

    await this.tenantRepository.save(tenant);
  }

  /**
   * Helper: Calculate duration in minutes
   */
  private calculateDuration(
    start: { dateTime?: string; date?: string },
    end: { dateTime?: string; date?: string },
  ): number {
    const startTime = new Date(start.dateTime || start.date || '');
    const endTime = new Date(end.dateTime || end.date || '');
    return Math.round((endTime.getTime() - startTime.getTime()) / 60000);
  }
}
