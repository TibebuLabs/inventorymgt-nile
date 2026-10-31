// src/unit-measurement/unit-measurement.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateUnitMeasurementDto } from './dto/create-unitmesurment.dto';
import { UpdateUnitMeasurementDto } from './dto/update-unitmesurment.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class UnitMeasurementService {
  constructor(private prisma: PrismaService) {}

  async create(createUnitMeasurementDto: CreateUnitMeasurementDto) {
    // Check if the unit is empty
    if (
      !createUnitMeasurementDto.unit ||
      createUnitMeasurementDto.unit.trim() === ''
    ) {
      throw new BadRequestException('Unit cannot be empty.');
    }

    try {
      return await this.prisma.unitMeasurement.create({
        data: createUnitMeasurementDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'A unit measurement with this name already exists.',
          );
        }
      }
      throw new InternalServerErrorException(
        'An error occurred while creating the unit measurement.',
      );
    }
  }

  async findAll() {
    try {
      return await this.prisma.unitMeasurement.findMany();
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occurred while fetching unit measurements.',
      );
    }
  }

  async findOne(id: number) {
    try {
      const unitMeasurement = await this.prisma.unitMeasurement.findUnique({
        where: { id },
      });

      if (!unitMeasurement) {
        throw new NotFoundException(
          `Unit measurement with ID ${id} not found.`,
        );
      }

      return unitMeasurement;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while fetching the unit measurement.',
      );
    }
  }

  async update(id: number, updateUnitMeasurementDto: UpdateUnitMeasurementDto) {
    // Check if the unit is empty
    if (
      updateUnitMeasurementDto.unit &&
      updateUnitMeasurementDto.unit.trim() === ''
    ) {
      throw new BadRequestException('Unit cannot be empty.');
    }

    try {
      const unitMeasurement = await this.prisma.unitMeasurement.findUnique({
        where: { id },
      });

      if (!unitMeasurement) {
        throw new NotFoundException(
          `Unit measurement with ID ${id} not found.`,
        );
      }

      return await this.prisma.unitMeasurement.update({
        where: { id },
        data: updateUnitMeasurementDto,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'A unit measurement with this name already exists.',
          );
        }
      }
      throw new InternalServerErrorException(
        'An error occurred while updating the unit measurement.',
      );
    }
  }

  async remove(id: number) {
    try {
      const unitMeasurement = await this.prisma.unitMeasurement.findUnique({
        where: { id },
      });

      if (!unitMeasurement) {
        throw new NotFoundException(
          `Unit measurement with ID ${id} not found.`,
        );
      }

      return await this.prisma.unitMeasurement.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while deleting the unit measurement.',
      );
    }
  }
}
