// src/department/department.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@ApiTags('department')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('department')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new Department record' })
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
  })
  @Roles('admin')
  create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentService.create(createDepartmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all Department records' })
  @ApiResponse({ status: 200, description: 'List of all Department records.' })
  findAll() {
    return this.departmentService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a Department record by ID' })
  @ApiResponse({ status: 200, description: 'The found Department record.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.departmentService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a Department record by ID' })
  @ApiResponse({ status: 200, description: 'The updated Department record.' })
  @Roles('admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ) {
    return this.departmentService.update(id, updateDepartmentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a Department record by ID' })
  @ApiResponse({ status: 200, description: 'The deleted Department record.' })
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.departmentService.remove(id);
  }
}
