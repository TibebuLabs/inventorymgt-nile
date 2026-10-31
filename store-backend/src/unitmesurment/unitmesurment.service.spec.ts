import { Test, TestingModule } from '@nestjs/testing';
import { UnitmesurmentService } from './unitmesurment.service';

describe('UnitmesurmentService', () => {
  let service: UnitmesurmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UnitmesurmentService],
    }).compile();

    service = module.get<UnitmesurmentService>(UnitmesurmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
