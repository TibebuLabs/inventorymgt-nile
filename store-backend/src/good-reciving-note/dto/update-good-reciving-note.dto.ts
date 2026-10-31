// src/grn/dto/update-grn.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateGrnDto } from './create-good-reciving-note.dto';

export class UpdateGrnDto extends PartialType(CreateGrnDto) {}
