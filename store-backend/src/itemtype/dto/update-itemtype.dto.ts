import { PartialType } from '@nestjs/swagger';
import { CreateItemTypeDto } from './create-itemtype.dto';

export class UpdateItemtypeDto extends PartialType(CreateItemTypeDto) {}
