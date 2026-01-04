import { Module } from '@nestjs/common';
import { PdfGeneratorModule } from '@company/pdf-generator-lib';

@Module({
  imports: [PdfGeneratorModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
