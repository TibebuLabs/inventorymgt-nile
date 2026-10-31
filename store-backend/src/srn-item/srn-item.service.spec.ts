import { Test, TestingModule } from '@nestjs/testing';
import { SrnItemService } from './srn-item.service';

describe('SrnItemService', () => {
  let service: SrnItemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SrnItemService],
    }).compile();

    service = module.get<SrnItemService>(SrnItemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
