import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Put,
  Req,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateGrnDto } from './dto/create-good-reciving-note.dto';
import { UpdateGrnDto } from './dto/update-good-reciving-note.dto';
import { ReviewGrnDto } from './dto/review-grn.dto';
import { GrnService } from './good-reciving-note.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@ApiTags('grn')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('grn')
export class GrnController {
  constructor(private readonly grnService: GrnService) {}

  @Post()
  @Roles('store-keeper', 'admin')
  @ApiOperation({ summary: 'Create a new Goods Receiving Note (GRN)' })
  @ApiResponse({ status: 201, description: 'GRN created successfully' })
  create(@Body() createGrnDto: CreateGrnDto, @Req() req: any) {
    return this.grnService.create(createGrnDto, req.user);
  }

  @Get()
  @Roles('store-keeper', 'store-manager', 'admin', 'department-head')
  @ApiOperation({ summary: 'List all GRNs' })
  findAll() {
    return this.grnService.findAll();
  }

  @Get(':id')
  @Roles('store-keeper', 'store-manager', 'admin', 'department-head')
  @ApiOperation({
    summary: 'Get a GRN by ID (with all items and approval info)',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.grnService.findOne(id);
  }

  @Put(':id')
  @Roles('store-keeper', 'admin')
  @ApiOperation({ summary: 'Update a GRN record' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGrnDto: UpdateGrnDto,
  ) {
    return this.grnService.update(id, updateGrnDto);
  }

  @Patch(':id/approve')
  @Roles('store-manager', 'admin')
  @ApiOperation({
    summary: 'Approve a GRN and post the received quantities into stock',
  })
  approve(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.grnService.approve(id, req.user);
  }

  @Patch(':id/reject')
  @Roles('store-manager', 'admin')
  @ApiOperation({ summary: 'Reject a GRN with a reason' })
  reject(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReviewGrnDto,
    @Req() req: any,
  ) {
    return this.grnService.reject(id, dto.reason ?? '', req.user);
  }
}
