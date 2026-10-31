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
import { VendorService } from './vendor.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';

@ApiTags('vendors')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('vendors')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @Post()
  @Roles('admin', 'store-manager', 'store-keeper')
  create(@Body() dto: CreateVendorDto) {
    return this.vendorService.create(dto);
  }

  @Get()
  @Roles('admin', 'store-manager', 'store-keeper')
  findAll(@Query('search') search?: string) {
    return this.vendorService.findAll(search);
  }

  @Get(':id')
  @Roles('admin', 'store-manager', 'store-keeper')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.vendorService.findOne(id);
  }

  @Put(':id')
  @Roles('admin', 'store-manager', 'store-keeper')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateVendorDto,
  ) {
    return this.vendorService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin', 'store-manager')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.vendorService.remove(id);
  }
}
