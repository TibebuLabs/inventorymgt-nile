import { Test, TestingModule } from '@nestjs/testing';
import { SccController } from './scc.controller';

describe('SccController', () => {
  let controller: SccController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SccController],
    }).compile();

    controller = module.get<SccController>(SccController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
