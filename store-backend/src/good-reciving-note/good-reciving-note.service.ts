import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateGrnDto } from './dto/create-good-reciving-note.dto';
import { UpdateGrnDto } from './dto/update-good-reciving-note.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { NotificationsGateway } from 'src/notfications/notfications.gateway';
import { NotificationsService } from 'src/notfications/notfications.service';
import { StockService } from 'src/stock/stock.service';
import { AuditService } from 'src/audit/audit.service';

interface Actor {
  id?: number;
  name?: string;
  role?: string;
}

/**
 * Supplier names in the real world contain &, ., -, commas and digits —
 * the previous alphabetic-only check rejected legitimate vendors.
 */
const VALID_NAME = /^[\p{L}\p{N}\s&.,'’()\-/]+$/u;

@Injectable()
export class GrnService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsGateway: NotificationsGateway,
    private readonly notificationsService: NotificationsService,
    private readonly stock: StockService,
    private readonly audit: AuditService,
  ) {}

  async create(createGrnDto: CreateGrnDto, actor?: Actor) {
    const { grn_items, ...grnData } = createGrnDto;

    if (!grn_items || grn_items.length === 0) {
      throw new BadRequestException('GRN must contain at least one item.');
    }

    // Resolve the vendor (registered master data) or fall back to free text.
    let supplier = grnData.supplier?.trim() ?? '';
    if (grnData.vendor_id) {
      const vendor = await this.prisma.vendor.findUnique({
        where: { id: grnData.vendor_id },
      });
      if (!vendor) {
        throw new NotFoundException(
          `Vendor #${grnData.vendor_id} is not registered`,
        );
      }
      supplier = vendor.name;
    }

    if (!supplier) {
      throw new BadRequestException(
        'Select a registered vendor or enter a supplier name.',
      );
    }
    if (!VALID_NAME.test(supplier)) {
      throw new BadRequestException(
        'Supplier name contains unsupported characters.',
      );
    }
    if (
      !Number.isInteger(grnData.purchase_req_num) ||
      !Number.isInteger(grnData.purchase_order_num)
    ) {
      throw new BadRequestException(
        'Purchase requisition and order numbers must be integers.',
      );
    }

    for (const item of grn_items) {
      if (!Number.isInteger(item.unit_measurement_id)) {
        throw new BadRequestException(
          'Unit measurement ID must be an integer.',
        );
      }
      if (typeof item.qua_delivered !== 'number' || item.qua_delivered <= 0) {
        throw new BadRequestException(
          'Quantity delivered must be a positive number.',
        );
      }
      if (typeof item.unit_price !== 'number' || item.unit_price <= 0) {
        throw new BadRequestException('Unit price must be a positive number.');
      }
    }

    try {
      const preparedBy = actor?.id ?? grnData.prepared_by_id;

      const grn = await this.prisma.$transaction(
        async (prisma) => {
          const total = grn_items.reduce(
            (sum, item) => sum + item.qua_delivered * item.unit_price,
            0,
          );

          const totalData = await prisma.total.create({
            data: { total_price: total },
          });

          const approvement = await prisma.approvement.create({
            data: { prepared_by_id: preparedBy },
          });

          const createdGrn = await prisma.grn.create({
            data: {
              date: grnData.date,
              supplier,
              suppliers_inv_other_no: grnData.suppliers_inv_other_no,
              store_location: grnData.store_location,
              purchase_req_num: grnData.purchase_req_num,
              purchase_order_num: grnData.purchase_order_num,
              approvment_id: approvement.id,
              total_id: totalData.id,
              vendor_id: grnData.vendor_id ?? null,
              created_by_id: preparedBy ?? null,
              status: 'pending',
            },
          });

          await Promise.all(
            grn_items.map(async (grnItem, index) => {
              await prisma.grnItem.create({
                data: {
                  grn_id: createdGrn.id,
                  ser_no: index + 1,
                  description: grnItem.description,
                  unit_measurement_id: grnItem.unit_measurement_id,
                  qua_ordered: grnItem.qua_ordered ?? 0,
                  qua_delivered: grnItem.qua_delivered,
                  quantity_received:
                    grnItem.quantity_received ?? grnItem.qua_delivered,
                  unit_price: grnItem.unit_price,
                  total_item_price: grnItem.qua_delivered * grnItem.unit_price,
                  remark: grnItem.remark ?? '',
                },
              });
            }),
          );

          return createdGrn;
        },
        // Hosted database (Supabase) needs generous timeouts.
        { maxWait: 15000, timeout: 30000 },
      );

      // Notifications/audit run after commit so they can never roll back the GRN.
      try {
        const recipients =
          await this.notificationsService.getEmployeeIdsByRoles([
            'admin',
            'store-manager',
          ]);

        await this.notificationsGateway.sendNotificationToEmployees(
          recipients.filter((id) => id !== actor?.id),
          `GRN #${grn.id} from ${supplier} is awaiting approval.`,
          grn.id,
          undefined,
          'grn',
          `/dashboard/grn-details/${grn.id}`,
        );

        await this.audit.log({
          employee_id: actor?.id ?? null,
          employee_name: actor?.name ?? null,
          role: actor?.role ?? null,
          action: 'GRN_CREATE',
          entity: 'grn',
          entity_id: String(grn.id),
          description: `Created GRN #${grn.id} from ${supplier}`,
          metadata: {
            supplier,
            items: grn_items.length,
            total: grn_items.reduce(
              (sum, item) => sum + item.qua_delivered * item.unit_price,
              0,
            ),
          },
        });
      } catch (notificationError) {
        console.error('GRN post-create hooks failed:', notificationError);
      }

      return grn;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2002':
            throw new ConflictException(
              'Unique constraint violation: ' + error.meta?.target,
            );
          case 'P2003':
            throw new BadRequestException(
              'Foreign key constraint failed: ' + error.meta?.field_name,
            );
          case 'P2025':
            throw new NotFoundException(
              'Related record not found: ' + error.meta?.cause,
            );
          default:
            throw new InternalServerErrorException(
              `Database error: ${error.message}`,
            );
        }
      } else if (
        error instanceof BadRequestException ||
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      console.error('Unexpected error in GRN creation:', error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while creating the GRN',
      );
    }
  }

  /**
   * Approve a GRN: posts the received quantities into stock (idempotent) and
   * notifies the store keeper who created it.
   */
  async approve(id: number, actor?: Actor) {
    const grn = await this.prisma.grn.findUnique({
      where: { id },
      include: { total: true, vendor: true },
    });
    if (!grn) throw new NotFoundException(`GRN #${id} not found`);

    if (grn.status === 'rejected') {
      throw new ConflictException('A rejected GRN cannot be approved.');
    }

    const posted = await this.stock.postGrn(id, actor?.id);

    if (grn.approvment_id) {
      await this.prisma.approvement.update({
        where: { id: grn.approvment_id },
        data: { checked_by_id: actor?.id ?? null },
      });
    }

    try {
      const recipients = await this.notificationsService.getEmployeeIdsByRoles([
        'store-keeper',
      ]);
      const targets = [
        ...recipients,
        ...(grn.created_by_id ? [grn.created_by_id] : []),
      ].filter((employeeId) => employeeId !== actor?.id);

      await this.notificationsGateway.sendNotificationToEmployees(
        targets,
        `GRN #${id} from ${grn.supplier} was approved and posted to stock.`,
        id,
        undefined,
        'grn',
        `/dashboard/grn-details/${id}`,
      );

      await this.audit.log({
        employee_id: actor?.id ?? null,
        employee_name: actor?.name ?? null,
        role: actor?.role ?? null,
        action: 'GRN_APPROVE',
        entity: 'grn',
        entity_id: String(id),
        description: `Approved GRN #${id} and posted stock`,
        metadata: { supplier: grn.supplier, total: grn.total?.total_price ?? 0 },
      });
    } catch (error) {
      console.error('GRN approval hooks failed:', error);
    }

    return posted;
  }

  async reject(id: number, reason: string, actor?: Actor) {
    if (!reason?.trim()) {
      throw new BadRequestException('A rejection reason is required.');
    }

    const grn = await this.prisma.grn.findUnique({ where: { id } });
    if (!grn) throw new NotFoundException(`GRN #${id} not found`);
    if (grn.posted_at) {
      throw new ConflictException(
        'This GRN is already posted to stock and cannot be rejected.',
      );
    }

    const rejected = await this.prisma.grn.update({
      where: { id },
      data: {
        status: 'rejected',
        rejection_reason: reason.trim(),
        approved_by_id: actor?.id ?? null,
        approved_at: new Date(),
      },
    });

    try {
      const recipients = await this.notificationsService.getEmployeeIdsByRoles([
        'store-keeper',
      ]);
      const targets = [
        ...recipients,
        ...(grn.created_by_id ? [grn.created_by_id] : []),
      ].filter((employeeId) => employeeId !== actor?.id);

      await this.notificationsGateway.sendNotificationToEmployees(
        targets,
        `GRN #${id} was rejected: ${reason.trim()}`,
        id,
        undefined,
        'grn',
        `/dashboard/grn-details/${id}`,
      );

      await this.audit.log({
        employee_id: actor?.id ?? null,
        employee_name: actor?.name ?? null,
        role: actor?.role ?? null,
        action: 'GRN_REJECT',
        entity: 'grn',
        entity_id: String(id),
        description: `Rejected GRN #${id}: ${reason.trim()}`,
        metadata: { reason: reason.trim() },
      });
    } catch (error) {
      console.error('GRN rejection hooks failed:', error);
    }

    return rejected;
  }

  async findAll() {
    const grns = await this.prisma.grn.findMany({
      include: {
        grn_items: { include: { item: true, unit_measurement: true } },
        approvement: true,
        total: true,
        vendor: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return this.attachActorNames(grns);
  }

  async findOne(id: number) {
    if (!Number.isInteger(id)) {
      throw new BadRequestException('ID must be an integer.');
    }

    const grn = await this.prisma.grn.findUnique({
      where: { id },
      include: {
        grn_items: { include: { item: true, unit_measurement: true } },
        notifications: true,
        approvement: true,
        total: true,
        vendor: true,
      },
    });

    if (!grn) {
      throw new NotFoundException(`GRN with ID ${id} not found.`);
    }

    const [withNames] = await this.attachActorNames([grn]);
    return withNames;
  }

  async update(id: number, updateGrnDto: UpdateGrnDto) {
    if (!Number.isInteger(id)) {
      throw new BadRequestException('ID must be an integer.');
    }

    try {
      return await this.prisma.grn.update({
        where: { id },
        data: {
          date: updateGrnDto.date,
          supplier: updateGrnDto.supplier,
          suppliers_inv_other_no: updateGrnDto.suppliers_inv_other_no,
          store_location: updateGrnDto.store_location,
          purchase_req_num: updateGrnDto.purchase_req_num,
          purchase_order_num: updateGrnDto.purchase_order_num,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new NotFoundException(
          `Unable to update. GRN with ID ${id} not found.`,
        );
      }
      throw new BadRequestException('Invalid data provided for update.');
    }
  }

  /** Resolve creator / approver names for list and detail views. */
  private async attachActorNames<T extends { created_by_id?: number | null; approved_by_id?: number | null }>(
    rows: T[],
  ) {
    const ids = [
      ...new Set(
        rows
          .flatMap((row) => [row.created_by_id, row.approved_by_id])
          .filter((id): id is number => typeof id === 'number'),
      ),
    ];

    if (ids.length === 0) {
      return rows.map((row) => ({
        ...row,
        created_by: null,
        approved_by: null,
      }));
    }

    const employees = await this.prisma.employee.findMany({
      where: { id: { in: ids } },
      select: { id: true, full_name: true, email: true },
    });
    const employeeById = new Map(employees.map((employee) => [employee.id, employee]));

    return rows.map((row) => ({
      ...row,
      created_by: row.created_by_id
        ? employeeById.get(row.created_by_id) ?? null
        : null,
      approved_by: row.approved_by_id
        ? employeeById.get(row.approved_by_id) ?? null
        : null,
    }));
  }
}
