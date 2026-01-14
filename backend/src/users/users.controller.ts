import { Controller, Post, Get, Body, Param, Request, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService, RegisterUserDto, LoginUserDto, UserAuthResponse } from './users.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Register a new user
   */
  @Public()
  @Post('register')
  async register(@Body() dto: RegisterUserDto): Promise<UserAuthResponse> {
    return this.usersService.register(dto);
  }

  /**
   * Login user
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginUserDto): Promise<UserAuthResponse> {
    return this.usersService.login(dto);
  }

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
