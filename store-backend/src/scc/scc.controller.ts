import {
  Controller,
  Get,
  Post,
  Body,
  Param,
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
} from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('scc')
// @UseGuards(JwtAuthGuard,RolesGuard)

@Controller('scc')
export class SccController {
  constructor(private readonly sccService: SccService) {}

  @Post()
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
  async findOne(@Param('id') id: string) {
    const sccItem = await this.sccService.findOne(+id);
    if (!sccItem) {
      throw new NotFoundException(`SCC item with ID ${id} not found`);
    }
    return sccItem;
  }

  // Update an SCC item by ID
  @Put(':id')
  @ApiOperation({ summary: 'Update an SCC item by ID' })
  @ApiResponse({
    status: 200,
    description: 'The SCC item has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'SCC item not found.' })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the SCC item' })
  @ApiBody({ type: UpdateSccDto })
  async update(@Param('id') id: string, @Body() updateSccDto: UpdateSccDto) {
    return this.sccService.update(+id, updateSccDto);
  }

  // Delete an SCC item by ID
  @Delete(':id')
  @ApiOperation({ summary: 'Delete an SCC item by ID' })
  @ApiResponse({
    status: 200,
    description: 'The SCC item has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'SCC item not found.' })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the SCC item' })
  async remove(@Param('id') id: string) {
    return this.sccService.remove(+id);
  }
}
