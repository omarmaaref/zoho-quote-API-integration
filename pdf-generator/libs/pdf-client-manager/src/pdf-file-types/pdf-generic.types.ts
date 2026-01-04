import {
  MeasureModulesListPDF,
  MeasureModuleZohoInput,
} from '../measure-module-list/mesure-module-list.types';

export type PdfTemplate = {
  id: string;
  template_id: string;
  html_template: string;
};

export type PDFConfig = {
  StaticFileserver: string;
  document: { date: string; location: string };
};

export type ClientPDF = {
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  plz: string;
  city: string;
  address: string;
  salutation: string;
};
export type FullPDFData<T> = PDFConfig & T;

//to update
export enum PdfType {
  MeasureModulesList = 'MeasureModulesList',
}

export interface PdfTemplateSpecifier {
  [PdfType.MeasureModulesList]: MeasureModulesListPDF;
}

export interface InputData {
  [PdfType.MeasureModulesList]: MeasureModuleZohoInput;
}

export type PDFData<T> = T;
