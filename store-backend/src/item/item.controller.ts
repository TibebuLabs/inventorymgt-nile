import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Put,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ItemService } from './item.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
@ApiTags('items')
// `item` is kept as an alias so older clients keep working.
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller(['items', 'item'])
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Post()
  @Roles('admin', 'store-manager')
  @ApiOperation({ summary: 'Create a new item' })
  @ApiResponse({
    status: 201,
    description: 'The item has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiBody({ type: CreateItemDto })
  create(@Body() createItemDto: CreateItemDto) {
    return this.itemService.create(createItemDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all items (optionally filtered by location)' })
  @ApiResponse({ status: 200, description: 'List of all items.' })
  @ApiQuery({
    name: 'locationId',
    required: false,
    type: Number,
    description: 'Filter items by location ID',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search items by name, SKU, or location details',
  })
  findAll(
    @Query('locationId') locationId?: string,
    @Query('search') search?: string,
  ) {
    if (search) {
      return this.itemService.searchItems(search);
    }
    if (locationId) {
      return this.itemService.findByLocation(Number(locationId));
    }
    return this.itemService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an item by ID' })
  @ApiResponse({ status: 200, description: 'The item with the specified ID.' })
  @ApiResponse({ status: 404, description: 'Item not found.' })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the item' })
  findOne(@Param('id') id: string) {
    return this.itemService.findOne(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an item by ID' })
  @ApiResponse({
    status: 200,
    description: 'The item has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Item not found.' })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the item' })
  @ApiBody({ type: UpdateItemDto })
  update(@Param('id') id: string, @Body() updateItemDto: UpdateItemDto) {
    return this.itemService.update(+id, updateItemDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Partially update an item by ID' })
  @ApiResponse({
    status: 200,
    description: 'The item has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Item not found.' })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the item' })
  @ApiBody({ type: UpdateItemDto })
  patch(@Param('id') id: string, @Body() updateItemDto: UpdateItemDto) {
    return this.itemService.update(+id, updateItemDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an item by ID' })
  @ApiResponse({
    status: 200,
    description: 'The item has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Item not found.' })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the item' })
  remove(@Param('id') id: string) {
    return this.itemService.remove(+id);
  }
}
