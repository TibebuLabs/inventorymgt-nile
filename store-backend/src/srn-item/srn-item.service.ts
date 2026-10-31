import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateSrnItemDto } from './dto/create-srn-item.dto';
import { UpdateSrnItemDto } from './dto/update-srn-item.dto';

@Injectable()
export class SrnItemService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSrnItemDto: CreateSrnItemDto) {
    return this.prisma.srnItem.create({
      data: {
        srn_id: createSrnItemDto.srn_id,
        serial_num: createSrnItemDto.serial_num,
        description: createSrnItemDto.description, // Adjust type if necessary
        unit_measurement_id: createSrnItemDto.unit_measurement_id,
        quantity: createSrnItemDto.quantity,
        remarks: createSrnItemDto.remarks,
      },
    });
  }

  async findAll() {
    return this.prisma.srnItem.findMany({});
  }

  async findOne(id: number) {
    const srnItem = await this.prisma.srnItem.findUnique({
      where: { id },
      include: {
        srn: true,
        item: true,
      },
    });
    if (!srnItem)
      throw new NotFoundException(`SrnItem with ID ${id} not found`);
    return srnItem;
  }

  async update(id: number, updateSrnItemDto: UpdateSrnItemDto) {
    return this.prisma.srnItem.update({
      where: { id },
      data: updateSrnItemDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.srnItem.delete({ where: { id } });
  }
}
