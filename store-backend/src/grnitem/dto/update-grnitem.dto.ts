import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { CreateGrnItemDto } from './create-grnitem.dto';

export class UpdateGrnItemDto extends PartialType(CreateGrnItemDto) {}
