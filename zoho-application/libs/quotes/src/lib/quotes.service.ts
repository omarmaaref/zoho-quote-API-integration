import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ZohoInternalConnectorService } from '@company/zoho-connector';
import {
  ActionSheet,
  AirtableDegreeDesignationDTO,
  AirtableMeasuresDTO,
  CourseSortDTO,
  Deal,
  DegreeDesignation,
  MeasureSheetEntry,
  QualificationPlan,
  QualificationPlanEntry,
  Quote,
  QuoteMeasureSheetDTO,
} from '@company/zoho-types';
import { ZohoUtilityService } from '@company/zoho-utility-lib';
import { plainToInstance } from 'class-transformer';
import {
  AgencyQuoteMeasureSheetModulesPDF,
  MeasureSheetPDF,
  AgencyQuotePDF,
  ClientPDF,
  CompetenceLearningPlanItem,
  SelfPaidQuoteDocumentPDF,
} from '@company/pdf-document-types';
import { OpenAIService } from '@company/openai-lib';
import { OpenAI } from 'openai';
import { AirtableLibService } from '@company/airtable-lib';
import { learningPlantPrompt, personalRelevantPrompt } from './quote.prompts';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { QualificationPlanValidateService } from '@company/qualification-plan-lib';
import { QuotesHelperService } from './quotes.helper.service';
import { SelfPaidQuotesService } from './quotes.selfpaid.service';

@Injectable()
export class QuotesService {
  private readonly ENV = process.env['NODE_ENV'] || 'development';
  private readonly logger = new Logger(QuotesService.name);
  private readonly client: OpenAI;
  constructor(
    private readonly restService: ZohoInternalConnectorService,
    private readonly zohoUtility: ZohoUtilityService,
    private readonly openAIService: OpenAIService,
    private readonly airtableService: AirtableLibService,
    private readonly httpService: HttpService,
    private readonly qpValidation: QualificationPlanValidateService,
    private readonly quotesHelperService: QuotesHelperService,
    private readonly selfPaidQuotesService: SelfPaidQuotesService
  ) {
    this.client = this.openAIService.openAI;
  }

  async processQuoteForPDFCreation(quoteId: string) {
    const { quote, certificateEntries } = await this.getPrePDFQuoteData(
      quoteId
    );

    const qps = await this.restService.related<Quote, QualificationPlan>({
      module: 'Quotes',
      id: quote.id,
      relatedModule: 'Qualifizierungsplan',
      params: {
        fields: ['id'],
      },
    });

    if (!qps || qps.length === 0) {
      throw new HttpException('Quote has no Qualification Plan', 400);
    }

    await this.setMeasureSheetOnQuote(
      certificateEntries,
      quote.Learning_Method === 'online',
      quote.educationTimeKind!,
      quote
    );
  }

  async getLearningPlanByQuote(qpes: QualificationPlanEntry[], degree: string) {
    /*const mainCourse =
      shellProduct?.main_course_name +
      '(' +
      shellProduct?.main_course_teaching_units +
      ' UE)';*/
    const secondaryCourses = qpes
      //.filter((qpe) => qpe.kurse?.name !== shellProduct?.main_course_name)
      .map((qpe) => qpe.kurse?.name + ' (' + qpe.teaching_units + ' UE)');

    this.logger.debug(
      learningPlantPrompt(degree, 'mainCourse', secondaryCourses)
    );
    const learningPlan = await this.openAIService.getAssistantResponse(
      'asst_XHD6au7GitoBjevtk4Z4wwIn',
      learningPlantPrompt(degree, 'mainCourse', secondaryCourses),
      {
        type: 'json_schema',
        json_schema: {
          name: 'json_schema_object',
          schema: {
            type: 'object',
            properties: {
              items: {
                type: 'array',
                description:
                  'Array of objects, each containing a title and content.',
                items: {
                  type: 'object',
                  properties: {
                    title: {
                      type: 'string',
                      description:
                        'Kurze, prägnante Überschrift für die Handlungskompetenz',
                    },
                    introduction: {
                      type: 'string',
                      description:
                        '5-7 kurze, prägnante Sätze\n' +
                        'Keine Redundanz, keine verschachtelten Sätze\n' +
                        'Fokus auf Handlungskompetenz, nicht auf reine Wissensvermittlung',
                    },
                    topicPoints: {
                      type: 'string',
                      description:
                        '5-7 aussagekräftige, aktive Stichpunkte\n' +
                        'Formuliert als Können (nicht Wissen)',
                    },
                  },
                  required: ['introduction', 'topicPoints', 'title'],
                  additionalProperties: false,
                },
              },
            },
            required: ['skills'],
            additionalProperties: false,
          },
        },
      }
    );

    if (!learningPlan) {
      throw new HttpException(
        'Learning plan could not be generated',
        HttpStatus.BAD_REQUEST
      );
    }

    this.logger.debug(learningPlan);

    return learningPlan;
  }

