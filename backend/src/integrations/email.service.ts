import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../database/entities/tenant.entity';
import * as nodemailer from 'nodemailer';
import axios from 'axios';

export interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: {
    name: string;
    email: string;
  };
}

export interface SendGridConfig {
  apiKey: string;
  from: {
    name: string;
    email: string;
  };
  sandboxMode?: boolean;
}

export interface EmailConfig {
  provider: 'smtp' | 'sendgrid';
  smtp?: SMTPConfig;
  sendgrid?: SendGridConfig;
}

export interface EmailMessage {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: {
    filename: string;
    content: string | Buffer;
    contentType?: string;
    encoding?: 'base64' | 'utf-8';
  }[];
  replyTo?: string;
  headers?: Record<string, string>;
  tags?: string[];
  templateId?: string;
  templateData?: Record<string, any>;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables: string[];
}

// Pre-defined email templates for recruitment workflows
export const EMAIL_TEMPLATES = {
  INTERVIEW_INVITATION: {
    id: 'interview-invitation',
    name: 'Interview Invitation',
    subject: 'Interview Invitation - {{jobTitle}} at {{companyName}}',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Interview Invitation</h2>
        <p>Dear {{candidateName}},</p>
        <p>We are pleased to invite you for an interview for the <strong>{{jobTitle}}</strong> position at <strong>{{companyName}}</strong>.</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Date:</strong> {{interviewDate}}</p>
          <p><strong>Time:</strong> {{interviewTime}}</p>
          <p><strong>Duration:</strong> {{duration}} minutes</p>
          <p><strong>Type:</strong> {{interviewType}}</p>
          {{#if meetingLink}}
          <p><strong>Meeting Link:</strong> <a href="{{meetingLink}}">Join Meeting</a></p>
          {{/if}}
          {{#if location}}
          <p><strong>Location:</strong> {{location}}</p>
          {{/if}}
        </div>
        <p><strong>Interviewer(s):</strong> {{interviewers}}</p>
        {{#if notes}}
        <p><strong>Additional Notes:</strong></p>
        <p>{{notes}}</p>
        {{/if}}
        <p>Please confirm your availability by replying to this email.</p>
        <p>Best regards,<br>{{senderName}}<br>{{companyName}}</p>
      </div>
    `,
    variables: ['candidateName', 'jobTitle', 'companyName', 'interviewDate', 'interviewTime', 'duration', 'interviewType', 'meetingLink', 'location', 'interviewers', 'notes', 'senderName'],
  },
  APPLICATION_RECEIVED: {
    id: 'application-received',
    name: 'Application Received',
    subject: 'Application Received - {{jobTitle}} at {{companyName}}',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Thank You for Your Application</h2>
        <p>Dear {{candidateName}},</p>
        <p>Thank you for applying for the <strong>{{jobTitle}}</strong> position at <strong>{{companyName}}</strong>.</p>
        <p>We have received your application and our team is reviewing it. We will get back to you within {{responseTime}} if your profile matches our requirements.</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Application ID:</strong> {{applicationId}}</p>
          <p><strong>Submitted:</strong> {{submittedDate}}</p>
          <p><strong>Status:</strong> Under Review</p>
        </div>
        <p>In the meantime, you can track your application status by logging into our candidate portal.</p>
        <p>Best regards,<br>The Recruitment Team<br>{{companyName}}</p>
      </div>
    `,
    variables: ['candidateName', 'jobTitle', 'companyName', 'responseTime', 'applicationId', 'submittedDate'],
  },
  APPLICATION_SHORTLISTED: {
    id: 'application-shortlisted',
    name: 'Application Shortlisted',
    subject: 'Great News! Your Application for {{jobTitle}} has been Shortlisted',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">Congratulations!</h2>
        <p>Dear {{candidateName}},</p>
        <p>We are excited to inform you that your application for the <strong>{{jobTitle}}</strong> position at <strong>{{companyName}}</strong> has been shortlisted.</p>
        <p>Our recruitment team was impressed with your profile and would like to move forward with the next steps in our hiring process.</p>
        <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
          <p><strong>Next Steps:</strong></p>
          <p>{{nextSteps}}</p>
        </div>
        <p>We will be in touch shortly to schedule the next round. Please ensure your contact information is up to date.</p>
        <p>Best regards,<br>{{senderName}}<br>{{companyName}}</p>
      </div>
    `,
    variables: ['candidateName', 'jobTitle', 'companyName', 'nextSteps', 'senderName'],
  },
  APPLICATION_REJECTED: {
    id: 'application-rejected',
    name: 'Application Update',
    subject: 'Update on Your Application - {{jobTitle}} at {{companyName}}',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Application Update</h2>
        <p>Dear {{candidateName}},</p>
        <p>Thank you for your interest in the <strong>{{jobTitle}}</strong> position at <strong>{{companyName}}</strong> and for taking the time to apply.</p>
        <p>After careful consideration, we have decided to move forward with other candidates whose experience more closely matches our current needs.</p>
        <p>We encourage you to continue checking our careers page for future opportunities that may be a better fit for your skills and experience.</p>
        {{#if feedback}}
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Feedback:</strong></p>
          <p>{{feedback}}</p>
        </div>
        {{/if}}
        <p>We wish you all the best in your job search.</p>
        <p>Best regards,<br>The Recruitment Team<br>{{companyName}}</p>
      </div>
    `,
    variables: ['candidateName', 'jobTitle', 'companyName', 'feedback'],
  },
  OFFER_LETTER: {
    id: 'offer-letter',
    name: 'Job Offer',
    subject: 'Job Offer - {{jobTitle}} at {{companyName}}',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">Congratulations! Job Offer</h2>
        <p>Dear {{candidateName}},</p>
        <p>We are delighted to offer you the position of <strong>{{jobTitle}}</strong> at <strong>{{companyName}}</strong>.</p>
        <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
          <h3 style="margin-top: 0;">Offer Details</h3>
          <p><strong>Position:</strong> {{jobTitle}}</p>
          <p><strong>Department:</strong> {{department}}</p>
          <p><strong>Start Date:</strong> {{startDate}}</p>
          <p><strong>Compensation:</strong> {{compensation}}</p>
          <p><strong>Employment Type:</strong> {{employmentType}}</p>
          {{#if benefits}}
          <p><strong>Benefits:</strong> {{benefits}}</p>
          {{/if}}
        </div>
        <p>Please review the attached offer letter for complete details. To accept this offer, please sign and return the offer letter by <strong>{{responseDeadline}}</strong>.</p>
        <p>If you have any questions, please don't hesitate to contact us.</p>
        <p>We look forward to welcoming you to the team!</p>
        <p>Best regards,<br>{{senderName}}<br>{{companyName}}</p>
      </div>
    `,
    variables: ['candidateName', 'jobTitle', 'companyName', 'department', 'startDate', 'compensation', 'employmentType', 'benefits', 'responseDeadline', 'senderName'],
  },
  INTERVIEW_REMINDER: {
    id: 'interview-reminder',
    name: 'Interview Reminder',
    subject: 'Reminder: Interview Tomorrow for {{jobTitle}}',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">Interview Reminder</h2>
        <p>Dear {{candidateName}},</p>
        <p>This is a friendly reminder about your upcoming interview for the <strong>{{jobTitle}}</strong> position at <strong>{{companyName}}</strong>.</p>
        <div style="background: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <p><strong>Date:</strong> {{interviewDate}}</p>
          <p><strong>Time:</strong> {{interviewTime}}</p>
          {{#if meetingLink}}
          <p><strong>Meeting Link:</strong> <a href="{{meetingLink}}">Join Meeting</a></p>
          {{/if}}
          {{#if location}}
          <p><strong>Location:</strong> {{location}}</p>
          {{/if}}
        </div>
        <p><strong>Tips for your interview:</strong></p>
        <ul>
          <li>Test your audio/video if it's a virtual interview</li>
          <li>Have a copy of your resume ready</li>
          <li>Prepare questions about the role and company</li>
          <li>Join 5 minutes early</li>
        </ul>
        <p>Good luck!</p>
        <p>Best regards,<br>{{senderName}}<br>{{companyName}}</p>
      </div>
    `,
    variables: ['candidateName', 'jobTitle', 'companyName', 'interviewDate', 'interviewTime', 'meetingLink', 'location', 'senderName'],
  },
  PASSWORD_RESET: {
    id: 'password-reset',
    name: 'Password Reset',
    subject: 'Password Reset Request - {{companyName}}',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Password Reset Request</h2>
        <p>Hi {{userName}},</p>
        <p>We received a request to reset your password for your {{companyName}} account.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{resetLink}}" style="background: #2563eb; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; display: inline-block;">Reset Password</a>
        </div>
        <p>This link will expire in {{expiryHours}} hours.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <p>Best regards,<br>{{companyName}}</p>
      </div>
    `,
    variables: ['userName', 'companyName', 'resetLink', 'expiryHours'],
  },
  EMAIL_VERIFICATION: {
    id: 'email-verification',
    name: 'Email Verification',
    subject: 'Verify Your Email - {{companyName}}',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Verify Your Email Address</h2>
        <p>Hi {{userName}},</p>
        <p>Thank you for creating an account with {{companyName}}. Please verify your email address to complete your registration.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{verificationLink}}" style="background: #10b981; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; display: inline-block;">Verify Email</a>
        </div>
        <p>This link will expire in {{expiryHours}} hours.</p>
        <p>Best regards,<br>{{companyName}}</p>
      </div>
    `,
    variables: ['userName', 'companyName', 'verificationLink', 'expiryHours'],
  },
};

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly SENDGRID_API_URL = 'https://api.sendgrid.com/v3';

  constructor(
    private configService: ConfigService,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
  ) {}

  /**
   * Send email using configured provider (SMTP or SendGrid)
   */
  async sendEmail(
    config: EmailConfig,
    message: EmailMessage,
  ): Promise<EmailResult> {
    if (config.provider === 'sendgrid' && config.sendgrid) {
      return this.sendWithSendGrid(config.sendgrid, message);
    } else if (config.provider === 'smtp' && config.smtp) {
      return this.sendWithSMTP(config.smtp, message);
    } else {
      return { success: false, error: 'Invalid email configuration' };
    }
  }

  /**
   * Send email using SMTP
   */
  async sendWithSMTP(
    config: SMTPConfig,
    message: EmailMessage,
  ): Promise<EmailResult> {
    try {
      const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
          user: config.auth.user,
          pass: config.auth.pass,
        },
      });

      const mailOptions: nodemailer.SendMailOptions = {
        from: `"${config.from.name}" <${config.from.email}>`,
        to: Array.isArray(message.to) ? message.to.join(', ') : message.to,
        subject: message.subject,
        text: message.text,
        html: message.html,
        replyTo: message.replyTo,
        headers: message.headers,
      };

      if (message.cc) {
        mailOptions.cc = Array.isArray(message.cc) ? message.cc.join(', ') : message.cc;
      }

      if (message.bcc) {
        mailOptions.bcc = Array.isArray(message.bcc) ? message.bcc.join(', ') : message.bcc;
      }

      if (message.attachments) {
        mailOptions.attachments = message.attachments.map(att => ({
          filename: att.filename,
          content: att.content,
          contentType: att.contentType,
          encoding: att.encoding,
        }));
      }

      const result = await transporter.sendMail(mailOptions);

      this.logger.log(`Email sent via SMTP: ${result.messageId}`);

      return { success: true, messageId: result.messageId };
    } catch (error: any) {
      this.logger.error('Failed to send email via SMTP:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send email using SendGrid
   */
  async sendWithSendGrid(
    config: SendGridConfig,
    message: EmailMessage,
  ): Promise<EmailResult> {
    try {
      const toAddresses = Array.isArray(message.to) ? message.to : [message.to];

      const emailData: any = {
        personalizations: [
          {
            to: toAddresses.map(email => ({ email })),
            ...(message.cc && {
              cc: (Array.isArray(message.cc) ? message.cc : [message.cc]).map(email => ({ email })),
            }),
            ...(message.bcc && {
              bcc: (Array.isArray(message.bcc) ? message.bcc : [message.bcc]).map(email => ({ email })),
            }),
            ...(message.templateData && { dynamic_template_data: message.templateData }),
          },
        ],
        from: { email: config.from.email, name: config.from.name },
        subject: message.subject,
        ...(message.replyTo && { reply_to: { email: message.replyTo } }),
        ...(config.sandboxMode && { mail_settings: { sandbox_mode: { enable: true } } }),
      };

      if (message.templateId) {
        emailData.template_id = message.templateId;
      } else {
        emailData.content = [];
        if (message.text) {
          emailData.content.push({ type: 'text/plain', value: message.text });
        }
        if (message.html) {
          emailData.content.push({ type: 'text/html', value: message.html });
        }
      }

      if (message.attachments?.length) {
        emailData.attachments = message.attachments.map(att => ({
          filename: att.filename,
          content: typeof att.content === 'string' ? att.content : att.content.toString('base64'),
          type: att.contentType || 'application/octet-stream',
        }));
      }

      if (message.tags?.length) {
        emailData.categories = message.tags;
      }

      const response = await axios.post(
        `${this.SENDGRID_API_URL}/mail/send`,
        emailData,
        {
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const messageId = response.headers['x-message-id'];

      this.logger.log(`Email sent via SendGrid: ${messageId}`);

      return { success: true, messageId };
    } catch (error: any) {
      const errorMessage = error.response?.data?.errors?.[0]?.message || error.message;
      this.logger.error('Failed to send email via SendGrid:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Send email using template
   */
  async sendTemplateEmail(
    config: EmailConfig,
    templateId: string,
    to: string | string[],
    data: Record<string, any>,
    options: { cc?: string | string[]; bcc?: string | string[]; attachments?: EmailMessage['attachments'] } = {},
  ): Promise<EmailResult> {
    const template = EMAIL_TEMPLATES[templateId as keyof typeof EMAIL_TEMPLATES];

    if (!template) {
      return { success: false, error: `Template not found: ${templateId}` };
    }

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

    const message: EmailMessage = {
      to,
      subject,
      html: htmlContent,
      cc: options.cc,
      bcc: options.bcc,
      attachments: options.attachments,
    };

    return this.sendEmail(config, message);
  }

  /**
   * Send interview invitation email
   */
  async sendInterviewInvitation(
    config: EmailConfig,
    data: {
      candidateEmail: string;
      candidateName: string;
      jobTitle: string;
      companyName: string;
      interviewDate: string;
      interviewTime: string;
      duration: number;
      interviewType: string;
      meetingLink?: string;
      location?: string;
      interviewers: string;
      notes?: string;
      senderName: string;
    },
  ): Promise<EmailResult> {
    return this.sendTemplateEmail(
      config,
      'INTERVIEW_INVITATION',
      data.candidateEmail,
      data,
    );
  }

  /**
   * Send application received confirmation
   */
  async sendApplicationReceived(
    config: EmailConfig,
    data: {
      candidateEmail: string;
      candidateName: string;
      jobTitle: string;
      companyName: string;
      applicationId: string;
      submittedDate: string;
      responseTime: string;
    },
  ): Promise<EmailResult> {
    return this.sendTemplateEmail(
      config,
      'APPLICATION_RECEIVED',
      data.candidateEmail,
      data,
    );
  }

  /**
   * Send shortlist notification
   */
  async sendShortlistNotification(
    config: EmailConfig,
    data: {
      candidateEmail: string;
      candidateName: string;
      jobTitle: string;
      companyName: string;
      nextSteps: string;
      senderName: string;
    },
  ): Promise<EmailResult> {
    return this.sendTemplateEmail(
      config,
      'APPLICATION_SHORTLISTED',
      data.candidateEmail,
      data,
    );
  }

  /**
   * Send rejection notification
   */
  async sendRejectionNotification(
    config: EmailConfig,
    data: {
      candidateEmail: string;
      candidateName: string;
      jobTitle: string;
      companyName: string;
      feedback?: string;
    },
  ): Promise<EmailResult> {
    return this.sendTemplateEmail(
      config,
      'APPLICATION_REJECTED',
      data.candidateEmail,
      data,
    );
  }

  /**
   * Send offer letter
   */
  async sendOfferLetter(
    config: EmailConfig,
    data: {
      candidateEmail: string;
      candidateName: string;
      jobTitle: string;
      companyName: string;
      department: string;
      startDate: string;
      compensation: string;
      employmentType: string;
      benefits?: string;
      responseDeadline: string;
      senderName: string;
    },
    attachment?: { filename: string; content: Buffer },
  ): Promise<EmailResult> {
    return this.sendTemplateEmail(
      config,
      'OFFER_LETTER',
      data.candidateEmail,
      data,
      attachment ? { attachments: [{ ...attachment, contentType: 'application/pdf' }] } : {},
    );
  }

  /**
   * Send interview reminder
   */
  async sendInterviewReminder(
    config: EmailConfig,
    data: {
      candidateEmail: string;
      candidateName: string;
      jobTitle: string;
      companyName: string;
      interviewDate: string;
      interviewTime: string;
      meetingLink?: string;
      location?: string;
      senderName: string;
    },
  ): Promise<EmailResult> {
    return this.sendTemplateEmail(
      config,
      'INTERVIEW_REMINDER',
      data.candidateEmail,
      data,
    );
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(
    config: EmailConfig,
    data: {
      userEmail: string;
      userName: string;
      companyName: string;
      resetLink: string;
      expiryHours: number;
    },
  ): Promise<EmailResult> {
    return this.sendTemplateEmail(
      config,
      'PASSWORD_RESET',
      data.userEmail,
      data,
    );
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(
    config: EmailConfig,
    data: {
      userEmail: string;
      userName: string;
      companyName: string;
      verificationLink: string;
      expiryHours: number;
    },
  ): Promise<EmailResult> {
    return this.sendTemplateEmail(
      config,
      'EMAIL_VERIFICATION',
      data.userEmail,
      data,
    );
  }

  /**
   * Send bulk emails
   */
  async sendBulkEmails(
    config: EmailConfig,
    messages: EmailMessage[],
    options: { rateLimit?: number; delayMs?: number } = {},
  ): Promise<{ sent: number; failed: number; results: EmailResult[] }> {
    const { rateLimit = 100, delayMs = 100 } = options;
    const results: EmailResult[] = [];
    let sent = 0;
    let failed = 0;

    const batches: EmailMessage[][] = [];
    for (let i = 0; i < messages.length; i += rateLimit) {
      batches.push(messages.slice(i, i + rateLimit));
    }

    for (const batch of batches) {
      const batchResults = await Promise.all(
        batch.map(async (message, index) => {
          // Add small delay between sends
          if (index > 0) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
          }
          return this.sendEmail(config, message);
        }),
      );

      for (const result of batchResults) {
        results.push(result);
        if (result.success) {
          sent++;
        } else {
          failed++;
        }
      }
    }

    this.logger.log(`Bulk email completed: ${sent} sent, ${failed} failed`);

    return { sent, failed, results };
  }

  /**
   * Test email connection (SMTP or SendGrid)
   */
  async testConnection(config: EmailConfig): Promise<{ success: boolean; message: string }> {
    if (config.provider === 'sendgrid' && config.sendgrid) {
      return this.testSendGridConnection(config.sendgrid);
    } else if (config.provider === 'smtp' && config.smtp) {
      return this.testSMTPConnection(config.smtp);
    }
    return { success: false, message: 'Invalid email configuration' };
  }

  /**
   * Test SMTP connection
   */
  async testSMTPConnection(config: SMTPConfig): Promise<{ success: boolean; message: string }> {
    try {
      const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
          user: config.auth.user,
          pass: config.auth.pass,
        },
      });

      await transporter.verify();

      return { success: true, message: 'SMTP connection successful' };
    } catch (error: any) {
      return { success: false, message: `SMTP connection failed: ${error.message}` };
    }
  }

  /**
   * Test SendGrid connection
   */
  async testSendGridConnection(config: SendGridConfig): Promise<{ success: boolean; message: string }> {
    try {
      // Send a test request to verify API key
      await axios.get(
        `${this.SENDGRID_API_URL}/user/profile`,
        {
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
          },
        },
      );

      return { success: true, message: 'SendGrid connection successful' };
    } catch (error: any) {
      return { success: false, message: `SendGrid connection failed: ${error.response?.data?.errors?.[0]?.message || error.message}` };
    }
  }

  /**
   * Get available email templates
   */
  getTemplates(): EmailTemplate[] {
    return Object.values(EMAIL_TEMPLATES).map(template => ({
      id: template.id,
      name: template.name,
      subject: template.subject,
      htmlContent: template.htmlContent,
      variables: template.variables,
    }));
  }

  /**
   * Save email configuration to tenant settings
   */
  async saveConfigToTenant(tenantId: string, config: EmailConfig): Promise<void> {
    const tenant = await this.tenantRepository.findOne({ where: { id: tenantId } });
    if (!tenant) {
      throw new BadRequestException('Tenant not found');
    }

    if (!tenant.settings) {
      tenant.settings = {};
    }

    tenant.settings.integrations = {
      ...(tenant.settings.integrations || {}),
      email: config,
    };

    await this.tenantRepository.save(tenant);
  }

  /**
   * Get email configuration from tenant settings
   */
  async getConfigFromTenant(tenantId: string): Promise<EmailConfig | null> {
    const tenant = await this.tenantRepository.findOne({ where: { id: tenantId } });
    return tenant?.settings?.integrations?.email || null;
  }
}
