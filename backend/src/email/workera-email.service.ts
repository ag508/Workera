import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { EMAIL_TEMPLATES, EmailTemplateId } from './email-templates';

export interface SendEmailOptions {
  to: string | string[];
  subject?: string;
  html?: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export interface SendTemplateEmailOptions {
  to: string | string[];
  templateId: EmailTemplateId;
  data: Record<string, any>;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: SendEmailOptions['attachments'];
}

@Injectable()
export class WorkeraEmailService {
  private readonly logger = new Logger(WorkeraEmailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private readonly isConfigured: boolean;

  constructor(private configService: ConfigService) {
    this.isConfigured = this.initializeTransporter();
  }

  /**
   * Initialize nodemailer transporter from environment variables
   */
  private initializeTransporter(): boolean {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT');
    // Support both SMTP_USER and SMTP_FROM for authentication
    const user = this.configService.get<string>('SMTP_USER') || this.configService.get<string>('SMTP_FROM');
    const pass = this.configService.get<string>('SMTP_PASSWORD');

    if (!host || !user || !pass) {
      this.logger.warn('SMTP not configured. Emails will be logged but not sent.');
      this.logger.warn(`Missing: ${!host ? 'SMTP_HOST ' : ''}${!user ? 'SMTP_USER/SMTP_FROM ' : ''}${!pass ? 'SMTP_PASSWORD' : ''}`);
      return false;
    }

    try {
      const smtpPort = port || 587;
      this.transporter = nodemailer.createTransport({
        host,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user, pass },
        // For SSL connections
        tls: {
          rejectUnauthorized: false, // Accept self-signed certs
        },
      });

      this.logger.log(`Email service initialized with SMTP host: ${host}:${smtpPort}`);
      return true;
    } catch (error) {
      this.logger.error('Failed to initialize email transporter:', error);
      return false;
    }
  }

  /**
   * Get sender information from environment
   */
  private getSender(): { name: string; email: string } {
    return {
      name: this.configService.get<string>('SMTP_FROM_NAME') || 'Workera',
      email: this.configService.get<string>('SMTP_FROM') || 'noreply@workera.ai',
    };
  }

