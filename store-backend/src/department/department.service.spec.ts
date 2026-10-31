import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentService } from './department.service';
import { PrismaService } from 'prisma/prisma.service';

describe('DepartmentService', () => {
  let service: DepartmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepartmentService,
        {
          provide: PrismaService,
          useValue: {
            department: {
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
    service = module.get<DepartmentService>(DepartmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
