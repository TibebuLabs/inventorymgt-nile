import { Test, TestingModule } from '@nestjs/testing';
import { OutStockService } from './out-stock.service';
import { PrismaService } from 'prisma/prisma.service';
import { SrnService } from 'src/srn/srn.service';
import { StockOutService } from 'src/stock-out/stock-out.service';
import { StockBalanceService } from 'src/stock-balance/stock-balance.service';
import { ReferanceSccService } from 'src/reference-scc/reference-scc.service';
import { SccService } from 'src/scc/scc.service';

describe('OutStockService', () => {
  let service: OutStockService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OutStockService,
        { provide: PrismaService, useValue: {} },
        { provide: SrnService, useValue: { findOne: jest.fn() } },
        { provide: StockOutService, useValue: { create: jest.fn() } },
        {
          provide: StockBalanceService,
          useValue: {
            findbyLastStockBalance: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
          },
        },
        { provide: ReferanceSccService, useValue: { create: jest.fn() } },
        { provide: SccService, useValue: { findbyIyemName: jest.fn() } },
      ],
    }).compile();

    service = module.get<OutStockService>(OutStockService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
