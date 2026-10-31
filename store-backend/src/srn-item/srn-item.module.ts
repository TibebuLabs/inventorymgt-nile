import { Module } from '@nestjs/common';
import { SrnItemService } from './srn-item.service';
import { SrnItemController } from './srn-item.controller';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  controllers: [SrnItemController],
  providers: [SrnItemService],
  imports: [PrismaModule],
})
export class SrnItemModule {}
