/**
 * Workera Email Templates
 *
 * Professional, branded email templates for all platform communications.
 * All templates use consistent Workera branding with primary color #10B981 (emerald).
 */

// Base template wrapper with Workera branding
const baseTemplate = (content: string, previewText: string = '') => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Workera</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    body { margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
    .wrapper { width: 100%; background-color: #f3f4f6; padding: 40px 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    .header { background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 32px 40px; text-align: center; }
    .logo { display: flex; align-items: center; justify-content: center; gap: 12px; }
    .logo-icon { width: 48px; height: 48px; background-color: rgba(255,255,255,0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .logo-text { font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px; }
    .content { padding: 40px; }
    .footer { background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb; }
    .footer p { margin: 0; font-size: 12px; color: #6b7280; line-height: 1.6; }
    .footer a { color: #10B981; text-decoration: none; }
    h1, h2 { color: #111827; margin: 0 0 16px 0; }
    p { color: #4b5563; line-height: 1.6; margin: 0 0 16px 0; }
    .btn { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: #ffffff !important; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; text-align: center; }
    .btn:hover { background: linear-gradient(135deg, #059669 0%, #047857 100%); }
    .otp-box { background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border: 2px solid #10B981; border-radius: 16px; padding: 32px; text-align: center; margin: 24px 0; }
    .otp-code { font-size: 36px; font-weight: 700; color: #10B981; letter-spacing: 8px; font-family: 'Courier New', monospace; }
    .info-box { background-color: #f3f4f6; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #6b7280; font-size: 14px; }
    .info-value { color: #111827; font-weight: 600; font-size: 14px; }
    .highlight-box { background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border-left: 4px solid #10B981; border-radius: 0 12px 12px 0; padding: 20px; margin: 20px 0; }
    .warning-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 0 12px 12px 0; padding: 20px; margin: 20px 0; }
    .feature-list { list-style: none; padding: 0; margin: 20px 0; }
    .feature-list li { padding: 12px 0; padding-left: 32px; position: relative; color: #4b5563; }
    .feature-list li:before { content: "✓"; position: absolute; left: 0; color: #10B981; font-weight: bold; }
    .divider { height: 1px; background-color: #e5e7eb; margin: 24px 0; }
    @media only screen and (max-width: 600px) {
      .content { padding: 24px 20px; }
      .header { padding: 24px 20px; }
      .footer { padding: 20px; }
      .otp-code { font-size: 28px; letter-spacing: 4px; }
    }
  </style>
</head>
<body>
  <div style="display: none; max-height: 0; overflow: hidden;">${previewText}</div>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="logo">
          <div class="logo-icon">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2L2 8L14 14L26 8L14 2Z" fill="white" opacity="0.9"/>
              <path d="M2 20L14 26L26 20" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 14L14 20L26 14" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span class="logo-text">Workera</span>
        </div>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} Workera. All rights reserved.</p>
        <p style="margin-top: 8px;">
          <a href="{{privacyUrl}}">Privacy Policy</a> ·
          <a href="{{termsUrl}}">Terms of Service</a> ·
          <a href="{{unsubscribeUrl}}">Unsubscribe</a>
        </p>
        <p style="margin-top: 12px; font-size: 11px; color: #9ca3af;">
          This email was sent by Workera. If you didn't request this email, please ignore it.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`;

// ============================================================================
// OTP / VERIFICATION EMAILS
// ============================================================================

export const OTP_VERIFICATION = {
  id: 'otp-verification',
  name: 'OTP Verification',
  subject: 'Your Workera Verification Code: {{otpCode}}',
  htmlContent: baseTemplate(`
    <h1 style="text-align: center;">Verify Your Email</h1>
    <p style="text-align: center;">Hi {{userName}},</p>
    <p style="text-align: center;">Please use the following verification code to complete your sign-in:</p>

    <div class="otp-box">
      <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">Your verification code is:</p>
      <div class="otp-code">{{otpCode}}</div>
      <p style="margin: 12px 0 0 0; color: #6b7280; font-size: 14px;">This code expires in {{expiryMinutes}} minutes</p>
    </div>

    <div class="warning-box">
      <p style="margin: 0; font-size: 14px;"><strong>Security Notice:</strong> Never share this code with anyone. Workera will never ask you for this code.</p>
    </div>

    <p style="text-align: center; color: #6b7280; font-size: 14px;">If you didn't request this code, please ignore this email or contact support if you have concerns.</p>
  `, 'Your verification code is {{otpCode}}'),
  variables: ['userName', 'otpCode', 'expiryMinutes'],
};

export const EMAIL_VERIFICATION = {
  id: 'email-verification',
  name: 'Email Verification',
  subject: 'Verify Your Email Address - Workera',
  htmlContent: baseTemplate(`
    <h1 style="text-align: center;">Welcome to Workera!</h1>
    <p style="text-align: center;">Hi {{userName}},</p>
    <p style="text-align: center;">Thank you for creating an account. Please verify your email address to get started.</p>

    <div style="text-align: center; margin: 32px 0;">
      <a href="{{verificationLink}}" class="btn">Verify Email Address</a>
    </div>

    <p style="text-align: center; color: #6b7280; font-size: 14px;">This link will expire in {{expiryHours}} hours.</p>

    <div class="divider"></div>

    <p style="text-align: center; color: #6b7280; font-size: 14px;">
      If the button doesn't work, copy and paste this link into your browser:<br>
      <a href="{{verificationLink}}" style="color: #10B981; word-break: break-all;">{{verificationLink}}</a>
    </p>
  `, 'Verify your email to get started with Workera'),
  variables: ['userName', 'verificationLink', 'expiryHours'],
};

// ============================================================================
// WELCOME EMAILS
// ============================================================================

export const WELCOME_RECRUITER = {
  id: 'welcome-recruiter',
  name: 'Welcome - Recruiter',
  subject: 'Welcome to Workera - Let\'s Transform Your Hiring!',
  htmlContent: baseTemplate(`
    <h1>Welcome to Workera, {{userName}}!</h1>
    <p>We're thrilled to have you on board. Workera is your AI-powered recruitment platform designed to help you find the best talent faster and smarter.</p>

    <div class="highlight-box">
      <h2 style="font-size: 18px; margin-bottom: 12px;">🚀 Here's what you can do:</h2>
      <ul class="feature-list">
        <li><strong>AI-Powered Job Descriptions</strong> - Generate compelling job posts in seconds</li>
        <li><strong>Smart Candidate Search</strong> - Use natural language to find perfect matches</li>
        <li><strong>Multi-Channel Posting</strong> - Post to LinkedIn, Indeed, and more with one click</li>
        <li><strong>Intelligent Screening</strong> - AI ranks candidates based on job fit</li>
        <li><strong>Seamless Interviews</strong> - Schedule and manage interviews effortlessly</li>
        <li><strong>Pipeline Analytics</strong> - Track your hiring funnel in real-time</li>
      </ul>
    </div>

    <h2 style="font-size: 18px;">📋 Quick Start Guide:</h2>
    <div class="info-box">
      <p style="margin-bottom: 12px;"><strong>Step 1:</strong> Create your first job requisition</p>
      <p style="margin-bottom: 12px;"><strong>Step 2:</strong> Use AI to enhance your job description</p>
      <p style="margin-bottom: 12px;"><strong>Step 3:</strong> Post to multiple job boards</p>
      <p style="margin: 0;"><strong>Step 4:</strong> Review AI-ranked candidates</p>
    </div>

    <div style="text-align: center; margin: 32px 0;">
      <a href="{{dashboardUrl}}" class="btn">Go to Dashboard</a>
    </div>

    <p>Need help getting started? Our support team is here for you at <a href="mailto:support@workera.ai" style="color: #10B981;">support@workera.ai</a></p>

    <p>Happy hiring!<br><strong>The Workera Team</strong></p>
  `, 'Welcome to Workera! Start transforming your hiring process today.'),
  variables: ['userName', 'dashboardUrl'],
};

export const WELCOME_CANDIDATE = {
  id: 'welcome-candidate',
  name: 'Welcome - Candidate',
  subject: 'Welcome to Workera - Your Career Journey Starts Here!',
  htmlContent: baseTemplate(`
    <h1>Welcome to Workera, {{userName}}!</h1>
    <p>We're excited to help you find your next great opportunity. Workera connects talented professionals like you with top companies hiring right now.</p>

    <div class="highlight-box">
      <h2 style="font-size: 18px; margin-bottom: 12px;">✨ What you can do on Workera:</h2>
      <ul class="feature-list">
        <li><strong>AI Job Matching</strong> - Get personalized job recommendations</li>
        <li><strong>Smart Search</strong> - Find jobs using natural language ("remote React jobs paying $150k+")</li>
        <li><strong>One-Click Apply</strong> - Apply to multiple jobs with your saved profile</li>
        <li><strong>Application Tracking</strong> - Monitor all your applications in one place</li>
        <li><strong>Interview Management</strong> - See upcoming interviews and prep materials</li>
        <li><strong>Real-Time Updates</strong> - Get notified when companies view your profile</li>
      </ul>
    </div>

    <h2 style="font-size: 18px;">🎯 Complete your profile for best results:</h2>
    <div class="info-box">
      <p style="margin-bottom: 12px;"><strong>1.</strong> Upload your latest resume</p>
      <p style="margin-bottom: 12px;"><strong>2.</strong> Add your skills and experience</p>
      <p style="margin-bottom: 12px;"><strong>3.</strong> Set your job preferences</p>
      <p style="margin: 0;"><strong>4.</strong> Enable job alerts for new opportunities</p>
    </div>

    <div style="text-align: center; margin: 32px 0;">
      <a href="{{portalUrl}}" class="btn">Start Exploring Jobs</a>
    </div>

    <p>Questions? Reach out at <a href="mailto:support@workera.ai" style="color: #10B981;">support@workera.ai</a></p>

    <p>Best of luck in your job search!<br><strong>The Workera Team</strong></p>
  `, 'Welcome to Workera! Find your next great opportunity.'),
  variables: ['userName', 'portalUrl'],
};

// ============================================================================
// APPLICATION EMAILS
// ============================================================================

export const APPLICATION_SUBMITTED = {
  id: 'application-submitted',
  name: 'Application Submitted',
  subject: 'Application Received - {{jobTitle}} at {{companyName}}',
  htmlContent: baseTemplate(`
    <h1 style="text-align: center;">Application Received!</h1>
    <p style="text-align: center;">Hi {{candidateName}},</p>
    <p style="text-align: center;">Thank you for applying to the <strong>{{jobTitle}}</strong> position at <strong>{{companyName}}</strong>.</p>

    <div class="info-box">
      <div class="info-row">
        <span class="info-label">Position</span>
        <span class="info-value">{{jobTitle}}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Company</span>
        <span class="info-value">{{companyName}}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Application ID</span>
        <span class="info-value">{{applicationId}}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Submitted</span>
        <span class="info-value">{{submittedDate}}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Status</span>
        <span class="info-value" style="color: #10B981;">Under Review</span>
      </div>
    </div>

    <div class="highlight-box">
      <p style="margin: 0;"><strong>What's Next?</strong><br>The hiring team will review your application and get back to you within {{responseTime}}. You can track your application status in your candidate portal.</p>
    </div>

    <div style="text-align: center; margin: 32px 0;">
      <a href="{{trackingUrl}}" class="btn">Track Application</a>
    </div>

    <p>Good luck!<br><strong>{{companyName}} Recruitment Team</strong></p>
  `, 'Your application for {{jobTitle}} has been received'),
  variables: ['candidateName', 'jobTitle', 'companyName', 'applicationId', 'submittedDate', 'responseTime', 'trackingUrl'],
};

export const APPLICATION_STATUS_UPDATE = {
  id: 'application-status-update',
  name: 'Application Status Update',
  subject: 'Update on Your Application - {{jobTitle}}',
  htmlContent: baseTemplate(`
    <h1>Application Status Update</h1>
    <p>Hi {{candidateName}},</p>
    <p>There's an update on your application for <strong>{{jobTitle}}</strong> at <strong>{{companyName}}</strong>.</p>

    <div class="info-box">
      <div class="info-row">
        <span class="info-label">Position</span>
        <span class="info-value">{{jobTitle}}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Previous Status</span>
        <span class="info-value">{{previousStatus}}</span>
      </div>
      <div class="info-row">
        <span class="info-label">New Status</span>
        <span class="info-value" style="color: #10B981; font-weight: 700;">{{newStatus}}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Updated</span>
        <span class="info-value">{{updateDate}}</span>
      </div>
    </div>

    {{#if statusMessage}}
    <div class="highlight-box">
      <p style="margin: 0;">{{statusMessage}}</p>
    </div>
    {{/if}}

    <div style="text-align: center; margin: 32px 0;">
      <a href="{{trackingUrl}}" class="btn">View Application</a>
    </div>

    <p>Best regards,<br><strong>{{companyName}} Recruitment Team</strong></p>
  `, 'Your application status has been updated'),
  variables: ['candidateName', 'jobTitle', 'companyName', 'previousStatus', 'newStatus', 'updateDate', 'statusMessage', 'trackingUrl'],
};

// ============================================================================
// INTERVIEW EMAILS
// ============================================================================

export const INTERVIEW_SCHEDULED = {
  id: 'interview-scheduled',
  name: 'Interview Scheduled',
  subject: '📅 Interview Scheduled - {{jobTitle}} at {{companyName}}',
  htmlContent: baseTemplate(`
    <h1 style="text-align: center;">Interview Scheduled!</h1>
    <p style="text-align: center;">Hi {{candidateName}},</p>
    <p style="text-align: center;">Great news! Your interview for <strong>{{jobTitle}}</strong> at <strong>{{companyName}}</strong> has been scheduled.</p>

    <div class="highlight-box" style="text-align: center;">
      <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">Interview Date & Time</p>
      <p style="margin: 0; font-size: 24px; font-weight: 700; color: #111827;">{{interviewDate}}</p>
      <p style="margin: 4px 0 0 0; font-size: 20px; color: #10B981;">{{interviewTime}} ({{timezone}})</p>
    </div>

    <div class="info-box">
      <div class="info-row">
        <span class="info-label">Interview Type</span>
        <span class="info-value">{{interviewType}}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Duration</span>
        <span class="info-value">{{duration}} minutes</span>
      </div>
      <div class="info-row">
        <span class="info-label">Interviewer(s)</span>
        <span class="info-value">{{interviewers}}</span>
      </div>
      {{#if meetingLink}}
      <div class="info-row">
        <span class="info-label">Meeting Link</span>
        <span class="info-value"><a href="{{meetingLink}}" style="color: #10B981;">Join Meeting</a></span>
      </div>
      {{/if}}
      {{#if location}}
      <div class="info-row">
        <span class="info-label">Location</span>
        <span class="info-value">{{location}}</span>
      </div>
      {{/if}}
    </div>

    {{#if notes}}
    <div class="warning-box">
      <p style="margin: 0;"><strong>Notes from the recruiter:</strong><br>{{notes}}</p>
    </div>
    {{/if}}

    <h2 style="font-size: 18px;">📝 Prepare for your interview:</h2>
    <ul class="feature-list">
      <li>Research {{companyName}} and the role</li>
      <li>Review your resume and prepare to discuss your experience</li>
      <li>Prepare questions to ask the interviewer</li>
      <li>Test your audio/video if it's a virtual interview</li>
      <li>Join 5 minutes early</li>
    </ul>

    <div style="text-align: center; margin: 32px 0;">
      <a href="{{calendarLink}}" class="btn">Add to Calendar</a>
    </div>

    <p>Good luck!<br><strong>{{companyName}} Recruitment Team</strong></p>
  `, 'Your interview is scheduled for {{interviewDate}}'),
  variables: ['candidateName', 'jobTitle', 'companyName', 'interviewDate', 'interviewTime', 'timezone', 'interviewType', 'duration', 'interviewers', 'meetingLink', 'location', 'notes', 'calendarLink'],
};

export const INTERVIEW_REMINDER = {
  id: 'interview-reminder',
  name: 'Interview Reminder',
  subject: '⏰ Reminder: Interview Tomorrow - {{jobTitle}}',
  htmlContent: baseTemplate(`
    <h1 style="text-align: center;">Interview Reminder</h1>
    <p style="text-align: center;">Hi {{candidateName}},</p>
    <p style="text-align: center;">This is a friendly reminder about your upcoming interview for <strong>{{jobTitle}}</strong> at <strong>{{companyName}}</strong>.</p>

    <div class="warning-box" style="text-align: center; border-color: #f59e0b; background: #fffbeb;">
      <p style="margin: 0 0 8px 0; color: #92400e; font-size: 14px;">Interview in {{hoursUntil}} hours</p>
      <p style="margin: 0; font-size: 24px; font-weight: 700; color: #111827;">{{interviewDate}}</p>
      <p style="margin: 4px 0 0 0; font-size: 20px; color: #f59e0b;">{{interviewTime}}</p>
    </div>

    <div class="info-box">
      {{#if meetingLink}}
      <div class="info-row">
        <span class="info-label">Join Meeting</span>
        <span class="info-value"><a href="{{meetingLink}}" class="btn" style="padding: 8px 16px; font-size: 14px;">Join Now</a></span>
      </div>
      {{/if}}
      {{#if location}}
      <div class="info-row">
        <span class="info-label">Location</span>
        <span class="info-value">{{location}}</span>
      </div>
      {{/if}}
      <div class="info-row">
        <span class="info-label">Interviewer(s)</span>
        <span class="info-value">{{interviewers}}</span>
      </div>
    </div>

    <h2 style="font-size: 18px;">✅ Last-minute checklist:</h2>
    <ul class="feature-list">
      <li>Have a copy of your resume ready</li>
      <li>Test your audio/video if it's a virtual interview</li>
      <li>Find a quiet, well-lit space</li>
      <li>Prepare questions about the role</li>
      <li>Join 5 minutes early</li>
    </ul>

    <p style="text-align: center;">You've got this! Good luck! 🍀</p>

    <p>Best regards,<br><strong>{{companyName}} Recruitment Team</strong></p>
  `, 'Reminder: Your interview is tomorrow'),
  variables: ['candidateName', 'jobTitle', 'companyName', 'interviewDate', 'interviewTime', 'hoursUntil', 'meetingLink', 'location', 'interviewers'],
};

// ============================================================================
// MESSAGE NOTIFICATION EMAILS
// ============================================================================

export const NEW_MESSAGE = {
  id: 'new-message',
  name: 'New Message',
  subject: '💬 New message from {{senderName}} - {{companyName}}',
  htmlContent: baseTemplate(`
    <h1>New Message</h1>
    <p>Hi {{recipientName}},</p>
    <p>You have a new message from <strong>{{senderName}}</strong> at <strong>{{companyName}}</strong>.</p>

    <div class="info-box" style="background-color: #f0fdf4; border: 1px solid #10B981;">
      <p style="margin: 0 0 8px 0; font-size: 12px; color: #6b7280;">{{senderName}} • {{sentAt}}</p>
      <p style="margin: 0; color: #111827; font-size: 15px;">{{messagePreview}}</p>
    </div>

    <div style="text-align: center; margin: 32px 0;">
      <a href="{{messageUrl}}" class="btn">View Full Message</a>
    </div>

    <p style="color: #6b7280; font-size: 14px;">You can reply directly from your Workera inbox.</p>
  `, 'New message from {{senderName}}'),
  variables: ['recipientName', 'senderName', 'companyName', 'sentAt', 'messagePreview', 'messageUrl'],
};

// ============================================================================
// PASSWORD & SECURITY EMAILS
// ============================================================================

export const PASSWORD_RESET = {
  id: 'password-reset',
  name: 'Password Reset',
  subject: '🔐 Reset Your Workera Password',
  htmlContent: baseTemplate(`
    <h1 style="text-align: center;">Reset Your Password</h1>
    <p style="text-align: center;">Hi {{userName}},</p>
    <p style="text-align: center;">We received a request to reset your password for your Workera account.</p>

    <div style="text-align: center; margin: 32px 0;">
      <a href="{{resetLink}}" class="btn">Reset Password</a>
    </div>

    <p style="text-align: center; color: #6b7280; font-size: 14px;">This link will expire in {{expiryHours}} hours.</p>

    <div class="warning-box">
      <p style="margin: 0; font-size: 14px;"><strong>Didn't request this?</strong><br>If you didn't request a password reset, you can safely ignore this email. Your password won't be changed.</p>
    </div>

    <div class="divider"></div>

    <p style="text-align: center; color: #6b7280; font-size: 14px;">
      If the button doesn't work, copy and paste this link:<br>
      <a href="{{resetLink}}" style="color: #10B981; word-break: break-all;">{{resetLink}}</a>
    </p>
  `, 'Reset your Workera password'),
  variables: ['userName', 'resetLink', 'expiryHours'],
};

// ============================================================================
// OFFER & ONBOARDING EMAILS
// ============================================================================

export const OFFER_LETTER = {
  id: 'offer-letter',
  name: 'Offer Letter',
  subject: '🎉 Congratulations! Job Offer from {{companyName}}',
  htmlContent: baseTemplate(`
    <h1 style="text-align: center;">Congratulations, {{candidateName}}!</h1>
    <p style="text-align: center; font-size: 18px;">We are delighted to offer you the position of</p>
    <p style="text-align: center; font-size: 28px; font-weight: 700; color: #10B981; margin: 16px 0;">{{jobTitle}}</p>
    <p style="text-align: center; font-size: 18px;">at <strong>{{companyName}}</strong></p>

    <div class="highlight-box">
      <h2 style="font-size: 18px; margin-bottom: 16px;">Offer Details</h2>
      <div class="info-box" style="background: white;">
        <div class="info-row">
          <span class="info-label">Position</span>
          <span class="info-value">{{jobTitle}}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Department</span>
          <span class="info-value">{{department}}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Start Date</span>
          <span class="info-value">{{startDate}}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Compensation</span>
          <span class="info-value">{{compensation}}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Employment Type</span>
          <span class="info-value">{{employmentType}}</span>
        </div>
        {{#if location}}
        <div class="info-row">
          <span class="info-label">Location</span>
          <span class="info-value">{{location}}</span>
        </div>
        {{/if}}
      </div>
    </div>

    {{#if benefits}}
    <h2 style="font-size: 18px;">Benefits Package</h2>
    <div class="info-box">
      <p style="margin: 0;">{{benefits}}</p>
    </div>
    {{/if}}

    <div class="warning-box">
      <p style="margin: 0;"><strong>Action Required:</strong> Please review and sign the attached offer letter by <strong>{{responseDeadline}}</strong> to accept this offer.</p>
    </div>

    <div style="text-align: center; margin: 32px 0;">
      <a href="{{offerUrl}}" class="btn">Review & Accept Offer</a>
    </div>

    <p>If you have any questions, please don't hesitate to reach out to {{senderName}} at <a href="mailto:{{senderEmail}}" style="color: #10B981;">{{senderEmail}}</a>.</p>

    <p>We look forward to welcoming you to the team!</p>

    <p>Best regards,<br><strong>{{senderName}}</strong><br>{{companyName}}</p>
  `, 'Congratulations! You have a job offer from {{companyName}}'),
  variables: ['candidateName', 'jobTitle', 'companyName', 'department', 'startDate', 'compensation', 'employmentType', 'location', 'benefits', 'responseDeadline', 'offerUrl', 'senderName', 'senderEmail'],
};

// ============================================================================
// EXPORT ALL TEMPLATES
// ============================================================================

export const EMAIL_TEMPLATES = {
  OTP_VERIFICATION,
  EMAIL_VERIFICATION,
  WELCOME_RECRUITER,
  WELCOME_CANDIDATE,
  APPLICATION_SUBMITTED,
  APPLICATION_STATUS_UPDATE,
  INTERVIEW_SCHEDULED,
  INTERVIEW_REMINDER,
  NEW_MESSAGE,
  PASSWORD_RESET,
  OFFER_LETTER,
};

export type EmailTemplateId = keyof typeof EMAIL_TEMPLATES;
