import { Test, TestingModule } from '@nestjs/testing';
import { StockInController } from './stock-in.controller';

describe('StockInController', () => {
  let controller: StockInController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StockInController],
    }).compile();

    controller = module.get<StockInController>(StockInController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
