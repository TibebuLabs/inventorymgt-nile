import { Controller, Get } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * Lightweight health probe used by Render (and load balancers) to decide
   * whether the instance is ready to receive traffic. Returns 200 as long as
   * the process is up; the `database` field reflects connectivity so that
   * operators can see degraded state without triggering restart loops.
   */
  @Get('health')
  async health() {
    let database: 'up' | 'down' = 'down';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      database = 'up';
    } catch {
      database = 'down';
    }
    return {
      status: 'ok',
      database,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
