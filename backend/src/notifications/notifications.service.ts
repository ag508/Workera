import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface NotificationPayload {
  to: string;
  candidateName: string;
  jobTitle?: string;
  companyName?: string;
  status?: string;
  interviewDate?: Date;
  interviewLink?: string;
  additionalInfo?: Record<string, any>;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private configService: ConfigService) {}

  /**
   * Send application status update email
   */
  async sendApplicationStatusUpdate(payload: NotificationPayload): Promise<boolean> {
    const template = this.getStatusUpdateTemplate(payload);
    return this.sendEmail(payload.to, template);
  }

  /**
   * Send interview invitation email
   */
  async sendInterviewInvitation(payload: NotificationPayload): Promise<boolean> {
    const template = this.getInterviewInvitationTemplate(payload);
    return this.sendEmail(payload.to, template);
  }

  /**
   * Send resume parsed notification
   */
  async sendResumeProcessedNotification(payload: NotificationPayload): Promise<boolean> {
    const template = this.getResumeProcessedTemplate(payload);
    return this.sendEmail(payload.to, template);
  }

  /**
   * Send job posting confirmation
   */
  async sendJobPostedConfirmation(payload: NotificationPayload): Promise<boolean> {
    const template = this.getJobPostedTemplate(payload);
    return this.sendEmail(payload.to, template);
  }

  /**
   * Send bulk notification to multiple recipients
   */
  async sendBulkNotification(
    recipients: string[],
    templateFn: (email: string) => EmailTemplate
  ): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    for (const email of recipients) {
      try {
        const template = templateFn(email);
        const success = await this.sendEmail(email, template);
        if (success) sent++;
        else failed++;
      } catch (error) {
        this.logger.error(`Failed to send email to ${email}:`, error);
        failed++;
      }
    }

    this.logger.log(`Bulk notification complete: ${sent} sent, ${failed} failed`);
    return { sent, failed };
  }

  /**
   * Core email sending function
   * In production: integrate with SendGrid, AWS SES, or similar
   * In development: log emails to console
   */
  private async sendEmail(to: string, template: EmailTemplate): Promise<boolean> {
    const nodeEnv = this.configService.get<string>('NODE_ENV');

    if (nodeEnv === 'production') {
      // TODO: Integrate with actual email service (SendGrid, AWS SES, etc.)
      // Example with SendGrid:
      // const sgMail = require('@sendgrid/mail');
      // sgMail.setApiKey(this.configService.get('SENDGRID_API_KEY'));
      // await sgMail.send({
      //   to,
      //   from: this.configService.get('EMAIL_FROM'),
      //   subject: template.subject,
      //   html: template.html,
      //   text: template.text,
      // });

      this.logger.warn('Email sending in production not yet configured. Email would be sent to:', to);
      return true;
    } else {
      // Development: log email to console
      this.logger.log('=== EMAIL NOTIFICATION ===');
      this.logger.log(`To: ${to}`);
      this.logger.log(`Subject: ${template.subject}`);
      this.logger.log(`Body (text): ${template.text}`);
      this.logger.log('==========================');
      return true;
    }
  }

  /**
   * Template: Application status update
   */
  private getStatusUpdateTemplate(payload: NotificationPayload): EmailTemplate {
    const { candidateName, jobTitle, companyName, status } = payload;

    const statusMessages: Record<string, string> = {
      screening: 'Your application is being reviewed by our team.',
      shortlisted: 'Congratulations! You have been shortlisted for the next round.',
      interview: 'You have been invited for an interview.',
      offer: 'Congratulations! We are pleased to extend you an offer.',
      rejected: 'We regret to inform you that we will not be moving forward with your application at this time.',
      hired: 'Congratulations! You have been hired!',
    };

    const message = statusMessages[status || 'screening'] || 'Your application status has been updated.';

    return {
      subject: `Application Update: ${jobTitle} at ${companyName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10B981 0%, #6EE7B7 100%); padding: 30px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Workera</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1f2937; margin-top: 0;">Hi ${candidateName},</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              Your application status for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been updated.
            </p>
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #10B981; margin: 20px 0;">
              <p style="color: #1f2937; font-size: 16px; margin: 0;">
                <strong>Status:</strong> ${status?.toUpperCase() || 'UPDATED'}
              </p>
              <p style="color: #4b5563; margin-top: 10px;">
                ${message}
              </p>
            </div>
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              Thank you for your interest in joining our team!
            </p>
          </div>
          <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p>© 2024 Workera. All rights reserved.</p>
          </div>
        </div>
      `,
      text: `Hi ${candidateName},\n\nYour application status for ${jobTitle} at ${companyName} has been updated to: ${status?.toUpperCase()}\n\n${message}\n\nThank you for your interest in joining our team!\n\n© 2024 Workera`,
    };
  }

  /**
   * Template: Interview invitation
   */
  private getInterviewInvitationTemplate(payload: NotificationPayload): EmailTemplate {
    const { candidateName, jobTitle, companyName, interviewDate, interviewLink } = payload;

    const dateStr = interviewDate ? new Date(interviewDate).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }) : 'To be scheduled';

    return {
      subject: `Interview Invitation: ${jobTitle} at ${companyName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10B981 0%, #6EE7B7 100%); padding: 30px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Workera</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1f2937; margin-top: 0;">Hi ${candidateName},</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              Congratulations! You have been invited to interview for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>.
            </p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #1f2937; margin: 10px 0;"><strong>Date & Time:</strong> ${dateStr}</p>
              ${interviewLink ? `
                <a href="${interviewLink}" style="display: inline-block; margin-top: 15px; padding: 12px 24px; background: #10B981; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
                  Join Interview
                </a>
              ` : ''}
            </div>
            <p style="color: #6b7280; font-size: 14px;">
              Please confirm your availability and prepare for the interview. We look forward to speaking with you!
            </p>
          </div>
          <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p>© 2024 Workera. All rights reserved.</p>
          </div>
        </div>
      `,
      text: `Hi ${candidateName},\n\nCongratulations! You have been invited to interview for the ${jobTitle} position at ${companyName}.\n\nDate & Time: ${dateStr}\n${interviewLink ? `\nInterview Link: ${interviewLink}` : ''}\n\nWe look forward to speaking with you!\n\n© 2024 Workera`,
    };
  }

  /**
   * Template: Resume processed notification
   */
  private getResumeProcessedTemplate(payload: NotificationPayload): EmailTemplate {
    const { candidateName } = payload;

    return {
      subject: 'Your Resume Has Been Processed',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10B981 0%, #6EE7B7 100%); padding: 30px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Workera</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1f2937; margin-top: 0;">Hi ${candidateName},</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              Your resume has been successfully processed and added to our system. Our AI has analyzed your skills and experience.
            </p>
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
              You will be notified when there are matching opportunities!
            </p>
          </div>
          <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p>© 2024 Workera. All rights reserved.</p>
          </div>
        </div>
      `,
      text: `Hi ${candidateName},\n\nYour resume has been successfully processed and added to our system. Our AI has analyzed your skills and experience.\n\nYou will be notified when there are matching opportunities!\n\n© 2024 Workera`,
    };
  }

  /**
   * Template: Job posted confirmation
   */
  private getJobPostedTemplate(payload: NotificationPayload): EmailTemplate {
    const { jobTitle, companyName, additionalInfo } = payload;
    const channels = additionalInfo?.channels || [];

    return {
      subject: `Job Posted Successfully: ${jobTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10B981 0%, #6EE7B7 100%); padding: 30px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Workera</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1f2937; margin-top: 0;">Job Posted Successfully!</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              Your job posting for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> is now live.
            </p>
            ${channels.length > 0 ? `
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #1f2937; margin: 0;"><strong>Posted to:</strong></p>
                <ul style="color: #4b5563; margin-top: 10px;">
                  ${channels.map((ch: string) => `<li>${ch}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
            <p style="color: #6b7280; font-size: 14px;">
              You will receive notifications as candidates apply!
            </p>
          </div>
          <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p>© 2024 Workera. All rights reserved.</p>
          </div>
        </div>
      `,
      text: `Job Posted Successfully!\n\nYour job posting for ${jobTitle} at ${companyName} is now live.\n${channels.length > 0 ? `\nPosted to: ${channels.join(', ')}` : ''}\n\nYou will receive notifications as candidates apply!\n\n© 2024 Workera`,
    };
  }
}
