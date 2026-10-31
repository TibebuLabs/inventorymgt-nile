import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { OutStockService } from './out-stock.service';
import { CreateOutStockDto } from './dto/create-out-stock.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@ApiTags('out-stock')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('out-stock')
export class OutStockController {
  constructor(private readonly outStockService: OutStockService) {}

  @Post()
  @Roles('store-manager', 'store-keeper', 'admin')
  @ApiOperation({ summary: 'Issue stock from an approved SRN' })
  @ApiResponse({ status: 201, description: 'Stock issued successfully' })
  @ApiResponse({
    status: 400,
    description: 'SRN not approved or insufficient stock',
  })
  @ApiResponse({ status: 404, description: 'SRN not found' })
  @ApiBody({ type: CreateOutStockDto })
  create(@Body() createOutStockDto: CreateOutStockDto, @Req() req: any) {
    return this.outStockService.create(createOutStockDto, req.user);
  }
}
