// src/stock-out/dto/update-stock-out.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateStockOutDto } from './create-stock-out.dto';

export class UpdateStockOutDto extends PartialType(CreateStockOutDto) {}
