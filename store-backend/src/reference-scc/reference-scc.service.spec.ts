import { Test, TestingModule } from '@nestjs/testing';
import { ReferanceSccService } from './reference-scc.service';

describe('ReferenceSccService', () => {
  let service: ReferanceSccService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReferanceSccService],
    }).compile();

    service = module.get<ReferanceSccService>(ReferanceSccService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
