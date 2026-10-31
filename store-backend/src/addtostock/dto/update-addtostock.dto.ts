import { PartialType } from '@nestjs/swagger';
import { CreateAddtostockDto } from './create-addtostock.dto';

export class UpdateAddtostockDto extends PartialType(CreateAddtostockDto) {}
