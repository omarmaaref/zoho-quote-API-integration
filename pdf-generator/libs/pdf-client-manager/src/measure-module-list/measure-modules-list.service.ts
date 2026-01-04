import {
  Context,
  MeasureModulesListPDF,
  Module,
  ModulesListDTO,
} from './mesure-module-list.types';
import { Contact, Quote } from '@company/zoho-types';
import { ClientPDF, PDFData } from '../pdf-file-types/pdf-generic.types';
import { ZohoInternalConnectorService } from '@company/zoho-connector';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { IGenericPDFgenerator } from '../GenericPDFgenerator';

const toEUR = (value: number) => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
};

export type MeasureModulesListMapper = (params: {
  quote: Quote;
  client: ClientPDF;
}) => MeasureModulesListPDF;

@Injectable()
export class MeasureModulesListSerivce implements IGenericPDFgenerator {
  templateId = 'MEASURE_MODULE_LIST.';
  constructor(private readonly restService: ZohoInternalConnectorService) {}

  mapper(params: { quote: Quote; client: ClientPDF }): MeasureModulesListPDF {
    const modules: Module[] = params.quote.Quoted_Items!.map((item) => {
      const teachingDays =
        params.quote.educationTimeKind === 'Vollzeit'
          ? item.Unterrichtseinheiten / 8
          : item.Unterrichtseinheiten / 4;
      return {
        number: item.module_number,
        price: toEUR(item.List_Price),
        teachingDays: teachingDays,
        teachingUnits: item.Unterrichtseinheiten,
        title: item.product_title,
      };
    });

    const measureSheet: ModulesListDTO = {
      number: params.quote.measureNumber,
      modules: modules,
    };
    return {
      client: params.client,
      quote: params.quote,
      modulesList: measureSheet,
    };
  }

  async getQuoteContact(quoteContactId?: string): Promise<ClientPDF> {
    if (!quoteContactId) {
      throw new HttpException(
        'Quote contact ID is required',
        HttpStatus.BAD_REQUEST
      );
    }
    const resp = await this.restService.getById<Contact>({
      module: 'Contacts',
      id: quoteContactId,
      params: {
        fields: [
          'First_Name',
          'Last_Name',
          'Full_Name',
          'Email',
          'Salutation',
          'Mailing_Zip',
          'Mailing_Street',
          'Mailing_City',
        ],
      },
    });

    const client: ClientPDF = {
      email: resp.Email || '',
      firstName: resp.First_Name || '',
      lastName: resp.Last_Name || '',
      salutation: resp.Salutation || '',
      fullName: resp.Full_Name || '',
      plz: resp.Mailing_Zip || '',
      city: resp.Mailing_City || '',
      address: resp.Mailing_Street || '',
    };
    console.log('client', client);
    return client;
  }

  async dataFetcher(
    quoteId: string
  ): Promise<{ quote: Quote; client: ClientPDF }> {
    const quote: Quote = await this.restService.getById<Quote>({
      module: 'Quotes',
      id: quoteId,
    });
    const client = await this.getQuoteContact(quote.Contact_Name?.id);
    return { quote, client };
  }

  setFileName = (pdfContent: Buffer, data: MeasureModulesListPDF): string => {
    return (
      data.quote.id +
      '_' +
      data.client.firstName +
      '_' +
      data.client.lastName +
      '_' +
      new Date().toLocaleDateString('de-DE') +
      '_' +
      new Date().toLocaleTimeString('de-DE')
    );
  };

  uploadToZoho = async (
    pdfContent: Buffer,
    data: MeasureModulesListPDF,
    fileName: string
  ): Promise<any> => {
    return await this.restService.uploadAttachment({
      module: 'Quotes',
      id: data.quote.id,
      rawBody: pdfContent,
      fileName: fileName,
      deleteExisting: true,
    });
  };

  async handleGeneration(fileContent: Buffer, data: PDFData<any>) {
    const fileName = this.setFileName(fileContent, data);
    this.uploadToZoho(fileContent, data, fileName);
  }
}
