import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

export interface AuditEntry {
  employee_id?: number | null;
  employee_name?: string | null;
  role?: string | null;
  action: string;
  entity: string;
  entity_id?: string | null;
  description: string;
  metadata?: Prisma.InputJsonValue | null;
  method?: string | null;
  path?: string | null;
  ip?: string | null;
}

export interface AuditQuery {
  entity?: string;
  action?: string;
  employeeId?: number;
  search?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Write an audit entry. Auditing must never break a business operation, so
   * every failure is swallowed (and logged).
   */
  async log(entry: AuditEntry): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          employee_id: entry.employee_id ?? null,
          employee_name: entry.employee_name ?? null,
          role: entry.role ?? null,
          action: entry.action,
          entity: entry.entity,
          entity_id: entry.entity_id ? String(entry.entity_id) : null,
          description: entry.description,
          metadata: entry.metadata ?? Prisma.JsonNull,
          method: entry.method ?? null,
          path: entry.path ?? null,
          ip: entry.ip ?? null,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to write audit log: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async findAll(query: AuditQuery) {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(200, Math.max(1, Number(query.pageSize) || 25));

    const where: Prisma.AuditLogWhereInput = {};

    if (query.entity) where.entity = query.entity;
    if (query.action) where.action = query.action.toUpperCase();
    if (query.employeeId) where.employee_id = Number(query.employeeId);

    if (query.from || query.to) {
      where.createdAt = {};
      if (query.from) where.createdAt.gte = new Date(query.from);
      if (query.to) {
        const to = new Date(query.to);
        to.setHours(23, 59, 59, 999);
        where.createdAt.lte = to;
      }
    }

    if (query.search) {
      where.OR = [
        { description: { contains: query.search, mode: 'insensitive' } },
        { employee_name: { contains: query.search, mode: 'insensitive' } },
        { entity: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { data, total, page, pageSize, pages: Math.ceil(total / pageSize) };
  }

  async stats() {
    const since = new Date();
    since.setDate(since.getDate() - 7);

    const [total, last7Days, byAction] = await Promise.all([
      this.prisma.auditLog.count(),
      this.prisma.auditLog.count({ where: { createdAt: { gte: since } } }),
      this.prisma.auditLog.groupBy({
        by: ['action'],
        _count: { _all: true },
        orderBy: { _count: { action: 'desc' } },
        take: 6,
      }),
    ]);

    return {
      total,
      last7Days,
      byAction: byAction.map((row) => ({
        action: row.action,
        count: row._count._all,
      })),
    };
  }
}
