// src/stock-in/dto/update-stock-in.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateStockInDto } from './create-stock-in.dto';

export class UpdateStockInDto extends PartialType(CreateStockInDto) {}
