import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ZohoInternalConnectorService } from '@company/zoho-connector';
import {
  AirtableMeasuresDTO,
  CourseSortDTO,
  Deal,
  QualificationPlan,
  QualificationPlanEntry,
  Quote,
} from '@company/zoho-types';
import { ZohoUtilityService } from '@company/zoho-utility-lib';
import {
  ClientPDF,
  SelfPaidQuoteDocumentPDF,
} from '@company/pdf-document-types';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { QualificationPlanValidateService } from '@company/qualification-plan-lib';
import { QuotesHelperService } from './quotes.helper.service';

@Injectable()
export class SelfPaidQuotesService {
  private readonly ENV = process.env['NODE_ENV'] || 'development';
  private readonly logger = new Logger(SelfPaidQuotesService.name);
  constructor(
    private readonly restService: ZohoInternalConnectorService,
    private readonly zohoUtility: ZohoUtilityService,
    private readonly httpService: HttpService,
    private readonly qpValidation: QualificationPlanValidateService,
    private readonly quotesHelperSerivce: QuotesHelperService
  ) {}

  /**
   * fetch all need data to create the ang or ptb quote pdf
   * @param quote
   */
  async getQuoteDataForSelfPaidPDF(quote: Quote) {
    const [angTemplate] = await this.zohoUtility.getAirtableDocumentTemplates([
      quote.quote_template_id!,
    ]);

    /* if (!ptbTemplate) {
      throw new HttpException('PTB template not found', HttpStatus.BAD_REQUEST);
    }*/

    this.logger.debug('ANG TEMPLATE found ' + angTemplate.template_id);

    //get qualification plant entries of quote
    const qpes = await this.quotesHelperSerivce.getQPEByQuote(quote, [
      'id',
      'kurse',
      'order',
      'companyCourseId',
      'teaching_units',
      'measure',
    ]);

    //get deal
    const deal = await this.restService.getById<Deal>({
      module: 'Deals',
      id: quote.Deal_Name!.id!,
    });

    //get cleint
    const client = await this.zohoUtility.getPDFContact(quote.Contact_Name?.id);

    const certificateEntryIds = quote.Quoted_Items!.map(
      (e) => e.certificate_id
    );

    this.logger.debug('certificateEntryIds: ', certificateEntryIds);

    const qpMeasureCourseIds: Record<string, string[]> = {};

    qpes.forEach((entry) => {
      const certificateId = entry.measure!.name!.split('_')[2];
      const qpHolder = qpMeasureCourseIds[certificateId];
      if (qpHolder) {
        qpHolder.push(entry.companyCourseId!);
      } else {
        qpMeasureCourseIds[certificateId] = [entry.companyCourseId!];
      }
    });

    this.logger.debug('first ids:', qpMeasureCourseIds);

    //get product data from airtable that is not stored at zoho
    const measures = await this.zohoUtility.getAirtableMeasureByCertificateId(
      certificateEntryIds,
      qpMeasureCourseIds
    );

    //set product title into quoted items to display on measure sheet list at ang pdf
    quote.Quoted_Items?.forEach((item) => {
      const measure = measures.find(
        (measure) => measure.certificate_id === item.certificate_id
      );
      if (measure) {
        item.product_title = measure.title;
      }
    });

    //update quote
    await this.restService.update<Quote>({ module: 'Quotes', data: [quote] });

    return {
      quote,
      deal,
      client,
      measures,
      qpes,
      angTemplate,
    };
  }

  async createQuoteANGPDFselfpaid(quote: Quote) {
    const quoteId = quote.id;
    const { deal, client, measures, angTemplate, qpes } =
      await this.getQuoteDataForSelfPaidPDF(quote);

    const errors = await this.qpValidation.validateForselfpaidAngCreation(
      deal,
      quote,
      measures,
      qpes
    );

    const errorCount = errors.length;

    if (errorCount > 0 || errors.length > 0) {
      this.logger.debug(errors.join('\n'));
      throw new HttpException(errors.join(' | '), HttpStatus.BAD_REQUEST);
    }

    const quotePDFData = await this.getselfpaidQuoteData(
      quote,
      deal,
      client,
      measures,
      qpes
    );

    const requestURL =
      process.env['MS_PDF_GENERATOR_URL'] + '/api/v1/pdf/generator';

    const hbsTemplate =
      this.ENV === 'development'
        ? angTemplate?.html_template_pre
        : angTemplate.html_template;

    //set document date
    quotePDFData.dateOfDocumentVersion = this.zohoUtility.toDEDate(
      angTemplate.html_template_last_modified_time
    );

    const pdf = this.httpService.post(
      requestURL,
      {
        documents: [
          {
            hbsTemplate: hbsTemplate,
            data: quotePDFData,
          },
        ],
      },
      {
        responseType: 'arraybuffer',
      }
    );

    const resp = await firstValueFrom(pdf);

    const quotePDF = Buffer.from(resp.data, 'binary');
    const fileName =
      deal.Abschluss_ID +
      '_ANG_' +
      quote.offerNumber +
      '_' +
      client.firstName +
      '_' +
      client.lastName;
    return this.zohoUtility.uploadToZoho(fileName, quotePDF, quoteId);
  }

