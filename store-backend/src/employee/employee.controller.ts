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
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@ApiTags('employees')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new employee (admin only)' })
  @ApiResponse({ status: 201, description: 'Employee created successfully' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeeService.create(createEmployeeDto);
  }

  @Get()
  @Roles('admin', 'store-manager')
  @ApiOperation({ summary: 'List all employees' })
  @ApiResponse({
    status: 200,
    description: 'List of employees (passwords excluded)',
  })
  findAll() {
    return this.employeeService.findAll();
  }

  @Get(':id')
  @Roles('admin', 'store-manager')
  @ApiOperation({ summary: 'Get an employee by ID' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.employeeService.findOne(id);
  }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update an employee (admin only)' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeeService.update(id, updateEmployeeDto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete an employee (admin only)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.employeeService.remove(id);
  }
}
