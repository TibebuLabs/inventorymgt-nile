// src/stock-in/stock-in.controller.ts
import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StockInService } from './stock-in.service';
import { CreateStockInDto } from './dto/create-stock-in.dto';
import { UpdateStockInDto } from './dto/update-stock-in.dto';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
@ApiTags('stock-in')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('stock-in')
export class StockInController {
  constructor(private readonly stockInService: StockInService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new StockIn record' })
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
  })
  create(@Body() createStockInDto: CreateStockInDto) {
    return this.stockInService.create(createStockInDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all StockIn records' })
  @ApiResponse({ status: 200, description: 'List of all StockIn records.' })
  findAll() {
    return this.stockInService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a StockIn record by ID' })
  @ApiResponse({ status: 200, description: 'The found StockIn record.' })
  findOne(@Param('id') id: string) {
    return this.stockInService.findOne(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a StockIn record by ID' })
  @ApiResponse({ status: 200, description: 'The updated StockIn record.' })
  update(@Param('id') id: string, @Body() updateStockInDto: UpdateStockInDto) {
    return this.stockInService.update(+id, updateStockInDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a StockIn record by ID' })
  @ApiResponse({ status: 200, description: 'The deleted StockIn record.' })
  remove(@Param('id') id: string) {
    return this.stockInService.remove(+id);
  }
}
