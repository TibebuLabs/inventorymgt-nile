// src/approvement/approvement.module.ts
import { Module } from '@nestjs/common';
import { ApprovementService } from './approvement.service';
import { ApprovementController } from './approvement.controller';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ApprovementController],
  providers: [ApprovementService],
})
export class ApprovementModule {}
