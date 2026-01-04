import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { AirtableLibService } from '@company/airtable-lib';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  FullPDFData,
  InputData,
  PDFData,
  PdfTemplate,
  PdfType,
} from './pdf-file-types/pdf-generic.types';
import { IGenericPDFgenerator } from './GenericPDFgenerator';
import { PDFServiceFactory } from './pdf-client-manager.module';

@Injectable()
export class PDFGenerationManager {
  private readonly logger = new Logger(PDFGenerationManager.name);

  constructor(
    @Inject('PDFServiceFactory')
    private readonly getPdfService: PDFServiceFactory,
    private readonly httpService: HttpService,
    private airtableService: AirtableLibService
  ) {}

  pdfGeneratorService: IGenericPDFgenerator;

  async generate<T extends PdfType>(type: T, specification: InputData[T]) {
    this.pdfGeneratorService = this.getPdfService(type);

    const data = await this.pdfGeneratorService.dataFetcher(
      specification.quoteId
    );

    const pdfDTO: PDFData<any> = this.pdfGeneratorService.mapper(data);

    //pdfConfig
    const pdfConfig = this.generateFullPDFContentFromDTO(pdfDTO);

    //get template
    const template: PdfTemplate = await this.getHtmlTemplate(type);

    //get file
    const pdfContent = await this.callPdfGenerationMS(template, pdfConfig);
    //upload file
    this.pdfGeneratorService.handleGeneration(pdfContent, pdfDTO);
  }

  generateFullPDFContentFromDTO(
    pdfDTO: PDFData<any>
  ): FullPDFData<PDFData<any>> {
    const staticFileserver = process.env['PDF_ASSETS_URL']!;

    return {
      StaticFileserver: staticFileserver,
      document: {
        date: new Date().toLocaleDateString('de-DE'),
        location: 'Hannover',
      },
      ...pdfDTO,
    };
  }
  async getHtmlTemplate(type: PdfType) {
    //fetch templates
    const templates = await this.airtableService.getAll<{
      id: string;
      template_id: string;
      html_template: string;
    }>({
      baseId: 'app1bs0cpGCuVoNcA',
      tableId: 'tbljiH4Z31ip8FH5B',
    });

    //this.logger.debug(templates);

    const angTemplate = templates.find(
      (template: { id: string; template_id: string; html_template: string }) =>
        template.template_id === this.pdfGeneratorService.templateId
    );
    console.log(
      'this.pdfGeneratorService.templateId',
      this.pdfGeneratorService.templateId
    );
    if (!angTemplate) {
      throw new HttpException('ANG template not found', HttpStatus.BAD_REQUEST);
    }
    return angTemplate;
  }

  async callPdfGenerationMS<T>(
    template: PdfTemplate,
    pdfConfig: FullPDFData<T>
  ) {
    const requestURL =
      process.env['MS_PDF_GENERATOR_URL'] + '/api/v1/pdf/generator';

    console.log('pdfConfig ', pdfConfig);
    const pdf = this.httpService.post(
      requestURL,
      {
        documents: [
          {
            hbsTemplate: template.html_template,
            data: pdfConfig,
          },
        ],
      },
      {
        responseType: 'arraybuffer',
      }
    );

    const resp = await firstValueFrom(pdf);

    const quotePDF = Buffer.from(resp.data, 'binary');
    return quotePDF;
  }
}
