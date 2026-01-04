import {
  MeasureSheetPDF,
  AgencyQuoteProductPDF,
  ClientPDF,
  CompetenceLearningPlanItem,
  PDTopicPointsWithTU,
} from './pdf-document.types';

export type AgencyQuoteMeasureSheetModulesPDF = {
  number?: number | null;
  title: string;
  teachingUnits: number;
  teachingDays: number;
  price: string;
};
export type AgencyQuotePayerPDF = {
  name?: string;
};
export type AgencyQuoteQuotePDF = {
  additionalAgreement?: string;
  missingRequiredCourses: string;
  startDate: string;
  endDate: string;
  durationInWeeks: number;
  durationInMonths: number;
  learningMethod: string;
  totalPrice: string;
  totalPricePerUnit: string;
  date: string;
  number: string;
  dueDate: string;
  teachingMethod: string;
  teachingUnitsPerDay: number;
  totalTeachingUnits: number;
  justification: string[];
  isB2B: boolean;
};
export type AgencyQuotePDF = {
  dateOfDocumentVersion?: string;
  StaticFileserver: string;
  client: ClientPDF;
  product: AgencyQuoteProductPDF;
  measureSheet: MeasureSheetPDF;
  payer: AgencyQuotePayerPDF;
  quote: AgencyQuoteQuotePDF;
  learningPlan: PDTopicPointsWithTU[];
  competenceLearningPlan: CompetenceLearningPlanItem[];
  otherLearningContent?: PDTopicPointsWithTU[];
};

export type SelfPaidQuoteDocumentPDF = {
  dateOfDocumentVersion?: string;
  StaticFileserver: string;
  client: ClientPDF;
  payer: AgencyQuotePayerPDF;
  quote: SelfPaidQuotePDF;
  learningPlan: PDTopicPointsWithTU[];
  otherLearningContent?: PDTopicPointsWithTU[];
};

export type SelfPaidQuotePDF = {
  additionalAgreement?: string;
  missingRequiredCourses: string;
  startDate: string;
  endDate: string;
  date: string;
  number: string;
  dueDate: string;
  teachingUnitsPerDay: number;
  subTotal: string;
  grandTotal: string;
  tax: string;
  discount?: string;
  startDateBefore14days?: string;
  discountPercentage: string;
  paymentTerms: string;
  paymentBreak?: string;
};

export const additionalBenefitsItems: string[] = [
  'Job- und Praktikumsvermittlung',
  '24/7 Zugriff auf unsere Lernplattform',
  'Live-Educational-Support an allen Werktagen zwischen 9:00 Uhr und 16:30 Uhr',
  'Kostenfreie Soft- und Hardwareausstattung',
];

export const selfEmpowermentDocumentContent = {
  courseName: 'Self-Empowerment',
  courseContentWithTU: [
    'Seelische Widerstandsfähigkeit und Anpassungskompetenz',
    'Resilienzfaktoren im Detail',
    'Die 4 Phasen des Lernens - Wissensaneignung und persönliche Entwicklung',
    'Meine persönlichen Werte und Ziele',
    'Persönliche Zielplanung',
    'Lern- und Berufsalltag strukturieren',
    'Pareto Prinzip und Eisenhower Matrix',
    '“Getting Things Done” GTD',
    'ALPEN Methode, Pomodoro Technik, ABC-Methode',
    'Gesundheit und Entspannungstechniken',
    'Stressmanagement',
  ],
  courseContent: [
    'Seelische Widerstandsfähigkeit und Anpassungskompetenz',
    'Resilienzfaktoren im Detail',
    'Die 4 Phasen des Lernens - Wissensaneignung und persönliche Entwicklung',
    'Meine persönlichen Werte und Ziele',
    'Persönliche Zielplanung',
    'Lern- und Berufsalltag strukturieren',
    'Pareto Prinzip und Eisenhower Matrix',
    '“Getting Things Done” GTD',
    'ALPEN Methode, Pomodoro Technik, ABC-Methode',
    'Gesundheit und Entspannungstechniken',
    'Stressmanagement',
  ],
};

export const applicantTrainingDocumentContent = {
  courseName: 'Bewerbercoaching',
  courseContentWithTU: [
    'Smarte, sinnvolle und erfolgreiche Stellensuche',
    'Digitale Stellensuche',
    'Anschreiben in Bestform',
    'Lebenslauf, Unterlagen etc. In Bestform',
    'Vorbereitung auf Bewerbungsgespräche',
    'Bewerbungsgespräche erfolgreich führen',
    'Zusage, Absage, Entscheidung',
    'Strukturierung der Bewerbungsaktivitäten',
    'Absagen in neue Energie umwandeln',
    'Erfolgreicher Start ins Unternehmen',
  ],
  courseContent: [
    'Smarte, sinnvolle und erfolgreiche Stellensuche',
    'Digitale Stellensuche',
    'Anschreiben in Bestform',
    'Lebenslauf, Unterlagen etc. In Bestform',
    'Vorbereitung auf Bewerbungsgespräche',
    'Bewerbungsgespräche erfolgreich führen',
    'Zusage, Absage, Entscheidung',
    'Strukturierung der Bewerbungsaktivitäten',
    'Absagen in neue Energie umwandeln',
    'Erfolgreicher Start ins Unternehmen',
  ],
};
