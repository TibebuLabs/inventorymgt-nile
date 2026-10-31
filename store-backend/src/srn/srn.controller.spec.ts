import { Test, TestingModule } from '@nestjs/testing';
import { SrnController } from './srn.controller';
import { SrnService } from './srn.service';

describe('SrnController', () => {
  let controller: SrnController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SrnController],
      providers: [SrnService],
    }).compile();

    controller = module.get<SrnController>(SrnController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
