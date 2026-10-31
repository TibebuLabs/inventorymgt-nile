import { Test, TestingModule } from '@nestjs/testing';
import { ItemtypeController } from './itemtype.controller';
import { ItemtypeService } from './itemtype.service';

describe('ItemtypeController', () => {
  let controller: ItemtypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemtypeController],
      providers: [ItemtypeService],
    }).compile();

    controller = module.get<ItemtypeController>(ItemtypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
