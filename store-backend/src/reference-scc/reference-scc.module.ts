// src/referance-scc/referance-scc.module.ts
import { Module } from '@nestjs/common';
import { ReferanceSccController } from './reference-scc.controller';
import { ReferanceSccService } from './reference-scc.service';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ReferanceSccController],
  providers: [ReferanceSccService],
})
export class ReferanceSccModule {}
