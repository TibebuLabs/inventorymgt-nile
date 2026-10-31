import { Test, TestingModule } from '@nestjs/testing';
import { SrnItemController } from './srn-item.controller';
import { SrnItemService } from './srn-item.service';

describe('SrnItemController', () => {
  let controller: SrnItemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SrnItemController],
      providers: [SrnItemService],
    }).compile();

    controller = module.get<SrnItemController>(SrnItemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
