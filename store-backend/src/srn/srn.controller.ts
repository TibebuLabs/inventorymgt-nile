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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SrnService } from './srn.service';
import { CreateSrnDto } from './dto/create-srn.dto';
import { UpdateSrnDto } from './dto/update-srn.dto';
import { ReviewSrnDto } from './dto/review-srn.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@ApiTags('Srn')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('srn')
export class SrnController {
  constructor(private readonly srnService: SrnService) {}

  @Post()
  @Roles('employee', 'department-head', 'store-keeper', 'store-manager', 'admin')
  create(@Body() createSrnDto: CreateSrnDto, @Req() req: any) {
    return this.srnService.create(createSrnDto, req.user);
  }

  @Get()
  @Roles('employee', 'department-head', 'store-keeper', 'store-manager', 'admin')
  findAll(@Req() req: any) {
    return this.srnService.findAll(req.user);
  }

  @Get(':id')
  @Roles('employee', 'department-head', 'store-keeper', 'store-manager', 'admin')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.srnService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'store-manager', 'store-keeper')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSrnDto: UpdateSrnDto,
  ) {
    return this.srnService.update(id, updateSrnDto);
  }

  @Patch(':id/approve')
  @Roles('department-head', 'store-manager', 'admin')
  approve(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.srnService.approve(id, req.user);
  }

  @Patch(':id/reject')
  @Roles('department-head', 'store-manager', 'admin')
  reject(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReviewSrnDto,
    @Req() req: any,
  ) {
    return this.srnService.reject(id, dto.reason ?? '', req.user);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.srnService.remove(id);
  }
}
