import { Test, TestingModule } from '@nestjs/testing';
import { GrnItemService } from './grnitem.service';

describe('GrnitemService', () => {
  let service: GrnItemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GrnItemService],
    }).compile();

    service = module.get<GrnItemService>(GrnItemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
