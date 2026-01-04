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

@Injectable()
export class QuotesHelperService {
  private readonly ENV = process.env['NODE_ENV'] || 'development';
  private readonly logger = new Logger(QuotesHelperService.name);
  constructor(
    private readonly restService: ZohoInternalConnectorService,
    private readonly zohoUtility: ZohoUtilityService,
    private readonly httpService: HttpService,
    private readonly qpValidation: QualificationPlanValidateService
  ) {}

  async getQPEByQuote(quote: Quote, fields: (keyof QualificationPlanEntry)[]) {
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

    const qpes = await this.restService.related<
      QualificationPlan,
      QualificationPlanEntry
    >({
      module: 'qualificationPlans',
      id: qps[0].id,
      relatedModule: 'Eintrag',
      params: {
        fields: fields,
      },
    });

    this.logger.debug(
      'qpes: ',
      qpes.map((e) => e.kurse?.name)
    );

    if (!qpes || qpes.length === 0) {
      throw new HttpException('Qualification Plan has no entries', 400);
    }

    return qpes;
  }

  getMissingRequiredCourses(
    qpEntries: QualificationPlanEntry[],
    airtableCourses: CourseSortDTO[]
  ) {
    const requiredCourseNames = airtableCourses
      .map((e) =>
        Array.isArray(e.required_courses_names)
          ? e.required_courses_names.map((e) => e.trim())
          : []
      )
      .flat()
      .filter((e) => e !== undefined);

    this.logger.debug(requiredCourseNames);

    const exitingCourses = qpEntries
      .map((course) => course.kurse?.name?.trim())
      .filter((e) => e !== undefined);

    this.logger.debug(exitingCourses);

    const missingRequiredCourses = requiredCourseNames
      .filter((e) => !exitingCourses.includes(e))
      .filter((e, i, arr) => arr.indexOf(e) === i); //unique

    return missingRequiredCourses;
  }

  ceilMonthsBetween(start: string, end: string): number {
    const a = new Date(start),
      b = new Date(end);
    const months =
      (b.getFullYear() - a.getFullYear()) * 12 + b.getMonth() - a.getMonth();
    return months + (b.getDate() > a.getDate() ? 1 : 0) || 1;
  }
}
