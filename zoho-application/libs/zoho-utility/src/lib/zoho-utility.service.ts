import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import console from 'console';
import { AirtableLibService } from '@company/airtable-lib';
import {
  AirtableCourseSortDTO,
  AirtableMeasuresDTO,
  AirtableZohoCourseVersionDTO,
  AirtableZohoProductDTO,
  Contact,
  CourseSortDTO,
  Deal,
  KTNEnrolment,
  QualificationPlanEntry,
  Quote,
} from '@company/zoho-types';
import { LearningPlanItem } from '@company/content-generation-lib';
import {
  applicantTrainingDocumentContent,
  ClientPDF,
  PDTopicPointsWithTU,
  selfEmpowermentDocumentContent,
} from '@company/pdf-document-types';
import { ZohoInternalConnectorService } from '@company/zoho-connector';
import { z } from 'zod';

@Injectable()
export class ZohoUtilityService {
  private readonly logger = new Logger(ZohoUtilityService.name);
  constructor(
    private readonly airtableService: AirtableLibService,
    private readonly restService: ZohoInternalConnectorService
  ) {}

  measureFormulaBuilder(measureCodes: string[], fieldName: string) {
    return (
      'OR(' +
      measureCodes.map((code) => fieldName + "='" + code + "'").join(',') +
      ')'
    );
  }

  async uploadToZoho(
    fileName: string,
    file: Buffer,
    quoteId: string,
    deleteExisting = true
  ) {
    return await this.restService.uploadAttachment({
      module: 'Quotes',
      id: quoteId,
      rawBody: file,
      fileName: fileName,
      deleteExisting: deleteExisting,
    });
  }

  async getAirtableDocumentTemplates(templateIds: string[]) {
    //fetch templates
    const templates = await this.airtableService.getAll<{
      id: string;
      template_id: string;
      html_template: string;
      html_template_pre: string;
      html_template_last_modified_time: string;
    }>({
      baseId: process.env['DOCUMENT_AIRTABLE_BASE_ID']!,
      tableId: process.env['DOCUMENT_DOCUMENT_TEMPLATES_AIRTABLE_TABLE_ID']!,
    });

    return templates.filter((template) =>
      templateIds.includes(template.template_id)
    );
  }

  async getAirtableCoursesByIds(
    courseIds: string[],
    field: string,
    fields?: (keyof AirtableCourseSortDTO)[]
  ) {
    const courseFormula = this.measureFormulaBuilder(
      courseIds.map((courseId) => courseId),
      field
    );

    this.logger.debug('request to airtable with: ' + courseFormula);
    this.logger.debug('fields: ', fields);

    let params: Record<string, any>;

    if (fields) {
      params = {
        fields: fields,
        filterByFormula: courseFormula,
      };
    } else {
      params = {
        filterByFormula: courseFormula,
      };
    }

    const airtableCourses =
      await this.airtableService.getAll<AirtableCourseSortDTO>({
        baseId: process.env['ZOHO_AIRTABLE_BASE_ID']!, //zoho crm base
        tableId: process.env['ZOHO_COURSE_NAME_AIRTABLE_TABLE_ID']!, //course table
        params: params,
      });

    return airtableCourses;
  }

  async getAirtableCoursesVersionByIds(
    courseIds: string[],
    field: string,
    fields?: (keyof AirtableZohoCourseVersionDTO)[]
  ) {
    const courseFormula = this.measureFormulaBuilder(
      courseIds.map((courseId) => courseId),
      field
    );

    this.logger.debug('request to airtable with: ' + courseFormula);
    this.logger.debug('fields: ', fields);

    let params: Record<string, any>;

    if (fields) {
      params = {
        fields: fields,
        filterByFormula: courseFormula,
      };
    } else {
      params = {
        filterByFormula: courseFormula,
      };
    }

    const zohoAirtableCourseVersions =
      await this.airtableService.getAll<AirtableZohoCourseVersionDTO>({
        baseId: process.env['ZOHO_AIRTABLE_BASE_ID']!, //zoho crm base
        tableId: process.env['ZOHO_COURSE_VERSION_AIRTABLE_TABLE_ID']!, //course table
        params: params,
      });

    return zohoAirtableCourseVersions;
  }

