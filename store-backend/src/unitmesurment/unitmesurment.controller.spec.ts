import { Test, TestingModule } from '@nestjs/testing';
import { UnitMeasurementController } from './unitmesurment.controller';
import { UnitMeasurementService } from './unitmesurment.service';

describe('UnitMeasurementController', () => {
  let controller: UnitMeasurementController;

  const mockUnitMeasurementService = {
    findAll: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue({ id: 1, name: 'Piece' }),
    create: jest.fn().mockResolvedValue({ id: 1, name: 'Piece' }),
    update: jest.fn().mockResolvedValue({ id: 1, name: 'Piece' }),
    remove: jest.fn().mockResolvedValue({ id: 1, name: 'Piece' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UnitMeasurementController],
      providers: [
        { provide: UnitMeasurementService, useValue: mockUnitMeasurementService },
      ],
    }).compile();

    controller = module.get<UnitMeasurementController>(
      UnitMeasurementController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
