import { Test, TestingModule } from '@nestjs/testing';
import { StoreIssueVoucherItemService } from './store-issue-voucher-item.service';

describe('StoreIssueVoucherItemService', () => {
  let service: StoreIssueVoucherItemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StoreIssueVoucherItemService],
    }).compile();

    service = module.get<StoreIssueVoucherItemService>(
      StoreIssueVoucherItemService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
