import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Global so the whole application shares ONE PrismaClient / connection pool.
 * Declaring `PrismaService` in each feature module created a separate pool per
 * module, which exhausts Supabase connections under load.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
