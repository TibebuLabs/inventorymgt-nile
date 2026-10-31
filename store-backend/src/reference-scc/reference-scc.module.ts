// src/referance-scc/referance-scc.module.ts
import { Module } from '@nestjs/common';
import { ReferanceSccController } from './reference-scc.controller';
import { ReferanceSccService } from './reference-scc.service';

@Module({
  controllers: [ReferanceSccController],
  providers: [ReferanceSccService],
})
export class ReferanceSccModule {}
