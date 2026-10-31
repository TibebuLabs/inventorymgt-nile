import { Test, TestingModule } from '@nestjs/testing';
import { OutStockController } from './out-stock.controller';
import { OutStockService } from './out-stock.service';

describe('OutStockController', () => {
  let controller: OutStockController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OutStockController],
      providers: [
        { provide: OutStockService, useValue: { create: jest.fn() } },
      ],
    }).compile();

    controller = module.get<OutStockController>(OutStockController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