  getMeasureSheetFromQuote(quote: Quote) {
    //add validation

    const modules: AgencyQuoteMeasureSheetModulesPDF[] =
      quote.Quoted_Items!.map((item) => {
        const teachingDays =
          quote.educationTimeKind === 'Vollzeit'
            ? item.Unterrichtseinheiten / 8
            : item.Unterrichtseinheiten / 4;
        return {
          number: item.module_number,
          price: this.zohoUtility.toEUR(item.List_Price),
          teachingDays: teachingDays,
          teachingUnits: item.Unterrichtseinheiten,
          title: item.product_title,
        };
      });

    const measureSheet: MeasureSheetPDF = {
      number: quote.measureNumber,
      modules: modules,
    };

    return measureSheet;
  }

  async getJustification(
    clientData: string,
    title: string,
    courses: string[],
    labourMarket: string,
    gender: string
  ) {
    const prompt = personalRelevantPrompt(
      clientData,
      title,
      courses,
      labourMarket,
      gender
    );

    /*
    {
        type: 'json_schema',
        json_schema: {
          name: 'json_schema_array',
          schema: {
            type: 'object',
            properties: {
              male: {
                type: 'string',
                description: 'männliche ansprache',
              },
              female: {
                type: 'string',
                description: 'weibliche ansprache',
              },
            },
            required: ['title', 'content'],
            additionalProperties: false,
          },
        },
      }
     */

    this.logger.debug(prompt);
    const justification = await this.openAIService.getAssistantResponse(
      'asst_X1rvUfcagarKRgYcMtenLLM4',
      prompt
    );

    if (!justification) {
      throw new HttpException(
        'Justification could not be generated',
        HttpStatus.BAD_REQUEST
      );
    }

    return justification;
    /*
    const parseJustification = JSON.parse(justification) as {
      male: string;
      female: string;
    };

    return parseJustification;*/
  }

