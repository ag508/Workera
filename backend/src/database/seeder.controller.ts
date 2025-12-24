import { Controller, Post, Delete, Get } from '@nestjs/common';
import { SeederService } from './seeder.service';

@Controller('seed')
export class SeederController {
  constructor(private readonly seederService: SeederService) {}

  @Get('status')
  async getStatus() {
    return {
      success: true,
      message: 'Seeder endpoint is available',
      endpoints: {
        seed: 'POST /seed - Seed the database with sample data',
        reseed: 'POST /seed/reseed - Clear and reseed the database',
        clear: 'DELETE /seed - Clear all data from the database',
      },
    };
  }

  @Post()
  async seed() {
    return this.seederService.seed();
  }

  @Post('reseed')
  async reseed() {
    return this.seederService.reseed();
  }

  @Delete()
  async clear() {
    await this.seederService.clearDatabase();
    return { success: true, message: 'Database cleared' };
  }
}