  /**
   * get measures by certificate id
   * @param quoteCertificateIds
   * @param fields
   */
  async getAirtableMeasureByCertificateId(
    quoteCertificateIds: string[],
    qpMeasureCourseIds?: Record<string, string[]>,
    fields: (keyof AirtableZohoProductDTO)[] = [
      'learning_plan',
      'learning_method',
      'product_title',
      'certificate_entry_id',
      'degree_designation',
      'chance_and_potentials',
      'chance_and_potentials_female',
      'measures_sheet_categories_ids',
      'measure_sheet_category_names',
      'product_included_courses_names',
      'potential_course_replacement_names',
      'main_course_name',
      'main_course_teaching_units',
      'potential_course_replacement_ids',
      'female_labor_market_relevance_quote',
      'male_labor_market_relevance_quote',
      'included_courses_ids',
      'certificate_title',
      'certificate_full_time_teaching_units_per_week',
    ]
  ) {
    if (qpMeasureCourseIds) {
      const qpCertificateIds = Object.keys(qpMeasureCourseIds);
      //check if qpCertificateIds equal to quoteCertificateIds
      const allCertificateIdsExist =
        qpCertificateIds.every((id) => quoteCertificateIds.includes(id)) &&
        qpCertificateIds.length === quoteCertificateIds.length;
      if (!allCertificateIdsExist) {
        throw new HttpException(
          'Die Zertifikats IDs vom Qualifikationspläne stimmen nicht mit den Zertifikats IDs aus dem Angebot mit einander.',
          HttpStatus.BAD_REQUEST
        );
      }
    }

    //build formula to retrieve all measures by certificate id
    const measureFormula = this.measureFormulaBuilder(
      quoteCertificateIds,
      '{certificate_entry_id}'
    );

    this.logger.debug('request to airtable with: ' + measureFormula);

    //get measures by certificate id
    const measures = await this.airtableService.getAll<AirtableZohoProductDTO>({
      baseId: process.env['ZOHO_AIRTABLE_BASE_ID']!,
      tableId: process.env['ZOHO_ZOHO_PRODUCTS_AIRTABLE_TABLE_ID']!,
      params: {
        filterByFormula: measureFormula,
        fields: fields,
      },
    });

    //this.logger.debug(measures);

    //this.logger.log('measures have been fetch with formula ' + measureFormula);
    const qpcompanyCourseId =
      (qpMeasureCourseIds &&
        Object.keys(qpMeasureCourseIds)
          .map((key) => qpMeasureCourseIds[key])
          .flat()
          .filter((e) => e != undefined)) ||
      [];

    this.logger.debug('vids: ', qpcompanyCourseId);

    const measurecompanytCourseIds = measures
      .map((measure) => measure.included_courses_ids)
      .flat();

    this.logger.debug('measuerIds: ', measurecompanytCourseIds);

    const companyCourseIds =
      qpcompanyCourseId.length > 0
        ? qpcompanyCourseId
        : measurecompanytCourseIds;

    const airtableCourses = await this.getAirtableCoursesByIds(
      companyCourseIds,
      'course_id'
    );

    this.logger.debug('qpMeasureCourseIds', qpMeasureCourseIds);

    //check use of AirtableMeasureDTO Interface
    return measures.map((measure) => {
      const companyMeasureCourseIds = qpMeasureCourseIds
        ? qpMeasureCourseIds[measure.certificate_entry_id]
        : measure.included_courses_ids;
      this.logger.debug(
        'measure.certificate_entry_id',
        measure.certificate_entry_id
      );
      this.logger.debug('niceT', companyMeasureCourseIds);

      const measuresSortDTOs: AirtableMeasuresDTO = {
        learning_plan: JSON.parse(measure.learning_plan) as LearningPlanItem[],
        female_labor_market_relevance_quote:
          measure.female_labor_market_relevance_quote,
        male_labor_market_relevance_quote:
          measure.male_labor_market_relevance_quote,
        included_courses_ids: measure.included_courses_ids,
        main_course_name: measure.main_course_name?.[0],
        potential_course_replacement_ids:
          measure.potential_course_replacement_ids,
        main_course_teaching_units: measure.main_course_teaching_units?.[0],
        chance_and_potentials: measure.chance_and_potentials,
        chance_and_potentials_female: measure.chance_and_potentials_female,
        potential_course_replacement_names:
          measure.potential_course_replacement_names,
        product_included_courses_names: measure.product_included_courses_names,
        certificate_id: measure.certificate_entry_id,
        degree_designation: measure.degree_designation[0],
        title: measure.product_title,
        learning_method: measure.learning_method,
        measure_sheet_category_names: measure.measure_sheet_category_names,
        measures_sheet_categories_ids: measure.measures_sheet_categories_ids,
        certificate_full_time_teaching_units_per_week:
          measure.certificate_full_time_teaching_units_per_week,
        courses: companyMeasureCourseIds
          .map((courseAirtableRecordId) => {
            const airtableCourse = airtableCourses.find(
              (course) => course.course_id === courseAirtableRecordId
            );
            if (!airtableCourse) {
              this.logger.warn(
                `Course with id ${courseAirtableRecordId} not found in Airtable`
              );
              return null;
            }
            return this.mapCourse(airtableCourse, measure.certificate_entry_id);
          })
          .filter((e) => e !== null),
      };
      return measuresSortDTOs;
    });
  }

