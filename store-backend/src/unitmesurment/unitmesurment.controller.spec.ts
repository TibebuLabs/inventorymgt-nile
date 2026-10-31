import { Test, TestingModule } from '@nestjs/testing';
import { UnitmesurmentController } from './unitmesurment.controller';
import { UnitmesurmentService } from './unitmesurment.service';

describe('UnitmesurmentController', () => {
  let controller: UnitmesurmentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UnitmesurmentController],
      providers: [UnitmesurmentService],
    }).compile();

    controller = module.get<UnitmesurmentController>(UnitmesurmentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
