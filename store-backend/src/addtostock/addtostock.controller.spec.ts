import { Test, TestingModule } from '@nestjs/testing';
import { AddtostockController } from './addtostock.controller';
import { AddtostockService } from './addtostock.service';

describe('AddtostockController', () => {
  let controller: AddtostockController;

  const actor = { id: 1, name: 'Test User', role: 'admin' };

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
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service.create with the dto and the requesting actor', async () => {
    const dto = { id: 1 } as any;
    const req = { user: actor } as any;

    await controller.create(dto, req);

    expect(mockAddtostockService.create).toHaveBeenCalledWith(dto, actor);
  });
});
