import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { StockService } from './stock.service';
import { AdjustStockDto } from './dto/adjust-stock.dto';

@ApiTags('stock')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get()
  @Roles('admin', 'store-manager', 'store-keeper', 'department-head')
  getBalances(@Query('search') search?: string) {
    return this.stockService.getBalances(search);
  }

  @Get('summary')
  @Roles('admin', 'store-manager', 'store-keeper', 'department-head')
  getSummary() {
    return this.stockService.getSummary();
  }

  @Get('low')
  @Roles('admin', 'store-manager', 'store-keeper', 'department-head')
  getLowStock() {
    return this.stockService.getLowStock();
  }

  @Get('movements')
  @Roles('admin', 'store-manager', 'store-keeper')
  getMovements(@Query('limit') limit?: string) {
    return this.stockService.getMovements(limit ? Number(limit) : undefined);
  }

  @Post('adjust')
  @Roles('admin', 'store-manager')
  adjust(@Body() dto: AdjustStockDto, @Req() req: any) {
    return this.stockService.adjust(dto, req?.user?.userId);
  }
}
