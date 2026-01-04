import { Test } from '@nestjs/testing';
import { PdfGeneratorController } from './pdf-generator.controller';
import { PdfGeneratorService } from './pdf-generator.service';
import { HttpModule } from '@nestjs/axios';
import { HandlebarsService } from './handlebars.service';

describe('PdfGeneratorController', () => {
  let controller: PdfGeneratorController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [HttpModule],
      controllers: [PdfGeneratorController],
      providers: [PdfGeneratorService, HandlebarsService],
      exports: [PdfGeneratorService],
    }).compile();

    controller = module.get(PdfGeneratorController);
  });

  it('should be defined', () => {
    expect(controller).toBeTruthy();
  });
});
