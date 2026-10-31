// src/department/department.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class DepartmentService {
  constructor(private prisma: PrismaService) {}

  async create(createDepartmentDto: CreateDepartmentDto) {
    if (
      !createDepartmentDto.department_name ||
      createDepartmentDto.department_name.trim() === ''
    ) {
      throw new BadRequestException('Department name cannot be empty.');
    }

    try {
      return await this.prisma.department.create({
        data: createDepartmentDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'A department with this name already exists.',
          );
        }
      }
      // Handle other errors
      throw new InternalServerErrorException(
        ` An error occurred while creating the department. ${error}`,
      );
    }
  }

  async findAll() {
    try {
      return await this.prisma.department.findMany({
        // include: {
        //   department_head: true, // Include the department head details
        //   employees: true, // Include the list of employees
        // },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occurred while fetching departments.',
      );
    }
  }

  async findOne(id: number) {
    try {
      const department = await this.prisma.department.findUnique({
        where: { id },
        include: {
          department_head: true, // Include the department head details
          employees: true, // Include the list of employees
        },
      });

      if (!department) {
        throw new NotFoundException(`Department with ID ${id} not found.`);
      }

      return department;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while fetching the department.',
      );
    }
  }

  async update(id: number, updateDepartmentDto: UpdateDepartmentDto) {
    // Validate input
    if (
      updateDepartmentDto.department_name &&
      updateDepartmentDto.department_name.trim() === ''
    ) {
      throw new BadRequestException('Department name cannot be empty.');
    }

    try {
      const department = await this.prisma.department.findUnique({
        where: { id },
      });

      if (!department) {
        throw new NotFoundException(`Department with ID ${id} not found.`);
      }

      return await this.prisma.department.update({
        where: { id },
        data: updateDepartmentDto,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle unique constraint violation
        if (error.code === 'P2002') {
          throw new ConflictException(
            'A department with this name already exists.',
          );
        }
      }
      throw new InternalServerErrorException(
        'An error occurred while updating the department.',
      );
    }
  }

  async remove(id: number) {
    try {
      const department = await this.prisma.department.findUnique({
        where: { id },
      });

      if (!department) {
        throw new NotFoundException(`Department with ID ${id} not found.`);
      }

      return await this.prisma.department.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while deleting the department.',
      );
    }
  }
}
