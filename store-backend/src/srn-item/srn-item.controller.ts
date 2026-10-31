import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SrnItemService } from './srn-item.service';
import { CreateSrnItemDto } from './dto/create-srn-item.dto';
import { UpdateSrnItemDto } from './dto/update-srn-item.dto';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
@ApiTags('SrnItem')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('srn-item')
export class SrnItemController {
  constructor(private readonly srnItemService: SrnItemService) {}

  @Post()
  @Roles('admin', 'store-keeper')
  @ApiOperation({ summary: 'Create a new SrnItem' })
  @ApiResponse({ status: 201, description: 'SrnItem created successfully' })
  create(@Body() createSrnItemDto: CreateSrnItemDto) {
    return this.srnItemService.create(createSrnItemDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all SrnItems' })
  findAll() {
    return this.srnItemService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a specific SrnItem' })
  findOne(@Param('id') id: string) {
    return this.srnItemService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an SrnItem' })
  update(@Param('id') id: string, @Body() updateSrnItemDto: UpdateSrnItemDto) {
    return this.srnItemService.update(+id, updateSrnItemDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an SrnItem' })
  remove(@Param('id') id: string) {
    return this.srnItemService.remove(+id);
  }
}
