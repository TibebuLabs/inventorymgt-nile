import { PartialType } from '@nestjs/swagger';
import { CreateUnitMeasurementDto } from './create-unitmesurment.dto';

export class UpdateUnitMeasurementDto extends PartialType(
  CreateUnitMeasurementDto,
) {}
