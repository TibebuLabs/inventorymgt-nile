import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { GrnItemService } from './grnitem.service';
import { CreateGrnItemDto } from './dto/create-grnitem.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
@ApiTags('GRN Item')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('grn-item')
export class GrnItemController {
  constructor(private readonly grnItemService: GrnItemService) {}

  @Post()
  @Roles('admin', 'store-keeper')
  @ApiOperation({ summary: 'Create a new GRN Item' })
  @ApiResponse({ status: 201, description: 'GRN Item successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async create(@Body() data: CreateGrnItemDto) {
    return this.grnItemService.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'Get all GRN Items' })
  @ApiResponse({ status: 200, description: 'List of all GRN Items' })
  async findAll() {
    return this.grnItemService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a GRN Item by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'GRN Item ID' })
  @ApiResponse({ status: 200, description: 'GRN Item found' })
  @ApiResponse({ status: 404, description: 'GRN Item not found' })
  async findOne(@Param('id') id: number) {
    return this.grnItemService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a GRN Item' })
  @ApiParam({ name: 'id', type: Number, description: 'GRN Item ID' })
  @ApiResponse({ status: 200, description: 'GRN Item updated successfully' })
  @ApiResponse({ status: 404, description: 'GRN Item not found' })
  async update(
    @Param('id') id: number,
    @Body() data: Partial<CreateGrnItemDto>,
  ) {
    return this.grnItemService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a GRN Item' })
  @ApiParam({ name: 'id', type: Number, description: 'GRN Item ID' })
  @ApiResponse({ status: 200, description: 'GRN Item deleted successfully' })
  @ApiResponse({ status: 404, description: 'GRN Item not found' })
  async delete(@Param('id') id: number) {
    return this.grnItemService.delete(id);
  }
}
