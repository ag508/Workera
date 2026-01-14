import { Injectable, Logger } from '@nestjs/common';
import { WorkeraEmailService } from './workera-email.service';

interface OTPEntry {
  code: string;
  email: string;
  expiresAt: Date;
  attempts: number;
  verified: boolean;
}

@Injectable()
export class OTPService {
  private readonly logger = new Logger(OTPService.name);
  private readonly otpStore: Map<string, OTPEntry> = new Map();
  private readonly OTP_LENGTH = 6;
  private readonly OTP_EXPIRY_MINUTES = 10;
  private readonly MAX_ATTEMPTS = 3;

  constructor(private emailService: WorkeraEmailService) {
    // Clean up expired OTPs every 5 minutes
    setInterval(() => this.cleanupExpiredOTPs(), 5 * 60 * 1000);
  }

  /**
   * Generate a random OTP code
   */
  private generateCode(): string {
    const digits = '0123456789';
    let code = '';
    for (let i = 0; i < this.OTP_LENGTH; i++) {
      code += digits.charAt(Math.floor(Math.random() * digits.length));
    }
    return code;
  }

  /**
   * Generate an OTP key for storage
   */
  private getOTPKey(email: string, purpose: string): string {
    return `${email.toLowerCase()}:${purpose}`;
  }

  /**
   * Send OTP to user email
   */
  async sendOTP(
    email: string,
    userName: string,
    purpose: 'login' | 'register' | 'password-reset' | 'email-verification' = 'login',
  ): Promise<{ success: boolean; expiresIn: number; error?: string }> {
    const code = this.generateCode();
    const key = this.getOTPKey(email, purpose);
    const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

    // Store OTP
    this.otpStore.set(key, {
      code,
      email: email.toLowerCase(),
      expiresAt,
      attempts: 0,
      verified: false,
    });

    this.logger.log(`OTP generated for ${email} (${purpose}): ${code}`);

    // Send email
    const result = await this.emailService.sendOTP(email, userName, code, this.OTP_EXPIRY_MINUTES);

    if (!result.success) {
      return { success: false, expiresIn: 0, error: result.error };
    }

    return { success: true, expiresIn: this.OTP_EXPIRY_MINUTES * 60 };
  }

  /**
   * Verify OTP code
   */
  verifyOTP(
    email: string,
    code: string,
    purpose: 'login' | 'register' | 'password-reset' | 'email-verification' = 'login',
  ): { valid: boolean; error?: string } {
    const key = this.getOTPKey(email, purpose);
    const entry = this.otpStore.get(key);

    if (!entry) {
      return { valid: false, error: 'No OTP found. Please request a new code.' };
    }

    // Check if already verified
    if (entry.verified) {
      return { valid: false, error: 'OTP has already been used. Please request a new code.' };
    }

    // Check expiration
    if (new Date() > entry.expiresAt) {
      this.otpStore.delete(key);
      return { valid: false, error: 'OTP has expired. Please request a new code.' };
    }

    // Check attempts
    if (entry.attempts >= this.MAX_ATTEMPTS) {
      this.otpStore.delete(key);
      return { valid: false, error: 'Too many attempts. Please request a new code.' };
    }

    // Verify code
    if (entry.code !== code) {
      entry.attempts++;
      this.logger.warn(`Invalid OTP attempt for ${email} (attempt ${entry.attempts}/${this.MAX_ATTEMPTS})`);
      return {
        valid: false,
        error: `Invalid code. ${this.MAX_ATTEMPTS - entry.attempts} attempts remaining.`,
      };
    }

    // Mark as verified
    entry.verified = true;
    this.logger.log(`OTP verified for ${email}`);

    // Clean up after successful verification
    setTimeout(() => this.otpStore.delete(key), 5000);

    return { valid: true };
  }

  /**
   * Check if user has a pending OTP
   */
  hasPendingOTP(
    email: string,
    purpose: 'login' | 'register' | 'password-reset' | 'email-verification' = 'login',
  ): boolean {
    const key = this.getOTPKey(email, purpose);
    const entry = this.otpStore.get(key);
    return entry !== undefined && new Date() < entry.expiresAt && !entry.verified;
  }

  /**
   * Get remaining time for OTP
   */
  getOTPTimeRemaining(
    email: string,
    purpose: 'login' | 'register' | 'password-reset' | 'email-verification' = 'login',
  ): number {
    const key = this.getOTPKey(email, purpose);
    const entry = this.otpStore.get(key);
    if (!entry || new Date() > entry.expiresAt) {
      return 0;
    }
    return Math.floor((entry.expiresAt.getTime() - Date.now()) / 1000);
  }

  /**
   * Clean up expired OTPs
   */
  private cleanupExpiredOTPs(): void {
    const now = new Date();
    let cleaned = 0;

    for (const [key, entry] of this.otpStore.entries()) {
      if (now > entry.expiresAt || entry.verified) {
        this.otpStore.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.log(`Cleaned up ${cleaned} expired OTPs`);
    }
  }

  /**
   * Invalidate OTP for user
   */
  invalidateOTP(
    email: string,
    purpose: 'login' | 'register' | 'password-reset' | 'email-verification' = 'login',
  ): void {
    const key = this.getOTPKey(email, purpose);
    this.otpStore.delete(key);
  }
}
