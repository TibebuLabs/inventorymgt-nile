import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { StoreIssueVoucherItemService } from './store-issue-voucher-item.service';
import { CreateStoreIssueVoucherItemDto } from './dto/create-store-issue-voucher-item.dto';
import { UpdateStoreIssueVoucherItemDto } from './dto/update-store-issue-voucher-item.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
@ApiTags('StoreIssueVoucherItem')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('store-issue-voucher-item')
export class StoreIssueVoucherItemController {
  constructor(private readonly service: StoreIssueVoucherItemService) {}

  @Post()
  @Roles('admin', 'store-keeper')
  @ApiOperation({ summary: 'Create a Store Issue Voucher Item' })
  @ApiResponse({ status: 201, description: 'Created successfully' })
  create(@Body() dto: CreateStoreIssueVoucherItemDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all Store Issue Voucher Items' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Store Issue Voucher Item by ID' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a Store Issue Voucher Item' })
  update(@Param('id') id: string, @Body() dto: UpdateStoreIssueVoucherItemDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a Store Issue Voucher Item' })
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
