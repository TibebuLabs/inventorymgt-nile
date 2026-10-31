import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    // No roles required — allow all authenticated users
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Set by JwtStrategy.validate()

    if (!user) {
      throw new ForbiddenException('User not found in request');
    }

    // JwtStrategy.validate() returns { userId, email, role }
    if (!user.userId) {
      this.logger.warn(
        `Missing userId in request.user: ${JSON.stringify(user)}`,
      );
      throw new ForbiddenException('Missing user ID in token');
    }

    try {
      // Always fetch the latest role from the database (not stale JWT claim)
      const employee = await this.prisma.employee.findUnique({
        where: { id: user.userId },
        select: { role: true },
      });

      if (!employee?.role) {
        throw new ForbiddenException('User role not found');
      }

      if (!requiredRoles.includes(employee.role.role)) {
        throw new ForbiddenException(
          'You do not have permission to access this resource',
        );
      }

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      this.logger.error(`Error in RolesGuard: ${error.message}`);
      throw new ForbiddenException('Unable to verify user role');
    }
  }
}
