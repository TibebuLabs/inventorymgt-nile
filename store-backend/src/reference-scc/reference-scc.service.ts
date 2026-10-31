import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateReferanceSccDto } from './dto/create-reference-scc.dto';
import { UpdateReferanceSccDto } from './dto/update-reference-scc.dto';

@Injectable()
export class ReferanceSccService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new ReferanceScc record.
   * @param createReferanceSccDto - Data to create a new ReferanceScc.
   * @returns The created ReferanceScc record.
   */
  async create(createReferanceSccDto: CreateReferanceSccDto) {
    //find the grn by grn id

    const refferance = await this.prisma.referanceScc.create({
      data: {
        scc_id: createReferanceSccDto.scc_id,
        date: createReferanceSccDto.date,
        grn_id: createReferanceSccDto.grn_id,
        iv_id: createReferanceSccDto.iv_id,
        unit_measurement_id: createReferanceSccDto.unit_measurement_id,
        stock_in_key: createReferanceSccDto.stock_in_key,
        stock_out_key: createReferanceSccDto.stock_out_key,
        stock_balance_key: createReferanceSccDto.stock_balance_key,
      },
    });

    return refferance;
  }

  /**
   * Retrieve all ReferanceScc records.
   * @returns A list of all ReferanceScc records.
   */
  async findAll() {
    return this.prisma.referanceScc.findMany({
      include: {
        scc: true,
        grn: true,

        unit_measurement: true,
        stock_in: true,
        stock_out: true,
        stock_balance: true,
      },
    });
  }

  /**
   * Retrieve a single ReferanceScc record by ID.
   * @param id - The ID of the ReferanceScc record to retrieve.
   * @returns The found ReferanceScc record.
   * @throws NotFoundException if the record is not found.
   */
  async findOne(id: number) {
    const referanceScc = await this.prisma.referanceScc.findUnique({
      where: { id },
    });

    if (!referanceScc) {
      throw new NotFoundException(`ReferanceScc with ID ${id} not found`);
    }

    return referanceScc;
  }

  /**
   * Update a ReferanceScc record by ID.
   * @param id - The ID of the ReferanceScc record to update.
   * @param updateReferanceSccDto - Data to update the ReferanceScc record.
   * @returns The updated ReferanceScc record.
   * @throws NotFoundException if the record is not found.
   */
  async update(id: number, updateReferanceSccDto: UpdateReferanceSccDto) {
    const existingReferanceScc = await this.prisma.referanceScc.findUnique({
      where: { id },
    });

    if (!existingReferanceScc) {
      throw new NotFoundException(`ReferanceScc with ID ${id} not found`);
    }

    return this.prisma.referanceScc.update({
      where: { id },
      data: {
        scc_id: updateReferanceSccDto.scc_id,
        date: updateReferanceSccDto.date,
        grn_id: updateReferanceSccDto.grn_id,
        iv_id: updateReferanceSccDto.iv_id,
        unit_measurement_id: updateReferanceSccDto.unit_measurement_id,
        stock_in_key: updateReferanceSccDto.stock_in_key,
        stock_out_key: updateReferanceSccDto.stock_out_key,
        stock_balance_key: updateReferanceSccDto.stock_balance_key,
      },
    });
  }

  /**
   * Delete a ReferanceScc record by ID.
   * @param id - The ID of the ReferanceScc record to delete.
   * @returns The deleted ReferanceScc record.
   * @throws NotFoundException if the record is not found.
   */
  async remove(id: number) {
    const existingReferanceScc = await this.prisma.referanceScc.findUnique({
      where: { id },
    });

    if (!existingReferanceScc) {
      throw new NotFoundException(`ReferanceScc with ID ${id} not found`);
    }

    return this.prisma.referanceScc.delete({
      where: { id },
    });
  }
}
