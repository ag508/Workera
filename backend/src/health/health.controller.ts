import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';

@Controller('health')
export class HealthController {
  @Public()
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'workera-api',
      version: '1.0.0',
    };
  }

  @Public()
  @Get('ready')
  readiness() {
    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get('live')
  liveness() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
    };
  }
}
