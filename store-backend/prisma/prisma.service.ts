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
    try {
      await this.$connect();
      this.logger.log('✅ Database connected (Supabase/PostgreSQL)');
    } catch (error) {
      this.logger.error('❌ Database connection failed');
      this.logger.error(
        error instanceof Error ? error.message : String(error),
      );
      this.logger.error(
        'Check your DATABASE_URL in .env — make sure the password is correct ' +
          'and the Supabase project is not paused.',
      );
      // Re-throw so NestJS surfaces the failure clearly at startup.
      // Fix: fill in the real password in .env, then restart.
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Database disconnected');
  }
}
