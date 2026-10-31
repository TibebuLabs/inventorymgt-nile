import { Module } from '@nestjs/common';
import { UnitMeasurementService } from './unitmesurment.service';
import { UnitMeasurementController } from './unitmesurment.controller';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  controllers: [UnitMeasurementController],
  providers: [UnitMeasurementService],
  imports: [PrismaModule],
})
export class UnitmesurmentModule {}
