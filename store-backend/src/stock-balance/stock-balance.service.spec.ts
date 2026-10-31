import { Test, TestingModule } from '@nestjs/testing';
import { StockBalanceService } from './stock-balance.service';

describe('StockBalanceService', () => {
  let service: StockBalanceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StockBalanceService],
    }).compile();

    service = module.get<StockBalanceService>(StockBalanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
