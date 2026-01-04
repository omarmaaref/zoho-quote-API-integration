import { Test } from '@nestjs/testing';
import { PdfGeneratorService } from './pdf-generator.service';
import { PdfGeneratorController } from './pdf-generator.controller';
import { HttpModule } from '@nestjs/axios';
import { HandlebarsService } from './handlebars.service';

describe('PdfGeneratorService', () => {
  let service: PdfGeneratorService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [PdfGeneratorService, HandlebarsService],
    }).compile();

    service = module.get(PdfGeneratorService);
  });

  it('should be defined', () => {
    expect(service).toBeTruthy();
  });
});
