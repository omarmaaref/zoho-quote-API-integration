import { AgencyQuoteMeasureSheetModulesPDF } from './quote-pdf.types';

export type ClientPDF = {
  email: string;
  firstName: string;
  lastName: string;
  salutation: string;
  street: string;
  city: string;
  zip: string;
};

export type AgencyQuoteProductPDF = {
  title?: string;
  degreeDesignation?: string;
  certificateId?: string;
  labourMarketRelevance?: string;
};

export type MeasureSheetPDF = {
  name?: string;
  number?: string;
  modules: AgencyQuoteMeasureSheetModulesPDF[];
};

export interface PDTopicPointsWithTU {
  startDate?: string;
  courseName: string;
  courseVersion?: string;
  courseContentWithTU: string[];
  courseContent: string[];
  teachingUnits?: number[];
}

export interface CompetenceLearningPlanItem {
  title: string;
  content: LearningPlanItem[];
}

export interface LearningPlanItem {
  title: string;
  introduction: string;
  topics: string[];
}

export type DealPDF = {
  createdDate: string;
  teachingUnitsPerDay: number;
  degreeDesignation: string;
  startDate: string;
  endDate: string;
  hoursPerWeek: number;
  learningMethod: string;
  teachingMethod: string;
  totalTeachingUnits: number;
  durationInWeeks: number;
  price: string;
  avgPricePerUnit: string;
  location: string;
  additionalAgreement?: string;
  offerId: string;
  voucherNumber?: string;
  isB2B: boolean;
};

export type SubsidizedContractPDF = {
  dateOfDocumentVersion?: string;
  StaticFileserver: string;
  deal: DealPDF;
  client: ClientPDF;
  measure: MeasureSheetPDF;
  courseContentWithTeachingUnits: PDTopicPointsWithTU[];
  product: AgencyQuoteProductPDF[];
  otherLearningContent?: PDTopicPointsWithTU[];
};
