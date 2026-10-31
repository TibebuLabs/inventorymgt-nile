// src/grn-item/grn-item.module.ts
import { Module } from '@nestjs/common';
import { GrnItemController } from './grnitem.controller';
import { GrnItemService } from './grnitem.service';

@Module({
  controllers: [GrnItemController],
  providers: [GrnItemService],
})
export class GrnItemModule {}