  async getselfpaidQuoteData(
    quote: Quote,
    deal: Deal,
    client: ClientPDF,
    measures: AirtableMeasuresDTO[],
    qpes: QualificationPlanEntry[]
  ) {
    const durationInWeeks = quote.Quoted_Items?.map(
      (e) => e.Unterrichtseinheiten
    )?.reduce((acc, curr) => {
      return acc + curr;
    });

    if (!quote.Quoted_Items) {
      throw new HttpException(
        'Quote has no quoted items',
        HttpStatus.BAD_REQUEST
      );
    }

    if (!durationInWeeks) {
      throw new HttpException('Zeit in Wochen fehlen', HttpStatus.BAD_REQUEST);
    }

    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 30); // Set due date to 14 days from today
    const measureCourses = measures.map((measure) => measure.courses).flat();
    const missingRequiredCourses =
      this.quotesHelperSerivce.getMissingRequiredCourses(qpes, measureCourses);

    const teachingUnitsPerDay =
      ((quote.hours_per_week * 60) / 45 / 5 / 10) * 10;

    const learningPlan = await this.zohoUtility.getTopicPlanDataByQPEs(qpes);

    let paymentTerms = '';
    if (quote.payment_plan == 'Einmalzahlung')
      paymentTerms =
        'Zahlbar innerhalb von 14 Tagen bzw. bis spätestens zum Startzeitpunkt, sofern dieser in weniger als 14 Tagen nach Angebotsannahme erfolgt.';
    else if (
      quote.payment_plan &&
      quote.Grand_Total &&
      quote.startDate?.split('-').length == 3
    ) {
      const paymentCount = this.quotesHelperSerivce.ceilMonthsBetween(
        quote.startDate,
        quote.Enddatum!
      );
      paymentTerms = `Zahlbar in ${paymentCount} Monatsraten, á ${this.zohoUtility.toEUR(
        quote.Grand_Total / paymentCount
      )}, jeweils bis zum ${
        quote.startDate?.split('-')[2]
      }. Kalendertag des Monats.`;
    }
    const discount = quote.Discount
      ? this.zohoUtility.toEUR(quote.Discount)
      : undefined;

    const startDateBefore14days = this.startDateBefore14days(quote.startDate!)
      ? 'true'
      : undefined;

    const agencyQuotePDF: SelfPaidQuoteDocumentPDF = {
      StaticFileserver: process.env['PDF_ASSETS_URL']!,
      client: client,
      payer: {
        name: quote.Account_Name?.name,
      },
      quote: {
        missingRequiredCourses: missingRequiredCourses.join(', '),
        startDate: this.zohoUtility.toDEDate(quote.startDate!),
        endDate: this.zohoUtility.toDEDate(quote.Enddatum!),
        date: this.zohoUtility.toDEDate(today),
        dueDate: this.zohoUtility.toDEDate(dueDate),
        number: quote.offerNumber!,
        teachingUnitsPerDay: teachingUnitsPerDay,
        subTotal: this.zohoUtility.toEUR(quote.Sub_Total!),
        grandTotal: this.zohoUtility.toEUR(quote.Grand_Total!),
        tax: this.zohoUtility.toEUR(quote.Tax ?? 0),
        discountPercentage:
          quote.Sub_Total && quote.Discount
            ? Math.round((quote.Discount / quote.Sub_Total) * 100) + '%'
            : '',
        paymentTerms: paymentTerms,
        discount,
        startDateBefore14days,
      },
      learningPlan: learningPlan,
      otherLearningContent: this.zohoUtility.getOtherLearningContent(
        quote,
        deal
      ),
    };
    return agencyQuotePDF;
  }
  startDateBefore14days(startDateString: string): boolean {
    const startDate = new Date(startDateString);
    const today = new Date();
    const thresholdDate = new Date(today);
    thresholdDate.setDate(today.getDate() + 14);

    return startDate <= thresholdDate;
  }
}
