import { PartialType } from '@nestjs/swagger';
import { CreateSrnItemDto } from './create-srn-item.dto';

export class UpdateSrnItemDto extends PartialType(CreateSrnItemDto) {}
