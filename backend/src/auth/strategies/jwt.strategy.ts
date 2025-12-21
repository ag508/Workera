import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: string;           // User ID
  email: string;
  tenantId: string;
  type: 'user' | 'candidate';
  roles?: string[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'workera-jwt-secret-change-in-production',
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload.sub || !payload.tenantId) {
      throw new UnauthorizedException('Invalid token payload');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      tenantId: payload.tenantId,
      type: payload.type,
      roles: payload.roles || [],
    };
  }
}
