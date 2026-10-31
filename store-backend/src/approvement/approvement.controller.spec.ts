import { Test, TestingModule } from '@nestjs/testing';
import { ApprovementController } from './approvement.controller';
import { ApprovementService } from './approvement.service';

describe('ApprovementController', () => {
  let controller: ApprovementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApprovementController],
      providers: [
        {
          provide: ApprovementService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();
    controller = module.get<ApprovementController>(ApprovementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
