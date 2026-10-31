import { Test, TestingModule } from '@nestjs/testing';
import { AddtostockController } from './addtostock.controller';
import { AddtostockService } from './addtostock.service';

describe('AddtostockController', () => {
  let controller: AddtostockController;

  const mockAddtostockService = {
    create: jest
      .fn()
      .mockResolvedValue({ message: 'Stock-in created', itemsProcessed: 1 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AddtostockController],
      providers: [
        { provide: AddtostockService, useValue: mockAddtostockService },
      ],
    }).compile();

    controller = module.get<AddtostockController>(AddtostockController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service.create with the dto', async () => {
    const dto = { id: 1 };
    await controller.create(dto);
    expect(mockAddtostockService.create).toHaveBeenCalledWith(dto);
  });
});
