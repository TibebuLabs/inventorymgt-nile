// src/approvement/approvement.module.ts
import { Module } from '@nestjs/common';
import { ApprovementService } from './approvement.service';
import { ApprovementController } from './approvement.controller';

@Module({
  controllers: [ApprovementController],
  providers: [ApprovementService],
})
export class ApprovementModule {}
