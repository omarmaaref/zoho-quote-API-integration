import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import FormData from 'form-data';
import { catchError, firstValueFrom, map, of } from 'rxjs';
import fs from 'fs';
// import * as path from 'path';
import { PDFDocument, PDFPage, StandardFonts, rgb } from 'pdf-lib';
import { AxiosResponse } from 'axios';
import { CreatePdfDTO } from './pdf.dto';
import { CreatePdf, CreatePdfOptions } from './pdf.type';
import { HandlebarsService } from './handlebars.service';

@Injectable()
export class PdfGeneratorService implements OnModuleInit {
  constructor(
    private readonly httpService: HttpService,
    private handlebar: HandlebarsService
  ) {}

  async onModuleInit() {
    // DEPRECATED: Autostart for PDF-DEVELOPMENT
    // if (process.env['NODE_ENV'] === 'development') {
    //   this.debug();
    //   // also you need to enable the contoller for the "/debug" route
    // }
  }

  // for Template-Developement:
  // ==========================
  // runs the service and stores the file localy for fast response on every file change
  // simply open procects/company-api/tools/pdf-environment/debug.pdf file in vs-code.
  // this route is used by tools/convert.sh so allways keep them in sync
  async debug() {
    console.log('incoming pdf debug route');
    // 1a) load developer template "dev.hbs" via local docker NginX
    const templateURL =
      (process.env['DEV_URL'] || 'http://host.docker.internal:8080') +
      '/development/template.hbs';
    // console.log(templateURL);
    const { data: template } = await firstValueFrom(
      this.httpService.get<string>(templateURL)
    );
    // console.log(template);

    // 1b) load developer data "data.json" via local docker NginX
    const dataURL =
      (process.env['DEV_URL'] || 'http://host.docker.internal:8080') +
      '/development/data.json';

    // console.log(dataURL);
    const { data: data } = await firstValueFrom(
      this.httpService.get<{ [key: string]: any }>(dataURL)
    );

    //debug as html
    const html = this.renderTemplate(template, data);
    await fs.promises.writeFile(
      'projects/pdf-generator/tools/pdf-environment/debug.html',
      html
    );

    // console.log(data);

    // 2) template and data for debug
    const dto: CreatePdfDTO = {
      documents: [
        {
          hbsTemplate: template,
          data: data,
        },
      ],
      options: {
        paginationStartPage: 1,
        paginationStartNumber: 1,
      },
    };

    // 3) run the service
    const pdf = await this.createPDF(dto);
    if (pdf === null) return;

    // 4) DEPRECATED: store the file in the tools directory
    // const file = await fs.promises.writeFile(
    //   'projects/pdf-generator/tools/pdf-environment/debug.pdf',
    //   Buffer.from(pdf)
    // );

    return pdf;
  }

  // Creates and returns a single PDF from potentially multiple documents
  // by calling external GotenBerg multiple times.
  async createPDF(
    createPDF: CreatePdf
  ): Promise<Uint8Array<ArrayBufferLike> | null> {
    // 1) wait for ALL HbsDocuments to be converted to PDF by Gotenberg
    const response = (
      await Promise.all(
        createPDF.documents.map(async (document) => {
          // render the template
          const html = this.renderTemplate(document.hbsTemplate, document.data);

          /*await fs.promises.writeFile(
            'projects/pdf-generator/tools/pdf-environment/debug.html',
            html
          );*/
          // send to gotenberg
          return await this.gotenBerg(html);
        })
      )
    )
      // get response data or null
      .map((axios) => (axios ? axios.data : null));

    // check if any failed
    if (response.includes(null)) return null;

    // Type assert that all are fine
    const pdfs = response.filter(
      (axios): axios is NonNullable<typeof axios> => axios !== null
    );

    // 2) merge all pdfs into one
    // Creates a new PDFDocument to collect them all
    const pdfDoc = await PDFDocument.create();
    await Promise.all(
      pdfs.map(async (arrayBuffer) => {
        const pdf = await PDFDocument.load(arrayBuffer);
        const pageCount = pdf.getPageCount();
        for (let i = 0; i < pageCount; i++) {
          const [p] = await pdfDoc.copyPages(pdf, [i]);
          pdfDoc.addPage(p);
        }
      })
    );

    // 3) add page numbers
    const pdf = await this.addPageNumbers(pdfDoc, createPDF.options);

    // 4) return the pdf
    return pdf;
  }

  // convert the template from a string to a usable form
  private renderTemplate(hbs: string, data: any) {
    return this.handlebar.compile(hbs, data);
  }