  /**
   * Send a raw email
   */
  async sendEmail(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const sender = this.getSender();
    const toAddresses = Array.isArray(options.to) ? options.to.join(', ') : options.to;

    // Log email even if not sending
    this.logger.log(`📧 Email: "${options.subject}" to ${toAddresses}`);

    if (!this.isConfigured || !this.transporter) {
      this.logger.warn('Email not sent (SMTP not configured). Email content logged below:');
      this.logger.debug(`Subject: ${options.subject}`);
      this.logger.debug(`HTML: ${options.html?.substring(0, 500)}...`);
      return { success: true, messageId: 'dev-mode-no-send' };
    }

    try {
      const mailOptions: nodemailer.SendMailOptions = {
        from: `"${sender.name}" <${sender.email}>`,
        to: toAddresses,
        subject: options.subject,
        text: options.text,
        html: options.html,
        replyTo: options.replyTo,
      };

      if (options.cc) {
        mailOptions.cc = Array.isArray(options.cc) ? options.cc.join(', ') : options.cc;
      }

      if (options.bcc) {
        mailOptions.bcc = Array.isArray(options.bcc) ? options.bcc.join(', ') : options.bcc;
      }

      if (options.attachments) {
        mailOptions.attachments = options.attachments.map(att => ({
          filename: att.filename,
          content: att.content,
          contentType: att.contentType,
        }));
      }

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`✅ Email sent: ${result.messageId}`);

      return { success: true, messageId: result.messageId };
    } catch (error: any) {
      this.logger.error(`❌ Failed to send email: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send email using a template
   */
  async sendTemplateEmail(options: SendTemplateEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const template = EMAIL_TEMPLATES[options.templateId];

    if (!template) {
      return { success: false, error: `Template not found: ${options.templateId}` };
    }

    // Add default URLs if not provided
    const data = {
      ...options.data,
      privacyUrl: options.data.privacyUrl || 'https://workera.ai/privacy',
      termsUrl: options.data.termsUrl || 'https://workera.ai/terms',
      unsubscribeUrl: options.data.unsubscribeUrl || 'https://workera.ai/unsubscribe',
    };

    // Process template variables
    let subject = template.subject;
    let htmlContent = template.htmlContent;

    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(regex, value?.toString() || '');
      htmlContent = htmlContent.replace(regex, value?.toString() || '');
    }

    // Handle conditional blocks {{#if variable}}...{{/if}}
    htmlContent = htmlContent.replace(
      /{{#if (\w+)}}([\s\S]*?){{\/if}}/g,
      (match, variable, content) => {
        return data[variable] ? content : '';
      },
    );

    return this.sendEmail({
      to: options.to,
      subject,
      html: htmlContent,
      cc: options.cc,
      bcc: options.bcc,
      attachments: options.attachments,
    });
  }

  // ============================================================================
  // CONVENIENCE METHODS
  // ============================================================================

  /**
   * Send OTP verification email
   */
  async sendOTP(email: string, userName: string, otpCode: string, expiryMinutes: number = 10): Promise<{ success: boolean; error?: string }> {
    return this.sendTemplateEmail({
      to: email,
      templateId: 'OTP_VERIFICATION',
      data: { userName, otpCode, expiryMinutes },
    });
  }

  /**
   * Send email verification link
   */
  async sendEmailVerification(email: string, userName: string, verificationLink: string, expiryHours: number = 24): Promise<{ success: boolean; error?: string }> {
    return this.sendTemplateEmail({
      to: email,
      templateId: 'EMAIL_VERIFICATION',
      data: { userName, verificationLink, expiryHours },
    });
  }

  /**
   * Send welcome email to recruiter
   */
  async sendWelcomeRecruiter(email: string, userName: string, dashboardUrl: string): Promise<{ success: boolean; error?: string }> {
    return this.sendTemplateEmail({
      to: email,
      templateId: 'WELCOME_RECRUITER',
      data: { userName, dashboardUrl },
    });
  }

  /**
   * Send welcome email to candidate
   */
  async sendWelcomeCandidate(email: string, userName: string, portalUrl: string): Promise<{ success: boolean; error?: string }> {
    return this.sendTemplateEmail({
      to: email,
      templateId: 'WELCOME_CANDIDATE',
      data: { userName, portalUrl },
    });
  }

  /**
   * Send application submitted confirmation
   */
  async sendApplicationSubmitted(
    email: string,
    data: {
      candidateName: string;
      jobTitle: string;
      companyName: string;
      applicationId: string;
      submittedDate: string;
      responseTime?: string;
      trackingUrl: string;
    },
  ): Promise<{ success: boolean; error?: string }> {
    return this.sendTemplateEmail({
      to: email,
      templateId: 'APPLICATION_SUBMITTED',
      data: { ...data, responseTime: data.responseTime || '5-7 business days' },
    });
  }

  /**
   * Send application status update
   */
  async sendApplicationStatusUpdate(
    email: string,
    data: {
      candidateName: string;
      jobTitle: string;
      companyName: string;
      previousStatus: string;
      newStatus: string;
      updateDate: string;
      statusMessage?: string;
      trackingUrl: string;
    },
  ): Promise<{ success: boolean; error?: string }> {
    return this.sendTemplateEmail({
      to: email,
      templateId: 'APPLICATION_STATUS_UPDATE',
      data,
    });
  }

  /**
   * Send interview scheduled email
   */
  async sendInterviewScheduled(
    email: string,
    data: {
      candidateName: string;
      jobTitle: string;
      companyName: string;
      interviewDate: string;
      interviewTime: string;
      timezone?: string;
      interviewType: string;
      duration: number;
      interviewers: string;
      meetingLink?: string;
      location?: string;
      notes?: string;
      calendarLink?: string;
    },
  ): Promise<{ success: boolean; error?: string }> {
    return this.sendTemplateEmail({
      to: email,
      templateId: 'INTERVIEW_SCHEDULED',
      data: { ...data, timezone: data.timezone || 'UTC' },
    });
  }

  /**
   * Send interview reminder
   */
  async sendInterviewReminder(
    email: string,
    data: {
      candidateName: string;
      jobTitle: string;
      companyName: string;
      interviewDate: string;
      interviewTime: string;
      hoursUntil: number;
      meetingLink?: string;
      location?: string;
      interviewers: string;
    },
  ): Promise<{ success: boolean; error?: string }> {
    return this.sendTemplateEmail({
      to: email,
      templateId: 'INTERVIEW_REMINDER',
      data,
    });
  }

  /**
   * Send new message notification
   */
  async sendNewMessageNotification(
    email: string,
    data: {
      recipientName: string;
      senderName: string;
      companyName: string;
      sentAt: string;
      messagePreview: string;
      messageUrl: string;
    },
  ): Promise<{ success: boolean; error?: string }> {
    return this.sendTemplateEmail({
      to: email,
      templateId: 'NEW_MESSAGE',
      data,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(email: string, userName: string, resetLink: string, expiryHours: number = 1): Promise<{ success: boolean; error?: string }> {
    return this.sendTemplateEmail({
      to: email,
      templateId: 'PASSWORD_RESET',
      data: { userName, resetLink, expiryHours },
    });
  }

  /**
   * Send offer letter
   */
  async sendOfferLetter(
    email: string,
    data: {
      candidateName: string;
      jobTitle: string;
      companyName: string;
      department: string;
      startDate: string;
      compensation: string;
      employmentType: string;
      location?: string;
      benefits?: string;
      responseDeadline: string;
      offerUrl: string;
      senderName: string;
      senderEmail: string;
    },
    attachment?: { filename: string; content: Buffer },
  ): Promise<{ success: boolean; error?: string }> {
    return this.sendTemplateEmail({
      to: email,
      templateId: 'OFFER_LETTER',
      data,
      attachments: attachment ? [{ ...attachment, contentType: 'application/pdf' }] : undefined,
    });
  }

  /**
   * Test email connection
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.isConfigured || !this.transporter) {
      return { success: false, message: 'SMTP not configured' };
    }

    try {
      await this.transporter.verify();
      return { success: true, message: 'SMTP connection successful' };
    } catch (error: any) {
      return { success: false, message: `SMTP connection failed: ${error.message}` };
    }
  }
}
