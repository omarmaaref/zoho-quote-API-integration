import { Quote } from '@company/zoho-types';
import { ClientPDF, PDFData } from './pdf-file-types/pdf-generic.types';
import { Context } from './measure-module-list/mesure-module-list.types';

export interface IGenericPDFgenerator {
  templateId: string;
  dataFetcher(quoteId: string): Promise<{ quote: Quote; client: ClientPDF }>;
  mapper(params: { quote: Quote; client: ClientPDF }): PDFData<any>;
  handleGeneration(pdfContent: Buffer, data: PDFData<any>): void;
}
