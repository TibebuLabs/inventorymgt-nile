import { PartialType } from '@nestjs/mapped-types';
import { CreateSrnDto } from './create-srn.dto';

export class UpdateSrnDto extends PartialType(CreateSrnDto) {}
