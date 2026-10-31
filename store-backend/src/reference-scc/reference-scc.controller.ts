import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { ReferanceSccService } from './reference-scc.service';
import { CreateReferanceSccDto } from './dto/create-reference-scc.dto';
import { UpdateReferanceSccDto } from './dto/update-reference-scc.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
@ApiTags('referance-scc')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('referance-scc')
export class ReferanceSccController {
  constructor(private readonly referanceSccService: ReferanceSccService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new ReferanceScc' })
  @ApiResponse({
    status: 201,
    description: 'ReferanceScc created successfully.',
  })
  @ApiBody({ type: CreateReferanceSccDto })
  create(@Body() createReferanceSccDto: CreateReferanceSccDto) {
    return this.referanceSccService.create(createReferanceSccDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all ReferanceScc records' })
  @ApiResponse({
    status: 200,
    description: 'List of all ReferanceScc records.',
  })
  findAll() {
    return this.referanceSccService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a ReferanceScc by ID' })
  @ApiResponse({ status: 200, description: 'ReferanceScc found.' })
  @ApiResponse({ status: 404, description: 'ReferanceScc not found.' })
  @ApiParam({ name: 'id', type: 'number', example: 1 })
  findOne(@Param('id') id: string) {
    return this.referanceSccService.findOne(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a ReferanceScc by ID' })
  @ApiResponse({
    status: 200,
    description: 'ReferanceScc updated successfully.',
  })
  @ApiResponse({ status: 404, description: 'ReferanceScc not found.' })
  @ApiParam({ name: 'id', type: 'number', example: 1 })
  @ApiBody({ type: UpdateReferanceSccDto })
  update(
    @Param('id') id: string,
    @Body() updateReferanceSccDto: UpdateReferanceSccDto,
  ) {
    return this.referanceSccService.update(+id, updateReferanceSccDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a ReferanceScc by ID' })
  @ApiResponse({
    status: 200,
    description: 'ReferanceScc deleted successfully.',
  })
  @ApiResponse({ status: 404, description: 'ReferanceScc not found.' })
  @ApiParam({ name: 'id', type: 'number', example: 1 })
  remove(@Param('id') id: string) {
    return this.referanceSccService.remove(+id);
  }
}
