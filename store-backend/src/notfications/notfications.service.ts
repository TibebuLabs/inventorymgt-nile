import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { Notification, Prisma } from '@prisma/client';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Persist a notification. Returns the stored row so the caller can broadcast
   * it with its real database id.
   */
  async createNotification(
    employeeId: number,
    message: string,
    grnId?: number,
    srnId?: number,
    type = 'system',
    link?: string,
  ): Promise<Notification> {
    if (!Number.isInteger(employeeId) || employeeId <= 0) {
      throw new Error('Invalid employee ID');
    }

    if (!message?.trim()) {
      throw new Error('Message cannot be empty');
    }

    try {
      // A single INSERT is already atomic — no interactive transaction needed
      // (interactive transactions default to a 5s timeout, too tight for the
      // hosted Supabase pooler).
      return await this.prisma.notification.create({
        data: {
          employee_id: employeeId,
          message: message.trim(),
          grn_id: grnId ?? null,
          srn_id: srnId ?? null,
          type,
          link: link ?? null,
          timestamp: new Date(),
          date: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(`Notification creation failed`, {
        error,
        employeeId,
        grnId,
        srnId,
        message:
          message?.length > 50 ? `${message.substring(0, 50)}...` : message,
      });

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2002':
            throw new Error('Notification constraint violation');
          case 'P2003':
            const fieldName = error.meta?.field_name;
            throw new Error(
              fieldName
                ? `Referenced ${fieldName} not found`
                : 'Referenced record not found',
            );
          default:
            throw new Error('Database operation failed');
        }
      }

      throw error instanceof Error
        ? error
        : new Error('Unexpected error creating notification');
    }
  }

  /** Return the ids of every employee that holds one of the given roles. */
  async getEmployeeIdsByRoles(roleNames: string[]): Promise<number[]> {
    if (!Array.isArray(roleNames) || roleNames.length === 0) return [];

    const employees = await this.prisma.employee.findMany({
      where: { role: { role: { in: roleNames } } },
      select: { id: true },
    });

    return employees.map((employee) => employee.id);
  }

  async getNotifications(employeeId: number) {
    if (!Number.isInteger(employeeId) || employeeId <= 0) {
      throw new Error('Invalid employee ID');
    }
    return this.prisma.notification.findMany({
      where: { employee_id: employeeId },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });
  }

  async markAsRead(notificationId: number, employeeId?: number) {
    if (!Number.isInteger(notificationId) || notificationId <= 0) {
      throw new Error('Invalid notification ID');
    }
    // Employees may only mark their own notifications.
    if (employeeId) {
      const owned = await this.prisma.notification.findFirst({
        where: { id: notificationId, employee_id: employeeId },
        select: { id: true },
      });
      if (!owned) throw new Error('Notification not found');
    }
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  }

  async markAllAsRead(employeeId: number) {
    if (!Number.isInteger(employeeId) || employeeId <= 0) {
      throw new Error('Invalid employee ID');
    }
    return this.prisma.notification.updateMany({
      where: { employee_id: employeeId, read: false },
      data: { read: true },
    });
  }
}
