import { Injectable, Logger, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../database/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

export interface RegisterUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
  tenantId: string;
}

export interface LoginUserDto {
  email: string;
  password: string;
  tenantId: string;
}

export interface UserAuthResponse {
  accessToken: string;
  user: Omit<User, 'password'>;
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  /**
   * Register a new user (recruiter)
   */
  async register(dto: RegisterUserDto): Promise<UserAuthResponse> {
    // Check if user already exists
    const existing = await this.userRepository.findOne({
      where: { email: dto.email, tenantId: dto.tenantId },
    });

    if (existing) {
      throw new BadRequestException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create user
    const user = this.userRepository.create({
      email: dto.email,
      password: hashedPassword,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: dto.role || UserRole.RECRUITER,
      tenantId: dto.tenantId,
    });

    const savedUser = await this.userRepository.save(user);

    this.logger.log(`New user registered: ${savedUser.email}`);

    // Generate JWT token
    const accessToken = this.generateToken(savedUser);

    // Remove password from response
    const { password: _, ...userData } = savedUser;

    return {
      accessToken,
      user: userData as any,
    };
  }

  /**
   * Login user
   */
  async login(dto: LoginUserDto): Promise<UserAuthResponse> {
    const user = await this.userRepository.findOne({
      where: { email: dto.email, tenantId: dto.tenantId },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(dto.password, user.password);

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    this.logger.log(`User logged in: ${user.email}`);

    // Generate JWT token
    const accessToken = this.generateToken(user);

    // Remove password from response
    const { password: _, ...userData } = user;

    return {
      accessToken,
      user: userData as any,
    };
  }

  /**
   * Get user by ID
   */
  async findById(id: string, tenantId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id, tenantId },
    });
  }

  /**
   * Get all users for a tenant
   */
  async findAll(tenantId: string): Promise<User[]> {
    return this.userRepository.find({
      where: { tenantId },
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'avatar', 'isActive', 'createdAt'],
    });
  }

  /**
   * Validate user from JWT token
   */
  async validateUser(userId: string, tenantId: string): Promise<User | null> {
    return this.findById(userId, tenantId);
  }

  /**
   * Generate JWT token
   */
  private generateToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
      type: 'user',
    };

    const secret = process.env.JWT_SECRET || 'workera-jwt-secret-change-in-production';
    return this.jwtService.sign(payload, {
      secret,
      expiresIn: '8h',
    });
  }
}
