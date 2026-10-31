import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateGrnItemDto } from './dto/create-grnitem.dto';

@Injectable()
export class GrnItemService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateGrnItemDto) {
    try {
      await this.validateForeignKeys(data);
      return await this.prisma.grnItem.create({
        data: {
          grn_id: data.grn_id,
          ser_no: data.ser_no,
          description: data.description,
          unit_measurement_id: data.unit_measurement_id,
          qua_ordered: data.qua_ordered,
          qua_delivered: data.qua_delivered,
          quantity_received: data.quantity_received,
          unit_price: data.unit_price,
          total_item_price: data.qua_delivered * data.unit_price,
          remark: data.remark ?? '',
        },
        include: { item: true, unit_measurement: true },
      });
    } catch (error) {
      throw new BadRequestException(
        'Error creating GRN Item: ' + error.message,
      );
    }
  }

  async findAll() {
    return await this.prisma.grnItem.findMany({
      include: { item: true, unit_measurement: true },
    });
  }

  async findOne(id: number) {
    const grnItem = await this.prisma.grnItem.findUnique({
      where: { id },
      include: { item: true, unit_measurement: true },
    });

    if (!grnItem) {
      throw new NotFoundException(`GRN Item with ID ${id} not found`);
    }

    return grnItem;
  }

  async update(id: number, data: Partial<CreateGrnItemDto>) {
    await this.findOne(id); // Ensure item exists

    if (data.grn_id || data.description || data.unit_measurement_id) {
      await this.validateForeignKeys(data);
    }

    return await this.prisma.grnItem.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    await this.findOne(id); // Ensure item exists

    return await this.prisma.grnItem.delete({
      where: { id },
    });
  }

  private async validateForeignKeys(data: Partial<CreateGrnItemDto>) {
    const { grn_id, description, unit_measurement_id } = data;

    if (grn_id) {
      const grnExists = await this.prisma.grn.findUnique({
        where: { id: grn_id },
      });
      if (!grnExists)
        throw new BadRequestException(`GRN with ID ${grn_id} not found`);
    }

    if (description) {
      const itemExists = await this.prisma.item.findUnique({
        where: { id: description },
      });
      if (!itemExists)
        throw new BadRequestException(`Item with ID ${description} not found`);
    }

    if (unit_measurement_id) {
      const unitExists = await this.prisma.unitMeasurement.findUnique({
        where: { id: unit_measurement_id },
      });
      if (!unitExists)
        throw new BadRequestException(
          `UnitMeasurement with ID ${unit_measurement_id} not found`,
        );
    }
  }
}
