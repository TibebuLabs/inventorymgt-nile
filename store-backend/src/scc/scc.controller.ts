import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Put,
  Delete,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { SccService } from './scc.service';
import { CreateSccDto } from './dto/create-scc.dto';
import { UpdateSccDto } from './dto/update-scc.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@ApiTags('scc')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('scc')
export class SccController {
  constructor(private readonly sccService: SccService) {}

  @Post()
  @Roles('admin', 'store-manager', 'store-keeper')
  @ApiOperation({ summary: 'Create a new SCC item' })
  @ApiResponse({
    status: 201,
    description: 'The SCC item has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiBody({ type: CreateSccDto })
  async create(@Body() createSccDto: CreateSccDto) {
    return this.sccService.create(createSccDto);
  }

  // Get all SCC items
  @Get()
  @ApiOperation({ summary: 'Get all SCC items' })
  @ApiResponse({ status: 200, description: 'Returns all SCC items.' })
  async findAll() {
    return this.sccService.findAll();
  }

  // Get a single SCC item by ID
  @Get(':id')
  @ApiOperation({ summary: 'Get an SCC item by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the SCC item with the specified ID.',
  })
  @ApiResponse({ status: 404, description: 'SCC item not found.' })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the SCC item' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const sccItem = await this.sccService.findOne(id);
    if (!sccItem) {
      throw new NotFoundException(`SCC item with ID ${id} not found`);
    }
    return sccItem;
  }

  // Update an SCC item by ID
  @Put(':id')
  @Roles('admin', 'store-manager', 'store-keeper')
  @ApiOperation({ summary: 'Update an SCC item by ID' })
  @ApiResponse({
    status: 200,
    description: 'The SCC item has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'SCC item not found.' })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the SCC item' })
  @ApiBody({ type: UpdateSccDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSccDto: UpdateSccDto,
  ) {
    return this.sccService.update(id, updateSccDto);
  }

  // Delete an SCC item by ID
  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete an SCC item by ID' })
  @ApiResponse({
    status: 200,
    description: 'The SCC item has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'SCC item not found.' })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the SCC item' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.sccService.remove(id);
  }
}
