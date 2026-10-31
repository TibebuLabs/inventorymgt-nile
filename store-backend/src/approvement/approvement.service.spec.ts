import { Test, TestingModule } from '@nestjs/testing';
import { ApprovementService } from './approvement.service';
import { PrismaService } from 'prisma/prisma.service';

describe('ApprovementService', () => {
  let service: ApprovementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApprovementService,
        {
          provide: PrismaService,
          useValue: {
            approvement: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();
    service = module.get<ApprovementService>(ApprovementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
