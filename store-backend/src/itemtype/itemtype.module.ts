import { Module } from '@nestjs/common';
import { ItemTypeService } from './itemtype.service';
import { ItemTypeController } from './itemtype.controller';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  controllers: [ItemTypeController],
  providers: [ItemTypeService],
  imports: [PrismaModule],
})
export class ItemtypeModule {}
