import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'error' },
        { emit: 'stdout', level: 'warn' },
      ],
    });
  }

  async onModuleInit() {
    const dbUrl = process.env.DATABASE_URL || '';
    if (!dbUrl || !dbUrl.startsWith('postgres')) {
      this.logger.warn(
        '⚠️  DATABASE_URL not set or invalid — running without database. ' +
          'Set DATABASE_URL in Render dashboard (must start with postgresql://) and redeploy.',
      );
      return;
    }
    try {
      await this.$connect();
      this.logger.log('✅ Database connected (Supabase/PostgreSQL)');
    } catch (error) {
      this.logger.error('❌ Database connection failed');
      this.logger.error(
        error instanceof Error ? error.message : String(error),
      );
      this.logger.error(
        'Check your DATABASE_URL in Render dashboard — make sure the password ' +
          'is correct and the Supabase project is not paused.',
      );
      // Don't throw — allow app to start so health checks pass.
      // Endpoints that need DB will return 500s until DB is configured.
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('Database disconnected');
    } catch {
      // ignore
    }
  }
}
