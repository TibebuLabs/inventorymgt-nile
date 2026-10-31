// src/stock-balance/dto/update-stock-balance.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateStockBalanceDto } from './create-stock-balance.dto';

export class UpdateStockBalanceDto extends PartialType(CreateStockBalanceDto) {}
