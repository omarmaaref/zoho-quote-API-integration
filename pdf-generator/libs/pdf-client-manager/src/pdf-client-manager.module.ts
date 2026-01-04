import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ZohoInternalConnectorModule } from '@company/zoho-connector';
import { AirtableLibModule } from '@company/airtable-lib';
import { PdfType } from './pdf-file-types/pdf-generic.types';
import { IGenericPDFgenerator } from './GenericPDFgenerator';
import { MeasureModulesListSerivce } from './measure-module-list/measure-modules-list.service';
import { PDFGenerationManager } from './pdf-generation-manager.service';
export type PDFServiceFactory = (pdfType: PdfType) => IGenericPDFgenerator;

@Module({
  imports: [HttpModule, ZohoInternalConnectorModule, AirtableLibModule],
  providers: [
    PDFGenerationManager,
    MeasureModulesListSerivce,
    {
      provide: 'PDFServiceFactory',
      useFactory: (
        measureModulesListSerivce: MeasureModulesListSerivce
      ): PDFServiceFactory => {
        return (pdfType: PdfType) => {
          switch (pdfType) {
            case PdfType.MeasureModulesList:
              return measureModulesListSerivce;
            default:
              throw new Error(`No PDF generator found for type: ${pdfType}`);
          }
        };
      },
      inject: [MeasureModulesListSerivce],
    },
  ],
  exports: [PDFGenerationManager],
})
export class PdfClientManagerModule {}
