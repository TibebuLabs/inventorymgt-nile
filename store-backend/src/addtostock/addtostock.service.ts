import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateAddtostockDto } from './dto/create-addtostock.dto';
import { StockService } from 'src/stock/stock.service';
import { AuditService } from 'src/audit/audit.service';

interface Actor {
  id?: number;
  name?: string;
  role?: string;
}

/**
 * Legacy endpoint kept for backwards compatibility. Posting a GRN is now the
 * same operation as approving it — transactional and idempotent.
 */
@Injectable()
export class AddtostockService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stock: StockService,
    private readonly audit: AuditService,
  ) {}

  async create(dto: CreateAddtostockDto, actor?: Actor) {
    const grn = await this.prisma.grn.findUnique({
      where: { id: dto.id },
      include: { grn_items: true },
    });

    if (!grn) {
      throw new BadRequestException(`GRN #${dto.id} not found`);
    }
    if (grn.status === 'rejected') {
      throw new BadRequestException('A rejected GRN cannot be posted to stock');
    }

    const posted = await this.stock.postGrn(dto.id, actor?.id);

    await this.audit.log({
      employee_id: actor?.id ?? null,
      employee_name: actor?.name ?? null,
      role: actor?.role ?? null,
      action: 'GRN_POST',
      entity: 'grn',
      entity_id: String(dto.id),
      description: `Posted GRN #${dto.id} to stock`,
      metadata: { items: grn.grn_items.length },
    });

    return {
      message: 'Stock-in and stock balance updated successfully',
      itemsProcessed: grn.grn_items.length,
      grn: posted,
    };
  }
}
