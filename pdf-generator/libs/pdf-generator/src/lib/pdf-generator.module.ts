import { Module } from '@nestjs/common';
import { PdfGeneratorController } from './pdf-generator.controller';
import { PdfGeneratorService } from './pdf-generator.service';
import { HttpModule } from '@nestjs/axios';
import { HandlebarsService } from './handlebars.service';
@Module({
  imports: [HttpModule],
  controllers: [PdfGeneratorController],
  providers: [PdfGeneratorService, HandlebarsService],
  exports: [PdfGeneratorService],
})
export class PdfGeneratorModule {}