  /**
   * fetch all need data to create the ang or ptb quote pdf
   * @param quote
   */
  async getQuoteDataForPDF(quote: Quote) {
    const [angTemplate] = await this.zohoUtility.getAirtableDocumentTemplates([
      quote.quote_template_id!,
    ]);

    /* if (!ptbTemplate) {
      throw new HttpException('PTB template not found', HttpStatus.BAD_REQUEST);
    }*/

    this.logger.debug('ANG TEMPLATE found ' + angTemplate.template_id);

    //get qualification plant entries of quote
    const qpes = await this.quotesHelperService.getQPEByQuote(quote, [
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

    //find shell product of the quote
    const shellProductId = quote.Quoted_Items!.find(
      (item) => item.is_shell
    )?.certificate_id;

    const shellProduct = measures.find(
      (measure) => measure.certificate_id === shellProductId
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
      shellProduct,
      qpes,
      angTemplate,
    };
  }

  //pulling quote data by quoteId
  async handleQuoteCreation(quoteId: string) {
    const quote: Quote = await this.restService.getById<Quote>({
      module: 'Quotes',
      id: quoteId,
    });

    if (
      quote.quote_template_id &&
      quote.quote_template_id.includes('QUOTE_SELFPAID')
    ) {
      await this.selfPaidQuotesService.createQuoteANGPDFselfpaid(quote);
    } else if (quote.quote_template_id) {
      await this.createQuoteANGPDF(quote);
    } else {
      throw new HttpException(
        'The provided Deal funding_instrument is undefined',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async createQuoteANGPDF(quote: Quote) {
    const quoteId = quote.id;

    const { deal, client, shellProduct, measures, angTemplate, qpes } =
      await this.getQuoteDataForPDF(quote);

    const errors = await this.qpValidation.validateForAngCreation(
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

    const quotePDFData = await this.getQuoteAgencyPDFData(
      quote,
      deal,
      client,
      measures,
      qpes,
      shellProduct
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

  async getAirtableDegree(quote: Quote) {
    const zohoDegree = await this.getDegreeDesignation(quote);
    if (!zohoDegree) {
      return;
    }
    const [degree] =
      await this.airtableService.getAll<AirtableDegreeDesignationDTO>({
        baseId: process.env['ZOHO_AIRTABLE_BASE_ID']!, //Zoho crm base
        tableId: process.env['ZOHO_DEGREE_DESIGNATION_AIRTABLE_TABLE_ID']!, //degree designation
        params: {
          filterByFormula: `degree_designation_id="${zohoDegree.company_id}"`,
        },
      });
    this.logger.debug('degre:', degree);
    return degree;
  }

  async getDegreeDesignation(quote: Quote) {
    if (!quote.degree_designation) {
      return;
    }

    const zohoDegree = await this.restService.getById<DegreeDesignation>({
      module: 'degree_designations',
      id: quote.degree_designation.id!,
    });
    return zohoDegree;
  }

  async getQuoteAgencyPDFData(
    quote: Quote,
    deal: Deal,
    client: ClientPDF,
    measures: AirtableMeasuresDTO[],
    qpes: QualificationPlanEntry[],
    shellProduct?: AirtableMeasuresDTO
  ) {
    const consultation_protocol = deal.consultation_protocol!.split('2. ');
    const clientData = consultation_protocol[0].trim();

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

    const product = measures.find(
      (measures) => measures.certificate_id === shellProduct?.certificate_id
    );

    const airtableDegree: AirtableDegreeDesignationDTO | undefined =
      await this.getAirtableDegree(quote);

    const labourMarketRelevance = this.getLabourMarketRelevance(
      client,
      product,
      airtableDegree
    );

    if (!labourMarketRelevance) {
      throw new HttpException(
        'Labour market relevance not found',
        HttpStatus.BAD_REQUEST
      );
    }

    const degreeTitle = quote.degree_title || shellProduct?.title;

    if (!degreeTitle) {
      throw new HttpException('No degree title found', HttpStatus.BAD_REQUEST);
    }

    //const product = await this.getShellProductById(shellProduct.certificate_id);

    const totalPrice = quote.Quoted_Items.map((a) => a.List_Price).reduce(
      (acc, curr) => acc + curr
    );

    const totalTeachingUnits = quote.Quoted_Items.map(
      (a) => a.Unterrichtseinheiten
    ).reduce((acc, curr) => acc + curr);

    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 30); // Set due date to 14 days from today
    const measureCourses = measures.map((measure) => measure.courses).flat();
    const missingRequiredCourses =
      this.quotesHelperService.getMissingRequiredCourses(qpes, measureCourses);

    const teachingUnitsPerDay =
      ((quote.hours_per_week * 60) / 45 / 5 / 10) * 10;

    const learningPlan = await this.zohoUtility.getTopicPlanDataByQPEs(qpes);

    const courses = qpes
      .map((qpe) => qpe.kurse?.name)
      .filter((e) => e !== undefined);

    const gender = client.salutation === 'frau' ? 'weiblich' : 'männlich';

    const justification = await this.getJustification(
      clientData,
      degreeTitle,
      courses,
      labourMarketRelevance,
      gender
    );

    /*const justification =
      client.salutation === 'Frau'
        ? parseJustification.female
        : parseJustification.male;*/

    const competenceLearningPlan: CompetenceLearningPlanItem[] = measures.map(
      (measures) => ({ title: measures.title, content: measures.learning_plan })
    );

    const durationInWeeksQuote =
      Math.round((totalTeachingUnits / teachingUnitsPerDay / 5) * 10) / 10;

    const durationInMonths =
      Math.round((durationInWeeksQuote / 4.33) * 10) / 10;
    const agencyQuotePDF: AgencyQuotePDF = {
      StaticFileserver: process.env['PDF_ASSETS_URL']!,
      client: client,
      measureSheet: this.getMeasureSheetFromQuote(quote),
      payer: {
        name: quote.Account_Name?.name,
      },
      product: {
        title: degreeTitle,
        degreeDesignation: degreeTitle,
        labourMarketRelevance: labourMarketRelevance,
      },
      quote: {
        missingRequiredCourses: missingRequiredCourses.join(', '),
        additionalAgreement: quote.additionalAgreement,
        startDate: this.zohoUtility.toDEDate(quote.startDate!),
        endDate: this.zohoUtility.toDEDate(quote.Enddatum!),
        durationInWeeks: durationInWeeksQuote,
        durationInMonths: durationInMonths,
        learningMethod: quote.Learning_Method!,
        totalPrice: this.zohoUtility.toEUR(totalPrice),
        totalPricePerUnit: this.zohoUtility.toEUR(
          totalPrice / totalTeachingUnits
        ),
        date: this.zohoUtility.toDEDate(today),
        dueDate: this.zohoUtility.toDEDate(dueDate),
        number: quote.offerNumber!,
        teachingMethod: quote.educationTimeKind!,
        teachingUnitsPerDay: teachingUnitsPerDay,
        totalTeachingUnits: totalTeachingUnits,
        justification: justification.split('\n\n'),
        isB2B: deal.business_type === 'B2B',
      },
      competenceLearningPlan: competenceLearningPlan,
      learningPlan: learningPlan,
      otherLearningContent: this.zohoUtility.getOtherLearningContent(
        quote,
        deal
      ),
    };
    return agencyQuotePDF;
  }

  /**
   * return the measure sheet base of the product in the quote, if no suitable sheet could be found in airtable
   * a default will be returned
   * @param certificateEntries
   * @param isOnline
   * @param educationTimeKind
   * @param quote
   */
  async setMeasureSheetOnQuote(
    certificateEntries: AirtableMeasuresDTO[],
    isOnline: boolean,
    educationTimeKind: string,
    quote: Quote
  ) {
    //time kind matrix to convert the education time kind to the teaching method
    const timeKindMatrix: Record<string, string> = {
      vollzeit: 'VZ',
      teilzeit: 'TZ',
      berufsbegleitend: 'BG',
    };
    this.logger.debug(certificateEntries);

    //get certificate ids of the quoted items
    const certificateIds = certificateEntries
      .map((entry) => entry.certificate_id)
      .filter((e) => e !== undefined);

    const learning_method = isOnline ? 'online' : 'hybrid';
    const teaching_method = timeKindMatrix[educationTimeKind.toLowerCase()];
    //get category of the measure sheet
    const [category] = this.findMostCommonCategory(
      certificateEntries.map((entry) => entry.measure_sheet_category_names!),
      certificateIds.length
    );

    this.logger.debug('category: ' + category);

    let zohoMeasureSheetEntries: MeasureSheetEntry[];

    if (!quote.measuresSheet) {
      this.logger.debug('getting zoho measure sheet entries');
      //get zoho measure sheet entries
      zohoMeasureSheetEntries = await this.getZohoMeasureSheetEntries(
        certificateIds.slice(0, 11),
        learning_method,
        teaching_method,
        quote.startDate,
        quote.Enddatum
      );
    } else {
      try {
        //get zoho measure sheet entries by the measure sheet id
        zohoMeasureSheetEntries = await this.restService.related<
          ActionSheet,
          MeasureSheetEntry
        >({
          module: 'ActionSheet',
          id: quote.measuresSheet.id!,
          relatedModule: 'sheet_entries',
          params: {
            fields: [
              'id',
              'certificate_entry_id',
              'measure_sheet',
              'learning_method',
              'teaching_method',
              'last_entry_date',
              'module_number',
              'measure_sheet_number',
              'category_name',
            ],
          },
        });
      } catch (e) {
        this.logger.debug('no entries exists');
        zohoMeasureSheetEntries = [];
      }
    }

    //get measure sheet by category if measure sheet by certificate is empty and no explicit sheet is on the quote
    if (
      (zohoMeasureSheetEntries?.length === 0 || !zohoMeasureSheetEntries) &&
      !quote.measuresSheet
    ) {
      const sheet = await this.getMeasureSheetByCategoryName(
        quote,
        category,
        learning_method,
        teaching_method
      );
      if (sheet) {
        quote.measuresSheet = {
          id: zohoMeasureSheetEntries?.[0].measure_sheet!.id,
        };
        quote.measureNumber = sheet.actionNumber;
        quote.measure_sheet_category_name = sheet.measureSheetCategory;
      }
    }

    //this.logger.debug('measure_sheet_number: ', zohoMeasureSheetEntries);

    //set module numbers
    if (zohoMeasureSheetEntries?.length > 0) {
      quote.measuresSheet = {
        id: zohoMeasureSheetEntries?.[0].measure_sheet!.id,
      };
      quote.measureNumber = zohoMeasureSheetEntries?.[0].measure_sheet_number;
      quote.measure_sheet_category_name =
        zohoMeasureSheetEntries?.[0].category_name;

      quote.Quoted_Items!.forEach((item) => {
        const sheetEntry = zohoMeasureSheetEntries.find(
          (entry) => entry.certificate_entry_id === item.certificate_id
        );
        //this.logger.debug(item);
        //this.logger.debug(zohoMeasureSheetEntries);
        if (sheetEntry && sheetEntry.module_number) {
          item.module_number = sheetEntry.module_number;
        } else {
          item.module_number = null;
        }
      });
    }

    //getSheetByCategory
    if (quote.measuresSheet?.id) {
      const allCertificateIds = zohoMeasureSheetEntries?.map(
        (entry) => entry.certificate_entry_id
      );

      const activeSheetCertificateIds = zohoMeasureSheetEntries
        ?.filter((entry) => entry.module_number)
        .map((entry) => entry.certificate_entry_id);

      this.logger.debug('certificate ids: ', certificateIds);
      this.logger.debug('active ids: ', activeSheetCertificateIds);

      //find missing ids
      let missingCertificateEntryIds = certificateIds.filter(
        (id) => !activeSheetCertificateIds?.includes(id)
      );

      this.logger.debug('missing ids: ', missingCertificateEntryIds);

      if (missingCertificateEntryIds.length === 0) {
        quote.measure_sheet_status = 'COMPLETE';
        return {
          missingCertificateEntryIds,
          teaching_method,
          learning_method,
          category,
        };
      }

      //filter out existing entries without module number
      missingCertificateEntryIds = missingCertificateEntryIds.filter(
        (id) => !allCertificateIds?.includes(id)
      );

      quote.measure_sheet_status = 'INCOMPLETE';
      return {
        missingCertificateEntryIds,
        teaching_method,
        learning_method,
        category,
      };
    }

    quote.measure_sheet_status = 'NOT_FOUND';

    this.logger.debug('certificate ids: ' + certificateIds);
    const missingCertificateEntryIds = certificateIds;
    return {
      missingCertificateEntryIds,
      teaching_method,
      learning_method,
      category,
    };
  }

  /**
   *
   * @param quote
   * @param categoryName
   * @param learning_method
   * @param teaching_method
   * @returns
   */
  async getMeasureSheetByCategoryName(
    quote: Quote,
    categoryName: string,
    learning_method: string,
    teaching_method: string
  ) {
    let sheets = await this.restService.search<ActionSheet>({
      module: 'ActionSheet',
      params: {
        criteria:
          '((measureSheetCategory:equals:' +
          categoryName +
          ')and(sheetKind:equals:' +
          learning_method +
          ')and(formOfTeaching:equals:' +
          teaching_method +
          ')and(jurisdiction:equals:GLOBAL))',
      },
    });

    sheets = sheets.filter((sheet) => {
      const sheetEndDate = new Date(sheet.endOfValidity!);
      const sheetLastDayOfEntry = new Date(sheet.lastDayOfEntry!);
      const quoteStartDate = new Date(quote.startDate!);
      const quoteEndDate = new Date(quote.Enddatum!);
      return (
        sheetEndDate > quoteEndDate && sheetLastDayOfEntry > quoteStartDate
      );
    });

    return sheets?.[0];
  }

  findMostCommonCategory(categories: string[][], quoteItemsCount: number) {
    // Flatten the 2D array and create a frequency map using reduce
    const frequencyMap = categories
      .flat()
      .reduce<Record<string, number>>((acc, str) => {
        acc[str] = (acc[str] || 0) + 1;
        return acc;
      }, {});

    // Find the string with the highest frequency using reduce
    const map = Object.entries(frequencyMap).reduce(
      (maxEntry, entry) => {
        return entry[1] > maxEntry[1] ? entry : maxEntry;
      },
      ['', 0]
    );
    this.logger.debug('frequencyMap: ', map);
    return map;
  }

  async getZohoMeasureSheetEntries(
    certificateIds: string[],
    learning_method: string,
    teaching_method: string,
    startDate?: string,
    endDate?: string
  ) {
    const certificateCriteria = this.buildCriteriaFormula<MeasureSheetEntry>(
      certificateIds,
      'certificate_entry_id',
      'or'
    );

    let criteria =
      '((' +
      certificateCriteria +
      ')and' +
      '(learning_method:equals:' +
      learning_method +
      ')and' +
      '(teaching_method:equals:' +
      teaching_method +
      ')and(jurisdiction:equals:GLOBAL)';

    criteria += ')';

    this.logger.debug(criteria);

    const measureSheetEntries =
      await this.restService.search<MeasureSheetEntry>({
        module: 'measure_sheet_entries',
        params: {
          criteria: criteria,
        },
      });

    this.logger.debug('measureSheetEntries: ', measureSheetEntries);

    let mappedEntries: MeasureSheetEntry[] = measureSheetEntries.map(
      (entry) => {
        const entryMap: MeasureSheetEntry = {
          id: entry.id,
          certificate_entry_id: entry.certificate_entry_id,
          measure_sheet: entry.measure_sheet,
          learning_method: entry.learning_method,
          teaching_method: entry.teaching_method,
          last_entry_date: entry.last_entry_date,
          measure_sheet_end_date: entry.measure_sheet_end_date,
          module_number: entry.module_number,
          measure_sheet_number: entry.measure_sheet_number,
          category_name: entry.category_name,
        };

        return entryMap;
      }
    );

    const measureSheets: Record<string, MeasureSheetEntry[]> = {};

    const quoteStartDate = new Date(startDate!);
    const quoteEndDate = new Date(endDate!);

    this.logger.debug('pre filter: ', mappedEntries);

    mappedEntries = mappedEntries.filter((entry) => {
      const sheetLastEntryDate = new Date(entry.last_entry_date!);
      const sheetEndDate = new Date(entry.measure_sheet_end_date!);

      return sheetEndDate > quoteEndDate && sheetLastEntryDate > quoteStartDate;
    });

    this.logger.debug('mappedEntries: ', mappedEntries);

    //fill measureSheets record with entries
    mappedEntries.forEach((entry) => {
      if (entry.measure_sheet?.id) {
        const holder = measureSheets[entry.measure_sheet.id];
        if (holder) {
          measureSheets[entry.measure_sheet.id].push(entry);
        } else {
          measureSheets[entry.measure_sheet.id] = [entry];
        }
      }
    });

    //filter out sheets with denalied entries

    //sort measureSheets by length
    const sortMaps = Object.values(measureSheets).sort(
      (a, b) => b.length - a.length
    );
    //return sheet with the most entries
    return sortMaps?.[0];
  }

  buildCriteriaFormula<T>(
    certificateEntryIds: string[],
    apiName: keyof T,
    operator: string
  ) {
    return certificateEntryIds
      .map((id) => '(' + apiName.toString() + ':equals:' + id + ')')
      .join(operator);
  }

  async getPrePDFQuoteData(offerId: string) {
    const quote = await this.restService.getById<Quote>({
      module: 'Quotes',
      id: offerId,
    });

    //get certificate ids of the quoted items
    const certificateIds =
      quote.Quoted_Items?.map((item) => item.certificate_id) || [];

    //fetch certificate entries (zoho products) from airtable zoho crm base by certificate ids
    const certificateEntries =
      await this.zohoUtility.getAirtableMeasureByCertificateId(certificateIds);

    //set product title into quoted items to display on measure sheet list at ang pdf
    quote.Quoted_Items?.forEach((item) => {
      const measure = certificateEntries.find(
        (measure) => measure.certificate_id === item.certificate_id
      );
      if (measure) {
        item.product_title = measure.title;
      }
    });

    return {
      quote,
      certificateEntries,
    };
  }

  /**
   * this method will update the measure sheet data on the quoted itmes and set the measure sheet on the quote
   * @param quoteId
   */
  async updateQuotedItemsMeasureSheetData(quoteId: string) {
    const { quote, certificateEntries } = await this.getPrePDFQuoteData(
      quoteId
    );

    //fetch measure sheet
    await this.setMeasureSheetOnQuote(
      certificateEntries,
      quote.Learning_Method === 'online',
      quote.educationTimeKind!,
      quote
    );

    this.logger.debug(quote);

    if (quote.measuresSheet?.id || quote.measuresSheet?.external_id) {
      await this.restService.update<Quote>({
        module: 'Quotes',
        data: [
          {
            id: quote.id,
            measuresSheet: quote.measuresSheet,
            Quoted_Items: quote.Quoted_Items,
            measure_sheet_category_name: quote.measure_sheet_category_name,
            measureNumber: quote.measureNumber,
          },
        ],
        options: {
          headers: { 'X-EXTERNAL': 'Quotes.measuresSheet.external_id' },
          trigger: ['workflow'],
        },
      });
    }

    return plainToInstance(QuoteMeasureSheetDTO, quote, {
      excludeExtraneousValues: true,
    });
  }

  private getLabourMarketRelevance(
    client: ClientPDF,
    product?: AirtableMeasuresDTO,
    airtableDegree?: AirtableDegreeDesignationDTO
  ) {
    const femaleDegree =
      airtableDegree?.female_labor_market_relevance ||
      product?.female_labor_market_relevance_quote;
    const maleDegree =
      airtableDegree?.male_labor_market_relevance ||
      product?.male_labor_market_relevance_quote;

    if (client.salutation === 'Frau') {
      return femaleDegree;
    } else {
      return maleDegree;
    }
  }
}
