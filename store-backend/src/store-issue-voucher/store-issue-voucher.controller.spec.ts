import { Test, TestingModule } from '@nestjs/testing';
import { StoreIssueVoucherController } from './store-issue-voucher.controller';
import { StoreIssueVoucherService } from './store-issue-voucher.service';

describe('StoreIssueVoucherController', () => {
  let controller: StoreIssueVoucherController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoreIssueVoucherController],
      providers: [StoreIssueVoucherService],
    }).compile();

    controller = module.get<StoreIssueVoucherController>(
      StoreIssueVoucherController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
