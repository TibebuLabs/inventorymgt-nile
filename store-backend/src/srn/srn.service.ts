import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateSrnDto } from './dto/create-srn.dto';
import { UpdateSrnDto } from './dto/update-srn.dto';
import { NotificationsGateway } from 'src/notfications/notfications.gateway';
import { NotificationsService } from 'src/notfications/notfications.service';
import { AuditService } from 'src/audit/audit.service';

interface Actor {
  id?: number;
  name?: string;
  role?: string;
}

@Injectable()
export class SrnService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsGateway: NotificationsGateway,
    private readonly notificationsService: NotificationsService,
    private readonly audit: AuditService,
  ) {}

  async create(createSrnDto: CreateSrnDto, actor?: Actor) {
    const { srn_items, ...header } = createSrnDto;

    const srn = await this.prisma.$transaction(
      async (tx) => {
        const created = await tx.srn.create({
          data: {
            requisition_work_unit: header.requisition_work_unit,
            date: header.date,
            approvment_id: header.approvment_id ?? null,
            requested_by_id: actor?.id ?? header.requested_by_id ?? null,
            status: 'pending',
          },
        });

        if (srn_items?.length) {
          await tx.srnItem.createMany({
            data: srn_items.map((line, index) => ({
              srn_id: created.id,
              serial_num: line.serial_num ?? index + 1,
              description: line.description,
              unit_measurement_id: line.unit_measurement_id,
              quantity: line.quantity,
              remarks: line.remarks ?? '',
            })),
          });
        }

        return created;
      },
      { maxWait: 15000, timeout: 30000 },
    );

    try {
      // Notify the requesting employee's department head (if any) and the
      // store team that must fulfil the request.
      const requester = srn.requested_by_id
        ? await this.prisma.employee.findUnique({
            where: { id: srn.requested_by_id },
            select: { department_id: true, full_name: true },
          })
        : null;

      const department = requester
        ? await this.prisma.department.findUnique({
            where: { id: requester.department_id },
            select: { department_head_id: true },
          })
        : null;

      const storeTeam = await this.notificationsService.getEmployeeIdsByRoles([
        'store-keeper',
        'store-manager',
        'admin',
      ]);

      const recipients = [
        ...storeTeam,
        ...(department?.department_head_id
          ? [department.department_head_id]
          : []),
      ].filter((employeeId) => employeeId !== actor?.id);

      await this.notificationsGateway.sendNotificationToEmployees(
        recipients,
        `SRN #${srn.id} from ${header.requisition_work_unit} needs approval.`,
        undefined,
        srn.id,
        'srn',
        `/dashboard/requisition-review`,
      );

      await this.audit.log({
        employee_id: actor?.id ?? null,
        employee_name: actor?.name ?? null,
        role: actor?.role ?? null,
        action: 'SRN_CREATE',
        entity: 'srn',
        entity_id: String(srn.id),
        description: `Submitted requisition SRN #${srn.id} for ${header.requisition_work_unit}`,
        metadata: { items: srn_items?.length ?? 0 },
      });
    } catch (error) {
      console.error('SRN notification failed:', error);
    }

    return this.findOne(srn.id);
  }

  async findAll(actor?: Actor) {
    const where =
      actor?.role === 'employee' && actor?.id
        ? { requested_by_id: actor.id }
        : undefined;

    const rows = await this.prisma.srn.findMany({
      where,
      include: {
        approvement: true,
        total: true,
        srn_items: { include: { item: true, unit_measurement: true } },
        _count: { select: { srn_items: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return this.attachRequesters(rows);
  }

  async findOne(id: number) {
    const srn = await this.prisma.srn.findUnique({
      where: { id },
      include: {
        approvement: true,
        srn_items: { include: { item: true, unit_measurement: true } },
        total: true,
      },
    });
    if (!srn) throw new NotFoundException(`SRN with ID ${id} not found`);

    const [withRequester] = await this.attachRequesters([srn]);
    return withRequester;
  }

  async approve(id: number, actor?: Actor) {
    const srn = await this.prisma.srn.findUnique({ where: { id } });
    if (!srn) throw new NotFoundException(`SRN #${id} not found`);
    if (srn.status === 'rejected') {
      throw new ConflictException('A rejected requisition cannot be approved.');
    }
    if (srn.status === 'fulfilled') {
      // Re-approving a fulfilled requisition would reset it to "approved"
      // and let the same stock be issued a second time.
      throw new ConflictException(
        'A fulfilled requisition cannot be re-approved. Cancel the original voucher first.',
      );
    }

    let approvementId = srn.approvment_id;
    if (approvementId) {
      await this.prisma.approvement.update({
        where: { id: approvementId },
        data: { checked_by_id: actor?.id ?? null },
      });
    } else {
      const approvement = await this.prisma.approvement.create({
        data: {
          prepared_by_id: srn.requested_by_id ?? null,
          checked_by_id: actor?.id ?? null,
        },
      });
      approvementId = approvement.id;
    }

    const updated = await this.prisma.srn.update({
      where: { id },
      data: {
        status: 'approved',
        approvment_id: approvementId,
        approved_by_id: actor?.id ?? null,
        approved_at: new Date(),
        rejection_reason: null,
      },
    });

    try {
      const storeTeam = await this.notificationsService.getEmployeeIdsByRoles([
        'store-keeper',
        'store-manager',
      ]);

      await this.notificationsGateway.sendNotificationToEmployees(
        [
          ...storeTeam,
          ...(srn.requested_by_id ? [srn.requested_by_id] : []),
        ].filter((employeeId) => employeeId !== actor?.id),
        `SRN #${id} was approved and is ready to be issued.`,
        undefined,
        id,
        'srn',
        '/dashboard/StoreIssueVoucherInput',
      );

      await this.audit.log({
        employee_id: actor?.id ?? null,
        employee_name: actor?.name ?? null,
        role: actor?.role ?? null,
        action: 'SRN_APPROVE',
        entity: 'srn',
        entity_id: String(id),
        description: `Approved requisition SRN #${id}`,
      });
    } catch (error) {
      console.error('SRN approval hooks failed:', error);
    }

    return updated;
  }

  async reject(id: number, reason: string, actor?: Actor) {
    if (!reason?.trim()) {
      throw new BadRequestException('A rejection reason is required.');
    }

    const srn = await this.prisma.srn.findUnique({ where: { id } });
    if (!srn) throw new NotFoundException(`SRN #${id} not found`);
    if (srn.status === 'fulfilled') {
      throw new ConflictException('An issued requisition cannot be rejected.');
    }

    const rejected = await this.prisma.srn.update({
      where: { id },
      data: {
        status: 'rejected',
        rejection_reason: reason.trim(),
        approved_by_id: actor?.id ?? null,
        approved_at: new Date(),
      },
    });

    try {
      await this.notificationsGateway.sendNotificationToEmployees(
        srn.requested_by_id ? [srn.requested_by_id] : [],
        `SRN #${id} was rejected: ${reason.trim()}`,
        undefined,
        id,
        'srn',
        '/dashboard/StatusPage',
      );

      await this.audit.log({
        employee_id: actor?.id ?? null,
        employee_name: actor?.name ?? null,
        role: actor?.role ?? null,
        action: 'SRN_REJECT',
        entity: 'srn',
        entity_id: String(id),
        description: `Rejected requisition SRN #${id}: ${reason.trim()}`,
        metadata: { reason: reason.trim() },
      });
    } catch (error) {
      console.error('SRN rejection hooks failed:', error);
    }

    return rejected;
  }

  async update(id: number, updateSrnDto: UpdateSrnDto) {
    await this.findOne(id);
    return this.prisma.srn.update({
      where: { id },
      data: {
        requisition_work_unit: updateSrnDto.requisition_work_unit,
        date: updateSrnDto.date,
      },
    });
  }

  async remove(id: number) {
    const srn = await this.findOne(id);
    if (srn.status === 'fulfilled') {
      throw new ConflictException(
        'An issued requisition cannot be deleted (stock has already moved).',
      );
    }
    return this.prisma.srn.delete({ where: { id } });
  }

  private async attachRequesters<
    T extends { requested_by_id?: number | null; approved_by_id?: number | null },
  >(rows: T[]) {
    const ids = [
      ...new Set(
        rows
          .flatMap((row) => [row.requested_by_id, row.approved_by_id])
          .filter((id): id is number => typeof id === 'number'),
      ),
    ];

    if (ids.length === 0) {
      return rows.map((row) => ({ ...row, requested_by: null, approved_by: null }));
    }

    const employees = await this.prisma.employee.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        full_name: true,
        email: true,
        department: { select: { department_name: true } },
      },
    });
    const byId = new Map(employees.map((employee) => [employee.id, employee]));

    return rows.map((row) => ({
      ...row,
      requested_by: row.requested_by_id
        ? byId.get(row.requested_by_id) ?? null
        : null,
      approved_by: row.approved_by_id
        ? byId.get(row.approved_by_id) ?? null
        : null,
    }));
  }
}
