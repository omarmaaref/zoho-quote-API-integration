import { ClientPDF, PDFData } from '../pdf-file-types/pdf-generic.types';
import { Quote } from '@company/zoho-types';

export type MeasureModuleZohoInput = { quoteId: string };

export type Module = {
  number?: number | null;
  title: string;
  teachingUnits: number;
  teachingDays: number;
  price: string;
};

export type ModulesListDTO = {
  number?: string;
  modules: Module[];
};
export type Context<T> = T;

export type MeasureModulesListPDF = PDFData<{
  client: ClientPDF;
  quote: Quote;
  modulesList: ModulesListDTO;
}>;
