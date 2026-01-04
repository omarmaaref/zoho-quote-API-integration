import {
  ClientPDF,
  MeasureSheetPDF,
  PDTopicPointsWithTU,
} from './pdf-document.types';
import { DocumentPDF } from './common-pdf.types';
import { Certificate } from 'crypto';

export interface CertificatePDFDTO {
  StaticFileserver: string;
  client: ClientPDF;
  document: DocumentPDF;
  certificate: CertificatePDF;
  courseContent: PDTopicPointsWithTU[];
}

export interface CertificatePDF {
  degreeDesignation: string;
  percentage: number;
  teachingUnits: number;
  certificateId: string;
}
