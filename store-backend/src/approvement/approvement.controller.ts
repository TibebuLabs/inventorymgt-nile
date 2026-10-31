import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ApprovementService } from './approvement.service';
import { CreateApprovementDto } from './dto/create-approvement.dto';
import { UpdateApprovementDto } from './dto/update-approvement.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@ApiTags('approvement')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('approvement')
export class ApprovementController {
  constructor(private readonly approvementService: ApprovementService) {}

  @Post()
  @Roles('store-manager', 'admin', 'department-head')
  @ApiOperation({ summary: 'Create an approval record' })
  @ApiResponse({ status: 201, description: 'Approval record created' })
  create(@Body() createApprovementDto: CreateApprovementDto) {
    return this.approvementService.create(createApprovementDto);
  }

  @Get()
  @Roles('store-manager', 'admin')
  @ApiOperation({ summary: 'List all approval records' })
  findAll() {
    return this.approvementService.findAll();
  }

  @Get(':id')
  @Roles('store-manager', 'admin', 'store-keeper')
  @ApiOperation({ summary: 'Get an approval record by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.approvementService.findOne(id);
  }

  @Put(':id')
  @Roles('store-manager', 'admin', 'department-head')
  @ApiOperation({
    summary: 'Update an approval record (approve/check/receive)',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateApprovementDto: UpdateApprovementDto,
  ) {
    return this.approvementService.update(id, updateApprovementDto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete an approval record (admin only)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.approvementService.remove(id);
  }
}
