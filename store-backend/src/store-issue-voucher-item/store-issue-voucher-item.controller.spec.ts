import { Test, TestingModule } from '@nestjs/testing';
import { StoreIssueVoucherItemController } from './store-issue-voucher-item.controller';
import { StoreIssueVoucherItemService } from './store-issue-voucher-item.service';

describe('StoreIssueVoucherItemController', () => {
  let controller: StoreIssueVoucherItemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoreIssueVoucherItemController],
      providers: [StoreIssueVoucherItemService],
    }).compile();

    controller = module.get<StoreIssueVoucherItemController>(
      StoreIssueVoucherItemController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
