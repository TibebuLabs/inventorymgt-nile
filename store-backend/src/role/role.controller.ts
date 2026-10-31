// src/role/role.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

// @UseGuards(JwtAuthGuard,RolesGuard)

@ApiTags('role')
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ status: 201, description: 'Role created successfully.' })
  @Roles('admin')
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Get()
  // @Roles('admin')
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({ status: 200, description: 'List of all roles.' })
  findAll() {
    return this.roleService.findAll();
  }

  @Get(':id')
  // @Roles('admin')
  @ApiOperation({ summary: 'Get a role by ID' })
  @ApiResponse({ status: 200, description: 'Role found.' })
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(+id);
  }

  @Put(':id')
  // @Roles('admin')
  @ApiOperation({ summary: 'Update a role by ID' })
  @ApiResponse({ status: 200, description: 'Role updated successfully.' })
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(+id, updateRoleDto);
  }

  @Delete(':id')
  // @Roles('admin')
  @ApiOperation({ summary: 'Delete a role by ID' })
  @ApiResponse({ status: 200, description: 'Role deleted successfully.' })
  remove(@Param('id') id: string) {
    return this.roleService.remove(+id);
  }
}
