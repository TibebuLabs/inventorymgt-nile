// src/employee/employee.service.ts
import {
  Injectable,
  Inject,
  forwardRef,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { AuthService } from '../auth/auth.service';
import { hashPassword } from 'src/utils/hashpassword';

@Injectable()
export class EmployeeService {
  constructor(
    private prisma: PrismaService,

    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto) {
    try {
      if (createEmployeeDto.department_id <= 0) {
        throw new BadRequestException('Department ID must be greater than 0.');
      }

      if (!this.isValidEmail(createEmployeeDto.email)) {
        throw new BadRequestException('Invalid email format.');
      }

      if (
        createEmployeeDto.phone &&
        !this.isValidPhoneNumber(createEmployeeDto.phone)
      ) {
        throw new BadRequestException(
          'Phone number must be exactly 10 digits.',
        );
      }

      if (
        !createEmployeeDto.full_name ||
        createEmployeeDto.full_name.trim() === ''
      ) {
        throw new BadRequestException('Full name cannot be empty.');
      }

      const existingEmployee = await this.prisma.employee.findUnique({
        where: { email: createEmployeeDto.email },
      });

      if (existingEmployee) {
        throw new ConflictException('Employee with this email already exists.');
      }

      const hashedPassword = await hashPassword(createEmployeeDto.password);

      const employee = await this.prisma.employee.create({
        data: {
          ...createEmployeeDto,
          password: hashedPassword,
        },
      });

      const { password, ...result } = employee;
      return result;
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error; // Re-throw specific exceptions
      }
      throw new InternalServerErrorException(
        `Failed to create employee.${error}`,
      );
    }
  }

  async findAll() {
    try {
      const employees = await this.prisma.employee.findMany({
        include: {
          role: true,
        },
      });

      return employees.map(({ password, ...rest }) => rest);
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch employees.');
    }
  }

  async findOne(id: number) {
    try {
      const employee = await this.prisma.employee.findUnique({
        include: {
          role: true,
        },
        where: { id },
      });

      if (!employee) {
        throw new NotFoundException(`Employee with ID ${id} not found.`);
      }

      // Exclude password from the response
      const { password, ...result } = employee;
      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // Re-throw the NotFoundException
      }
      throw new InternalServerErrorException('Failed to fetch employee.');
    }
  }

  async findByEmail(email: string) {
    try {
      const employee = await this.prisma.employee.findUnique({
        where: { email },
      });

      if (!employee) {
        throw new NotFoundException(`Employee with email ${email} not found.`);
      }

      // Exclude password from the response
      const { password, ...result } = employee;
      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // Re-throw the NotFoundException
      }
      throw new InternalServerErrorException(
        'Failed to fetch employee by email.',
      );
    }
  }

  async findByEmailWithPassword(email: string) {
    try {
      const employee = await this.prisma.employee.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          password: true,
          role: true,
          full_name: true,
        },
      });

      if (!employee) {
        throw new NotFoundException(`Employee with email ${email} not found.`);
      }

      return employee;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to fetch employee by email.',
      );
    }
  }

  async update(id: number, updateEmployeeDto: UpdateEmployeeDto) {
    try {
      // Check if the employee exists
      const employee = await this.prisma.employee.findUnique({
        where: { id },
      });

      if (!employee) {
        throw new NotFoundException(`Employee with ID ${id} not found.`);
      }

      // Validate departmentId (if provided)
      if (
        updateEmployeeDto.department_id &&
        updateEmployeeDto.department_id <= 0
      ) {
        throw new BadRequestException('Department ID must be greater than 0.');
      }

      // Validate email format (if provided)
      if (
        updateEmployeeDto.email &&
        !this.isValidEmail(updateEmployeeDto.email)
      ) {
        throw new BadRequestException('Invalid email format.');
      }

      // Validate phone number length (if provided)
      if (
        updateEmployeeDto.phone &&
        !this.isValidPhoneNumber(updateEmployeeDto.phone)
      ) {
        throw new BadRequestException(
          'Phone number must be exactly 10 digits.',
        );
      }

      // Validate full name (if provided)
      if (
        updateEmployeeDto.full_name &&
        updateEmployeeDto.full_name.trim() === ''
      ) {
        throw new BadRequestException('Full name cannot be empty.');
      }

      // Hash password if it is being updated
      let dataToUpdate: Record<string, unknown> = { ...updateEmployeeDto };
      if (updateEmployeeDto.password) {
        dataToUpdate = {
          ...dataToUpdate,
          password: await hashPassword(updateEmployeeDto.password),
        };
      }

      // Update the employee
      const updatedEmployee = await this.prisma.employee.update({
        where: { id },
        data: dataToUpdate,
      });

      // Exclude password from the response
      const { password, ...result } = updatedEmployee;
      return result;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error; // Re-throw specific exceptions
      }
      throw new InternalServerErrorException('Failed to update employee.');
    }
  }

  async remove(id: number) {
    try {
      // Check if the employee exists
      const employee = await this.prisma.employee.findUnique({
        where: { id },
      });

      if (!employee) {
        throw new NotFoundException(`Employee with ID ${id} not found.`);
      }

      // Delete the employee
      const deletedEmployee = await this.prisma.employee.delete({
        where: { id },
      });

      // Exclude password from the response
      const { password, ...result } = deletedEmployee;
      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // Re-throw the NotFoundException
      }
      throw new InternalServerErrorException('Failed to delete employee.');
    }
  }

  // Helper method to validate email format
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Helper method to validate phone number length
  private isValidPhoneNumber(phone: string): boolean {
    return phone.length === 10 && /^\d+$/.test(phone); // Ensure exactly 10 digits
  }
}
