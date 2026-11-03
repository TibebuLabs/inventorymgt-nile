import { Test, TestingModule } from '@nestjs/testing';
import { ItemTypeController } from './itemtype.controller';
import { ItemTypeService } from './itemtype.service';

describe('ItemTypeController', () => {
  let controller: ItemTypeController;

  const mockItemTypeService = {
    findAll: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue({ id: 1, name: 'Paper' }),
    create: jest.fn().mockResolvedValue({ id: 1, name: 'Paper' }),
    update: jest.fn().mockResolvedValue({ id: 1, name: 'Paper' }),
    remove: jest.fn().mockResolvedValue({ id: 1, name: 'Paper' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemTypeController],
      providers: [
        { provide: ItemTypeService, useValue: mockItemTypeService },
      ],
    }).compile();

    controller = module.get<ItemTypeController>(ItemTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
