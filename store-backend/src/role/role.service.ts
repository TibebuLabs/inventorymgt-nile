// src/role/role.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  async create(createRoleDto: CreateRoleDto) {
    // Validate input
    if (!createRoleDto.role || createRoleDto.role.trim() === '') {
      throw new BadRequestException('Role name cannot be empty.');
    }

    try {
      return await this.prisma.role.create({
        data: createRoleDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle unique constraint violation
        if (error.code === 'P2002') {
          throw new ConflictException('A role with this name already exists.');
        }
      }
      // Handle other errors
      throw new InternalServerErrorException(
        'An error occurred while creating the role.',
      );
    }
  }

  async findAll() {
    try {
      return await this.prisma.role.findMany();
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occurred while fetching roles.',
      );
    }
  }

  async findOne(id: number) {
    try {
      const role = await this.prisma.role.findUnique({
        where: { id },
      });

      if (!role) {
        throw new NotFoundException(`Role with ID ${id} not found.`);
      }

      return role;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while fetching the role.',
      );
    }
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    // Validate input
    if (updateRoleDto.role && updateRoleDto.role.trim() === '') {
      throw new BadRequestException('Role name cannot be empty.');
    }

    try {
      const role = await this.prisma.role.findUnique({
        where: { id },
      });

      if (!role) {
        throw new NotFoundException(`Role with ID ${id} not found.`);
      }

      return await this.prisma.role.update({
        where: { id },
        data: updateRoleDto,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle unique constraint violation
        if (error.code === 'P2002') {
          throw new ConflictException('A role with this name already exists.');
        }
      }
      throw new InternalServerErrorException(
        'An error occurred while updating the role.',
      );
    }
  }

  async remove(id: number) {
    try {
      const role = await this.prisma.role.findUnique({
        where: { id },
      });

      if (!role) {
        throw new NotFoundException(`Role with ID ${id} not found.`);
      }

      return await this.prisma.role.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while deleting the role.',
      );
    }
  }
}
