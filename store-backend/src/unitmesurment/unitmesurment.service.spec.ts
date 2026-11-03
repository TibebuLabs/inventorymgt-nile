import { Test, TestingModule } from '@nestjs/testing';
import { UnitMeasurementService } from './unitmesurment.service';
import { PrismaService } from 'prisma/prisma.service';

describe('UnitMeasurementService', () => {
  let service: UnitMeasurementService;

  const mockPrisma = {
    unitMeasurement: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnitMeasurementService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<UnitMeasurementService>(UnitMeasurementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
