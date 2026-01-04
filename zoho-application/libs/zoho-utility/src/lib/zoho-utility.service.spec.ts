import { Test, TestingModule } from '@nestjs/testing';
import { ZohoUtilityService } from './zoho-utility.service';

describe('ZohoUtilityService', () => {
  let service: ZohoUtilityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ZohoUtilityService],
    }).compile();

    service = module.get<ZohoUtilityService>(ZohoUtilityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
