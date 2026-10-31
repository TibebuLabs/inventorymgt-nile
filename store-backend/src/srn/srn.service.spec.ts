import { Test, TestingModule } from '@nestjs/testing';
import { SrnService } from './srn.service';

describe('SrnService', () => {
  let service: SrnService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SrnService],
    }).compile();

    service = module.get<SrnService>(SrnService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
