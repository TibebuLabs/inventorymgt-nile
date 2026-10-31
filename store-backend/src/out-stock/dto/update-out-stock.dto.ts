import { PartialType } from '@nestjs/swagger';
import { CreateOutStockDto } from './create-out-stock.dto';

export class UpdateOutStockDto extends PartialType(CreateOutStockDto) {}
