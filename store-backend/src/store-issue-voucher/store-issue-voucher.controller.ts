import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { StoreIssueVoucherService } from './store-issue-voucher.service';
import { CreateStoreIssueVoucherDto } from './dto/create-store-issue-voucher.dto';
import { UpdateStoreIssueVoucherDto } from './dto/update-store-issue-voucher.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@ApiTags('StoreIssueVoucher')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('store-issue-voucher')
export class StoreIssueVoucherController {
  constructor(
    private readonly storeIssueVoucherService: StoreIssueVoucherService,
  ) {}

  @Post()
  @Roles('store-keeper', 'store-manager', 'admin')
  @ApiOperation({
    summary: 'Issue stock and create a store issue voucher (transactional)',
  })
  create(@Body() dto: CreateStoreIssueVoucherDto, @Req() req: any) {
    return this.storeIssueVoucherService.create(dto, req.user);
  }

  @Get()
  @Roles('store-keeper', 'store-manager', 'admin', 'department-head')
  findAll() {
    return this.storeIssueVoucherService.findAll();
  }

  @Get(':id')
  @Roles('store-keeper', 'store-manager', 'admin', 'department-head')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.storeIssueVoucherService.findOne(id);
  }

  @Patch(':id')
  @Roles('store-keeper', 'store-manager', 'admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStoreIssueVoucherDto,
  ) {
    return this.storeIssueVoucherService.update(id, dto);
  }

  @Patch(':id/cancel')
  @Roles('store-manager', 'admin')
  @ApiOperation({ summary: 'Cancel a voucher and return stock' })
  cancel(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.storeIssueVoucherService.cancel(id, req.user);
  }

  @Delete(':id')
  @Roles('store-manager', 'admin')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.storeIssueVoucherService.remove(id, req.user);
  }
}
