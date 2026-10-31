// src/approvement/approvement.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateApprovementDto } from './dto/create-approvement.dto';
import { UpdateApprovementDto } from './dto/update-approvement.dto';

@Injectable()
export class ApprovementService {
  constructor(private prisma: PrismaService) {}

  async create(createApprovementDto: CreateApprovementDto) {
    return this.prisma.approvement.create({
      data: createApprovementDto,
    });
  }

  async findAll() {
    return this.prisma.approvement.findMany({
      include: {
        grn: true,
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.approvement.findUnique({
      where: { id },
      include: {},
    });
  }

  async update(id: number, updateApprovementDto: UpdateApprovementDto) {
    return this.prisma.approvement.update({
      where: { id },
      data: updateApprovementDto,
    });
  }

  async remove(id: number) {
    return this.prisma.approvement.delete({
      where: { id },
    });
  }
}
