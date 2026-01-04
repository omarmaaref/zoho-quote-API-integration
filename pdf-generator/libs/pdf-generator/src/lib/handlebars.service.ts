import { Injectable } from '@nestjs/common';
import Handlebars from 'handlebars';

// HandlebarsService: Compiles Handlebars templates and provides custom Handlebars helpers
@Injectable()
export class HandlebarsService {
  sectionCounter = 0;
  constructor() {
    this.registerSectionTitleHelper();
  }

  compile(hbs: string, data: any) {
    this.sectionCounter = 0;
    return Handlebars.compile(hbs)(data);
  }

  private registerSectionTitleHelper() {
    Handlebars.registerHelper('sectionTitle', (title: string) => {
      this.sectionCounter += 1;
      const safeTitle = Handlebars.escapeExpression(title);
      return new Handlebars.SafeString(`${this.sectionCounter}. ${safeTitle}`);
    });
  }
}