  validateFullTimeTeachingUnitsPerWeek(
    airtableMeasures: {
      certificate_full_time_teaching_units_per_week?: number[];
    }[]
  ) {
    const fortyTeachingUnitsPerWeek = airtableMeasures.filter(
      (measure) =>
        measure.certificate_full_time_teaching_units_per_week?.[0] === 40
    );
    const fiftyTeachingUnitsPerWeek = airtableMeasures.filter(
      (measure) =>
        measure.certificate_full_time_teaching_units_per_week?.[0] === 50
    );

    if (
      fortyTeachingUnitsPerWeek.length > 0 &&
      fiftyTeachingUnitsPerWeek.length > 0
    ) {
      throw new HttpException(
        'Es dürfen keine Produkte mit 40 und 50 UE pro Woche gemischt werden',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  mapCourse(
    airtableCourse: AirtableCourseSortDTO,
    measureCertificateEntryId?: string
  ): CourseSortDTO {
    return {
      companyId: airtableCourse.course_id,
      name: airtableCourse.course_name,
      main_category_priority: airtableCourse.main_category_priority,
      sub_category_priority: airtableCourse.sub_category_priority,
      level_priority: airtableCourse.level_priority,
      sub_level_priority: airtableCourse.sub_level_priority,
      pas: airtableCourse.zoho_crm_pa_ids?.map((id, index) => ({
        zohoId: id.split('_')[1],
        companyId: airtableCourse.project_work_zoho_ids[index],
      })),
      durationInWeeks: airtableCourse.teaching_weeks_ft,
      course_content_topics_with_ue:
        airtableCourse.course_content_topics_with_ue,
      measureCertificateEntryId: measureCertificateEntryId,
      teaching_units: airtableCourse.teaching_units,
      required_courses_ids: airtableCourse.required_courses_ids,
      required_courses_names: airtableCourse.required_courses_names,
    };
  }

  getTimeMultiplier(educationKind: string) {
    if (educationKind === 'Vollzeit') {
      return 1;
    }
    return 2;
  }

  formatDate(date: Date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  calculateWeeksRoundedUpBetweenDatesAbs(startDate?: string, endDate?: string) {
    if (startDate && endDate) {
      const millisecondsPerDay = 24 * 60 * 60 * 1000; // Number of milliseconds in a day
      const timeDifference = Math.abs(
        new Date(endDate).getTime() - new Date(startDate).getTime()
      ); // Difference in milliseconds
      const timeDiffDays = Math.ceil(timeDifference / millisecondsPerDay);
      console.log(timeDiffDays);
      return Math.ceil(timeDiffDays / 7);
    }
    return null;
  }

  calculateWeeksRoundedUpBetweenDates(startDate?: string, endDate?: string) {
    if (startDate && endDate) {
      const millisecondsPerDay = 24 * 60 * 60 * 1000; // Number of milliseconds in a day
      const timeDifference =
        new Date(endDate).getTime() - new Date(startDate).getTime(); // Difference in milliseconds
      const timeDiffDays = Math.ceil(timeDifference / millisecondsPerDay);
      console.log(timeDiffDays);
      return Math.ceil(timeDiffDays / 7);
    }

    return null;
  }

  calculateNextDateAndReturnEndDate(
    date: Date,
    addWeeks: number,
    vacationStartDate?: Date,
    vacationInWeeks?: number,
    vacationAdded?: { value: boolean }
  ) {
    //vecation
    //vacataion startdate after date
    //vacation enddate

    const preStartDate = new Date(date.toISOString());
    //add vacation
    if (
      vacationStartDate &&
      vacationInWeeks &&
      vacationStartDate > date &&
      vacationAdded &&
      !vacationAdded?.value
    ) {
      date.setDate(date.getDate() + vacationInWeeks * 7);
      vacationAdded.value = true;
    }
    date.setDate(date.getDate() + addWeeks * 7);
    console.log(date, ' ', addWeeks);
    const endDate = new Date(date.toISOString());
    const friday = 5;
    const dayOfWeek = endDate.getDay(); // Get the day of the week of the given date

    const daysUntilFriday =
      dayOfWeek >= friday ? dayOfWeek - friday : 7 - (friday - dayOfWeek);

    const fridayBefore = new Date(
      endDate.getTime() - daysUntilFriday * 24 * 60 * 60 * 1000
    );

    const dateCalenderWeek = this.getCalendarWeek(date);
    const fridayBeforeCalenderWeek = this.getCalendarWeek(fridayBefore);
    //if date is a weeks before the end of the yeah

    if (date.toLocaleDateString('de-DE') === '23.12.2024') {
      date.setDate(date.getDate() + 2 * 7);
      //if fridayBefore is the last friday of yeah
    } else if (fridayBefore.toLocaleDateString('de-DE') == '30.12.2023') {
      fridayBefore.setDate(fridayBefore.getDate() + 2 * 7);
      date.setDate(date.getDate() + 2 * 7);
      //if preStartDate is before the last monday of the yeah and fridayBefore is after the first friday of the new yeah or is fridayBefore is the first friday of the new yeah
    } else if (
      fridayBefore.toLocaleDateString('de-DE') == '30.12.2023' ||
      (preStartDate < new Date('23.12.2024') &&
        fridayBefore > new Date('30.12.2023'))
    ) {
      date.setDate(date.getDate() + 2 * 7);
      fridayBefore.setDate(fridayBefore.getDate() + 2 * 7);
      //add 14 days to next start and end date
    }
    return { fridayBeforeFormat: this.formatDate(fridayBefore), fridayBefore };
  }

  getNextMonday(date: Date): Date {
    const dayOfWeek = date.getDay();
    const daysUntilNextMonday = (8 - dayOfWeek) % 7;
    const nextMonday = new Date(date);
    nextMonday.setDate(date.getDate() + daysUntilNextMonday);
    return nextMonday;
  }

  getMondayBefore(date: Date): Date {
    const dayOfWeek = date.getDay();
    this.logger.debug('stratadte: ' + dayOfWeek);
    if (dayOfWeek === 1) {
      return date;
    }

    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    this.logger.debug(daysToSubtract);
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() - daysToSubtract);
    return newDate;
  }

  calculateWithAdditionalTime(
    currentStart: Date,
    currentEnd: Date,
    additionalStart?: Date,
    additionalEnd?: Date
  ) {
    //if additional Start date is after/on currentStart
    //end date is in the week befor additionalStart
    //current Enddate stay
    //current Startday set to end of additionalend
    /*
        if (currentStart.toLocaleDateString('de-DE') === '25.12.2023') {
          currentStart.setDate(currentStart.getDate() + 2 * 7);
          //if fridayBefore is the last friday of yeah
        } else if (currentEnd.toLocaleDateString('de-DE') == '29.12.2023') {
          fridayBefore.setDate(fridayBefore.getDate() + 2 * 7);
          currentStart.setDate(currentStart.getDate() + 2 * 7);
          //if preStartDate is before the last monday of the yeah and fridayBefore is after the first friday of the new yeah or is fridayBefore is the first friday of the new yeah
        } else if (
            fridayBefore.toLocaleDateString('de-DE') == '05.01.2024' ||
            (preStartDate < new Date('2023-12-25') &&
                fridayBefore > new Date('2024-01-01'))
        ) {
          currentStart.setDate(currentStart.getDate() + 2 * 7);
          fridayBefore.setDate(fridayBefore.getDate() + 2 * 7);
          //add 14 days to next start and end date
        }*/
  }

  getCalendarWeek(date: Date): number {
    // Step 1: Get the year of the date
    const year = date.getFullYear();

    // Step 2: Find the first day of the year and its weekday
    const firstDayOfYear = new Date(year, 0, 1);
    const firstDayWeekday = firstDayOfYear.getDay(); // Sunday is 0, Monday is 1, ...

    // Step 3: Calculate the number of days between the date and the first day of the year
    const timeDiff = date.getTime() - firstDayOfYear.getTime();
    const daysDifference = timeDiff / (1000 * 3600 * 24); // Milliseconds in a day

    // Step 4: Divide the number of days by 7 to get the number of weeks
    return Math.floor((daysDifference + firstDayWeekday) / 7) + 1;
  }

  isListUnique(items: string[], excludeItem?: string) {
    if (excludeItem) {
      items = items.filter((item) => !item.startsWith(excludeItem));
    }

    return new Set(items).size === items.length;
  }

  hasOnlineOnly(measureCodes: string[], excludeItems?: string[]) {
    if (excludeItems) {
      measureCodes = measureCodes.filter(
        (item) => !excludeItems.includes(item)
      );
    }

    const allOnline = measureCodes.filter((code) =>
      code.toLowerCase().startsWith('o')
    ).length;

    return allOnline === measureCodes.length;
  }

  getDateRanges(
    startDate: Date,
    endDate: Date,
    amountOfRanges: number
  ): { startDate: Date; endDate: Date }[] {
    const days = this.daysBetweenToDates(startDate, endDate);
    this.logger.debug('days: ' + days);
    const daysPerRange = Math.floor(days / amountOfRanges);
    this.logger.debug('days per range: ' + daysPerRange);
    let iterationDate = new Date(startDate);
    iterationDate.setUTCHours(0, 0, 0, 0);
    const ranges = [];
    for (let i = 0; i < amountOfRanges; i++) {
      this.logger.debug(
        'iterationDate ',
        iterationDate.toLocaleDateString('de-DE')
      );

      const startDate = new Date(iterationDate);
      startDate.setDate(startDate.getDate());
      startDate.setUTCHours(0, 0, 0, 0);
      this.logger.debug('startDate ', startDate.toLocaleDateString('de-DE'));

      const endDate = new Date(iterationDate);
      endDate.setDate(endDate.getDate() + daysPerRange);
      endDate.setUTCHours(0, 0, 0, 0);
      this.logger.debug('end date ', endDate.toLocaleDateString('de-DE'));

      ranges.push({
        startDate: startDate,
        endDate: endDate,
      });
      iterationDate = new Date(endDate);
      iterationDate.setDate(iterationDate.getDate() + 1);
    }
    return ranges;
  }

  containsMKOnHybrid(courseNames: string[], isOnline: boolean) {
    return !courseNames.includes('Methodenkompetenz') && !isOnline;
  }

  /**
   * return the category id with the most occurrences
   * @param productCategoriesIds category ids of the products
   */
  getCategoryId(productCategoriesIds: number[][]) {
    const matchingCategoryIds: number[] = [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ];
    console.log(productCategoriesIds);
    productCategoriesIds.forEach((categoryIds) => {
      categoryIds.forEach((categoryId) => {
        if (categoryId) {
          matchingCategoryIds[categoryId]++;
        }
      });
    });
    let categoryCount = 0;
    let categoryId = 0;

    matchingCategoryIds.forEach((dynamicCategoryCount, categoryNumber) => {
      if (categoryCount < dynamicCategoryCount) {
        categoryCount = dynamicCategoryCount;
        categoryId = categoryNumber;
      }
    });

    return categoryId;
  }

  isCoursesUnique(courseIds: string[]) {
    const compareSet = new Set(courseIds);
    return courseIds.length === compareSet.size;
  }

  daysFromToDatesAbs(mkDate: Date, preNewKTNEndDate: Date) {
    return (
      Math.abs(
        Math.round(
          (preNewKTNEndDate.getTime() - mkDate.getTime()) /
            (1000 * 60 * 60 * 24)
        )
      ) + 1
    );
  }

  /**
   * calculate the days from one day till next today till tomorrow 1 day
   * @param startDate
   * @param endDate
   */
  daysBetweenToDates(startDate: Date, endDate: Date) {
    const calculationStartDate = new Date(startDate.toISOString());
    const calculationEndDate = new Date(endDate.toISOString());

    return Math.round(
      (calculationEndDate.getTime() - calculationStartDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );
  }

  async getPDFContact(
    quoteContactId?: string,
    validationSchema?: z.ZodObject<any>
  ) {
    if (!quoteContactId) {
      throw new HttpException(
        'Quote contact ID is required',
        HttpStatus.BAD_REQUEST
      );
    }
    const contact = await this.restService.getById<Contact>({
      module: 'Contacts',
      id: quoteContactId,
      params: {
        fields: [
          'First_Name',
          'Last_Name',
          'Email',
          'Salutation',
          'Mailing_Street',
          'Mailing_Zip',
          'Mailing_City',
        ],
      },
    });

    if (validationSchema) {
      const result = validationSchema.safeParse(contact);

      if (!result.success) {
        const errors = JSON.parse(result.error.message) as unknown as [
          { message: string }
        ];
        throw new HttpException(
          { message: errors.map((e) => e.message).join(' | ') },
          HttpStatus.BAD_REQUEST
        );
      }
    }

    const client: ClientPDF = {
      email: contact.Email || '',
      firstName: contact.First_Name || '',
      lastName: contact.Last_Name || '',
      salutation: contact.Salutation || '',
      city: contact.Mailing_City || '',
      street: contact.Mailing_Street || '',
      zip: contact.Mailing_Zip || '',
    };

    return client;
  }

  toEUR(value: number) {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  }

  toDEDate(date: string | Date) {
    return new Intl.DateTimeFormat('de-DE').format(new Date(date));
  }

  getOtherLearningContent(quote: Quote, deal: Deal) {
    if (quote.otherLearningContent) {
      const otherLearningContent: PDTopicPointsWithTU[] = [
        selfEmpowermentDocumentContent,
      ];

      if (deal.business_type != 'B2B') {
        otherLearningContent.push(applicantTrainingDocumentContent);
      }

      return otherLearningContent;
    }
    return;
  }

  async getTopicPlanDataByQPEs(
    qpes: QualificationPlanEntry[]
  ): Promise<PDTopicPointsWithTU[]> {
    const courseIds = qpes
      .map((qpe) => qpe.companyCourseId)
      .filter((e) => e !== undefined);

    const airtableCourses = await this.getAirtableCoursesByIds(
      courseIds,
      'course_id',
      ['course_id', 'course_name', 'course_content_topics_with_ue']
    );

    this.logger.debug('airtable courses', airtableCourses);

    const sortCourse = qpes
      .sort((a, b) => a.order! - b.order!)
      .map((qpe) =>
        airtableCourses.find(
          (airtableCourse) => airtableCourse.course_id === qpe.companyCourseId
        )
      )
      .filter((sortedCourse) => sortedCourse !== undefined);

    this.logger.debug(sortCourse);

    return sortCourse?.map((course) => {
      const startDate = this.getQPEByCourseId(
        qpes,
        course?.course_id
      )?.startDate;
      return {
        courseName: course?.course_name,
        courseContentWithTU: course.course_content_topics_with_ue,
        courseContent: course?.course_content_topics_with_ue.map((topic) =>
          topic.replaceAll(/\(\s?\d{1,4}\s?(UE|ue)\)/gm, '').trim()
        ),
        teachingUnits: course?.course_content_topics_with_ue.map((topic) => {
          const match = topic.match(/\(\s?(\d{1,4})\s?(UE|ue)\)/);
          return match ? parseInt(match[1], 10) : 0;
        }),
        startDate: startDate && this.toDEDate(startDate),
      };
    });
  }

  async getTopicPlanDataByKTNs(
    ktn: KTNEnrolment[]
  ): Promise<PDTopicPointsWithTU[]> {
    const courseIds = ktn
      .map((enrolment) => enrolment.companyCourseId)
      .filter((e) => e !== undefined);

    this.logger.debug('courseIds', courseIds);

    const airtableCourses = await this.getAirtableCoursesVersionByIds(
      courseIds,
      'course_version',
      [
        'course_version',
        'course_name',
        'course_content_topic_point_with_teaching_units',
      ]
    );

    //this.logger.debug('airtable courses', airtableCourses);

    const sortCourse = ktn
      .sort((a, b) => a.Reihenfolge! - b.Reihenfolge!)
      .map((qpe) =>
        airtableCourses.find(
          (airtableCourse) =>
            airtableCourse.course_version === qpe.companyCourseId
        )
      )
      .filter((sortedCourse) => sortedCourse !== undefined);

    //this.logger.debug('airtable sorted', sortCourse);

    return sortCourse?.map((course) => {
      const startDate = this.getKTNByCourseId(
        ktn,
        course?.course_id
      )?.Kursstart;
      return {
        courseVersion: course?.course_version,
        courseName: course?.course_name,
        courseContentWithTU:
          course.course_content_topic_point_with_teaching_units,
        courseContent:
          course?.course_content_topic_point_with_teaching_units.map((topic) =>
            topic.replaceAll(/\(\s?\d{1,4}\s?(UE|ue)\)/gm, '').trim()
          ),
        teachingUnits:
          course?.course_content_topic_point_with_teaching_units.map(
            (topic) => {
              const match = topic.match(/\(\s?(\d{1,4})\s?(UE|ue)\)/);
              return match ? parseInt(match[1], 10) : 0;
            }
          ),

        startDate: startDate && this.toDEDate(startDate),
      };
    });
  }

  getQPEByCourseId(qpes: QualificationPlanEntry[], courseId: string) {
    return qpes.find((qpe) => qpe.companyCourseId === courseId);
  }

  getKTNByCourseId(ktns: KTNEnrolment[], courseId: string) {
    return ktns.find((qpe) => qpe.companyCourseId === courseId);
  }
}
