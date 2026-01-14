import { Controller, Post, Get, Body, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService, RegisterUserDto, LoginUserDto, UserAuthResponse, RequestOTPDto, VerifyOTPDto } from './users.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ============================================================================
  // STANDARD AUTH (PASSWORD-BASED)
  // ============================================================================

  /**
   * Register a new user (password-based)
   */
  @Public()
  @Post('register')
  async register(@Body() dto: RegisterUserDto): Promise<UserAuthResponse> {
    return this.usersService.register(dto);
  }

  /**
   * Login user (password-based)
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginUserDto): Promise<UserAuthResponse> {
    return this.usersService.login(dto);
  }

  // ============================================================================
  // OTP-BASED AUTH
  // ============================================================================

  /**
   * Request OTP for login
   */
  @Public()
  @Post('otp/request-login')
  @HttpCode(HttpStatus.OK)
  async requestLoginOTP(@Body() dto: RequestOTPDto) {
    return this.usersService.requestLoginOTP(dto);
  }

  /**
   * Verify OTP and login
   */
  @Public()
  @Post('otp/verify-login')
  @HttpCode(HttpStatus.OK)
  async verifyOTPAndLogin(@Body() dto: VerifyOTPDto): Promise<UserAuthResponse> {
    return this.usersService.verifyOTPAndLogin(dto);
  }

  /**
   * Request OTP for registration (email verification)
   */
  @Public()
  @Post('otp/request-register')
  @HttpCode(HttpStatus.OK)
  async requestRegistrationOTP(@Body() body: { email: string; firstName: string }) {
    return this.usersService.requestRegistrationOTP(body.email, body.firstName);
  }

  /**
   * Verify OTP and complete registration
   */
  @Public()
  @Post('otp/verify-register')
  async verifyOTPAndRegister(
    @Body() dto: RegisterUserDto & { otpCode: string },
  ): Promise<UserAuthResponse> {
    return this.usersService.verifyOTPAndRegister(dto);
  }

  /**
   * Request password reset OTP
   */
  @Public()
  @Post('otp/request-password-reset')
  @HttpCode(HttpStatus.OK)
  async requestPasswordResetOTP(@Body() body: { email: string; tenantId: string }) {
    return this.usersService.requestPasswordResetOTP(body.email, body.tenantId);
  }

  /**
   * Reset password with OTP
   */
  @Public()
  @Post('otp/reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPasswordWithOTP(
    @Body() body: { email: string; otpCode: string; newPassword: string; tenantId: string },
  ) {
    return this.usersService.resetPasswordWithOTP(
      body.email,
      body.otpCode,
      body.newPassword,
      body.tenantId,
    );
  }

  // ============================================================================
  // USER PROFILE
  // ============================================================================

  /**
   * Get current user profile
   */
  @Get('me')
  async getProfile(@Request() req: any) {
    const { sub: userId, tenantId } = req.user;
    const user = await this.usersService.findById(userId, tenantId);
    if (user) {
      const { password: _, ...userData } = user;
      return userData;
    }
    return null;
  }

  /**
   * Get all users for tenant (admin only)
   */
  @Get()
  async findAll(@Request() req: any) {
    const { tenantId } = req.user;
    return this.usersService.findAll(tenantId);
  }
}
