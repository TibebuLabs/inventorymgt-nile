import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AuditService } from './audit.service';

@ApiTags('audit')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles('admin', 'store-manager')
  findAll(
    @Query('entity') entity?: string,
    @Query('action') action?: string,
    @Query('employeeId') employeeId?: string,
    @Query('search') search?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.auditService.findAll({
      entity,
      action,
      employeeId: employeeId ? Number(employeeId) : undefined,
      search,
      from,
      to,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    });
  }

  @Get('stats')
  @Roles('admin', 'store-manager')
  stats() {
    return this.auditService.stats();
  }
}
