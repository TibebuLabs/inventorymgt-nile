import { Test, TestingModule } from '@nestjs/testing';
import { StoreIssueVoucherService } from './store-issue-voucher.service';

describe('StoreIssueVoucherService', () => {
  let service: StoreIssueVoucherService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StoreIssueVoucherService],
    }).compile();

    service = module.get<StoreIssueVoucherService>(StoreIssueVoucherService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
