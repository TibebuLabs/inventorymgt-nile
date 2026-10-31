// src/stock-balance/stock-balance.controller.ts
import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StockBalanceService } from './stock-balance.service';
import { CreateStockBalanceDto } from './dto/create-stock-balance.dto';
import { UpdateStockBalanceDto } from './dto/update-stock-balance.dto';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
@ApiTags('stock-balance')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('stock-balance')
export class StockBalanceController {
  constructor(private readonly stockBalanceService: StockBalanceService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new StockBalance record' })
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
  })
  create(@Body() createStockBalanceDto: CreateStockBalanceDto) {
    return this.stockBalanceService.create(createStockBalanceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all StockBalance records' })
  @ApiResponse({
    status: 200,
    description: 'List of all StockBalance records.',
  })
  findAll() {
    return this.stockBalanceService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a StockBalance record by ID' })
  @ApiResponse({ status: 200, description: 'The found StockBalance record.' })
  findOne(@Param('id') id: string) {
    return this.stockBalanceService.findOne(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a StockBalance record by ID' })
  @ApiResponse({ status: 200, description: 'The updated StockBalance record.' })
  update(
    @Param('id') id: string,
    @Body() updateStockBalanceDto: UpdateStockBalanceDto,
  ) {
    return this.stockBalanceService.update(+id, updateStockBalanceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a StockBalance record by ID' })
  @ApiResponse({ status: 200, description: 'The deleted StockBalance record.' })
  remove(@Param('id') id: string) {
    return this.stockBalanceService.remove(+id);
  }
}
