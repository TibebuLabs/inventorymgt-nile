import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AddtostockService } from './addtostock.service';
import { CreateAddtostockDto } from './dto/create-addtostock.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@ApiTags('addtostock')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('addtostock')
export class AddtostockController {
  constructor(private readonly addtostockService: AddtostockService) {}

  @Post()
  @Roles('store-keeper', 'admin')
  @ApiOperation({ summary: 'Add GRN items to stock (requires approved GRN)' })
  @ApiResponse({
    status: 201,
    description: 'Items successfully added to stock',
  })
  @ApiResponse({ status: 400, description: 'GRN not approved or bad request' })
  @ApiResponse({ status: 404, description: 'GRN not found' })
  @ApiBody({ type: CreateAddtostockDto })
  create(@Body() createAddtostockDto: CreateAddtostockDto, @Req() req: any) {
    return this.addtostockService.create(createAddtostockDto, req.user);
  }
}
