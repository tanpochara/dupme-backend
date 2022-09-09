import { Test, TestingModule } from '@nestjs/testing';
import { DupmeGateway } from './dupme.gateway';
import { DupmeService } from './dupme.service';

describe('DupmeGateway', () => {
  let gateway: DupmeGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DupmeGateway, DupmeService],
    }).compile();

    gateway = module.get<DupmeGateway>(DupmeGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
