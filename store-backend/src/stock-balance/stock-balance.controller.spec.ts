import { Test, TestingModule } from '@nestjs/testing';
import { StockBalanceController } from './stock-balance.controller';

describe('StockBalanceController', () => {
  let controller: StockBalanceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StockBalanceController],
    }).compile();

    controller = module.get<StockBalanceController>(StockBalanceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
