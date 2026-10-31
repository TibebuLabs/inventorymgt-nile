// src/referance-scc/dto/update-referance-scc.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateReferanceSccDto } from './create-reference-scc.dto';

export class UpdateReferanceSccDto extends PartialType(CreateReferanceSccDto) {}