  // calls external Gotenberg to create a single PDF from a single html-document
  private async gotenBerg(
    html: string
  ): Promise<AxiosResponse<ArrayBuffer, any> | null> {
    const url = process.env['GOTENBERG_URL'] + '/forms/chromium/convert/html';
    // create an empty http 'multipart/form-data' Object
    const form = new FormData();
    // add htmlContent as index.html
    form.append('files', html, 'index.html');
    // add Gotenberg settings
    form.append('preferCssPageSize', 'true');

    // send form to gotenberg:
    return firstValueFrom(
      this.httpService
        .post<ArrayBuffer, FormData>(url, form, {
          // Add the necessary headers for multipart/form-data
          headers: {
            ...form.getHeaders(),
          },
          // For receiving a binary file (PDF)
          responseType: 'arraybuffer',
        })
        .pipe(
          catchError((error) => {
            console.log('axios error: ', error);
            return of(null);
          })
        )
    );
  }

  // add pagenumbers to the combined PDF
  private async addPageNumbers(
    pdfDoc: PDFDocument,
    options?: CreatePdfOptions
  ): Promise<Uint8Array<ArrayBufferLike>> {
    // set defaults
    const defaultOptions: Required<CreatePdfOptions> = {
      paginationStartPage: 1,
      paginationStartNumber: 1,
    };
    const config = { ...defaultOptions, ...options };

    // set potential pagination offset
    const pageNumberOffset =
      config.paginationStartPage - config.paginationStartNumber;

    // total pageNumber (with respect to offset)
    const totalPages = pdfDoc.getPageCount() - pageNumberOffset;

    // include the font to get the correct width of the text
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 8;

    // for all pages
    pdfDoc.getPages().map((page, index) => {
      // do we start yet?
      if (config.paginationStartPage > index + 1) return;

      // the current page number
      const currentPageNumber = index + 1 - pageNumberOffset;

      // get the actual width of the rendered text
      const text = `${currentPageNumber} von ${totalPages}`;
      const textWidth = font.widthOfTextAtSize(text, fontSize);

      // draw pagenumbers as text with included font - aligned to the right page border
      page.drawText(text, {
        font: font,
        size: fontSize,
        x: page.getWidth() - textWidth - 73, // measures from the left
        y: 28, // measures from the bottom
      });
    });

    return await pdfDoc.save();
  }

  // DEPRECATED: developers helper
  // private async loadFile(filepath: string, options?: any): Promise<Buffer> {
  //   const file = await fs.promises.readFile(
  //     path.join(__dirname, filepath),
  //     options
  //   );
  //   return file;
  // }

  /***********
   * DEPRECATED: old stuff, will be removed
   */

  /*
  async testPDF(): Promise<ArrayBuffer | null> {
    // create a form
    const form = new FormData();

    // read template from File, compile and execute against data:
    const templateFile = await this.loadFile('views/index.hbs', {
      encoding: 'utf8',
    });
    const template = Handlebars.compile(templateFile);
    const htmlContent = template(
      data
      // // data
      // { headline: 'PDF Header / Footer Test !!!' },
    );

    // add htmlContent as index.html
    form.append('files', htmlContent, 'index.html');

    // add styles.css
    const stylesFile = await this.loadFile('public/styles.css');
    form.append('files', stylesFile, 'styles.css');

    // add headerImage
    const headerImage = await this.loadFile(
      'public/images/banner-vietnam-8259984_1920.jpg'
    );
    form.append('files', headerImage, 'header.jpg');

    // add footerImage
    const footerImage = await this.loadFile(
      'public/images/banner-leaf-7528064_1920.jpg'
    );
    form.append('files', footerImage, 'footer.jpg');

    form.append('preferCssPageSize', 'true');
    // form.append('paper-width', '8.27');
    // form.append('paper-height', '11.69');
    // form.append('margin', '0');

    // for more options see:
    // see https://docking.shipsaas.tech/getting-started/document-template/gotenbergs-metadata

    form.append('scale', '1');

    // send to gotenberg:
    const response = await firstValueFrom(
      this.httpService
        .post<ArrayBuffer>(
          'http://localhost:4000/forms/chromium/convert/html',
          form,
          {
            headers: {
              ...form.getHeaders(), // Add the necessary headers for multipart/form-data
            },
            responseType: 'arraybuffer', // For receiving a binary file (PDF)
          }
        )
        .pipe(
          catchError((error) => {
            console.log('axios error: ', error);
            return of(null);
          })
        )
    );

    if (response === null) return null;

    // store
    // const file = await fs.promises.writeFile(
    //   'projects/pdf/tools/test.pdf',
    //   Buffer.from(response.data),
    // );

    // TEST PDF
    const pdfDoc = await PDFDocument.load(response.data);
    const pages = pdfDoc.getPages();

    // on all pages
    pages.map((page, index) => {
      console.log(page.getWidth()); // 594.95996    this is A1 portrait in mm !!
      console.log(page.getHeight()); // 841.91998    this is A1 portrait in mm !!

      // add pagenumbers
      page.drawText(`${index + 1} von ${pages.length}`, {
        size: 8,
        x: page.getWidth() - 95, // from left
        y: 20, // page.getHeight() - 803,  // from bottom
      });
    });

    // console.log(pages);
    return await pdfDoc.save();

    // return response.data;
  }
  */
}
