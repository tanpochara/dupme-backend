import { Test, TestingModule } from '@nestjs/testing';
import { DupmeService } from './dupme.service';

describe('DupmeService', () => {
  let service: DupmeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DupmeService],
    }).compile();

    service = module.get<DupmeService>(DupmeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
