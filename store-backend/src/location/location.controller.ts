import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { LocationService } from './location.service';
import { CreateLocationDto } from './dto/create-location.dto';

@ApiTags('locations')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post()
  @Roles('admin', 'store-manager', 'store-keeper')
  create(@Body() dto: CreateLocationDto) {
    return this.locationService.create(dto);
  }

  @Get()
  @Roles('admin', 'store-manager', 'store-keeper', 'department-head')
  findAll(@Query('search') search?: string) {
    return this.locationService.findAll(search);
  }

  @Get(':id')
  @Roles('admin', 'store-manager', 'store-keeper', 'department-head')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.locationService.findOne(id);
  }

  @Put(':id')
  @Roles('admin', 'store-manager', 'store-keeper')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateLocationDto) {
    return this.locationService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin', 'store-manager')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.locationService.remove(id);
  }
}
