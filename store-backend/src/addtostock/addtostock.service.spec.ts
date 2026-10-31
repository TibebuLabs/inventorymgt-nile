import { Test, TestingModule } from '@nestjs/testing';
import { AddtostockService } from './addtostock.service';
import { SccService } from 'src/scc/scc.service';
import { ReferanceSccService } from 'src/reference-scc/reference-scc.service';
import { GrnService } from 'src/good-reciving-note/good-reciving-note.service';
import { StockInService } from 'src/stock-in/stock-in.service';
import { StockBalanceService } from 'src/stock-balance/stock-balance.service';

describe('AddtostockService', () => {
  let service: AddtostockService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddtostockService,
        { provide: SccService, useValue: { findbyIyemName: jest.fn() } },
        { provide: ReferanceSccService, useValue: { create: jest.fn() } },
        { provide: GrnService, useValue: { findOne: jest.fn() } },
        { provide: StockInService, useValue: { create: jest.fn() } },
        {
          provide: StockBalanceService,
          useValue: {
            findbyLastStockBalance: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AddtostockService>(AddtostockService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
