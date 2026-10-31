import { Test, TestingModule } from '@nestjs/testing';
import { StockOutController } from './stock-out.controller';

describe('StockOutController', () => {
  let controller: StockOutController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StockOutController],
    }).compile();

    controller = module.get<StockOutController>(StockOutController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
