import {
  ClientPDF,
  MeasureSheetPDF,
  PDTopicPointsWithTU,
} from './pdf-document.types';
import { DocumentPDF } from './common-pdf.types';

export interface AttendanceCertificatePDF {
  StaticFileserver: string;
  client: ClientPDF;
  document: DocumentPDF;
  deal: {
    startDate: string;
    endDate: string;
    teachingUnits: number;
  };
  measureSheet: MeasureSheetPDF;
  courseContent: PDTopicPointsWithTU[];
}
