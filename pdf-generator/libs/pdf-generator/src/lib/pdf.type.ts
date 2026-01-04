/**
 * CreatePdf
 * represents an incoming request to create a single pdf
 * from an array of Handlebars documents and some options
 */
export type CreatePdf = {
  documents: HbsDocument[];
  options?: CreatePdfOptions;
};

/**
 * CreatePdfPage
 * represents a single Handlebars document to be converted to PDF
 */
export type HbsDocument = {
  hbsTemplate: string;
  data?: { [key: string]: any };
};

/**
 * CreatePdfOptions
 * represents the available options when creating a PDF
 */
export type CreatePdfOptions = {
  paginationStartPage?: number;
  paginationStartNumber?: number;
};
