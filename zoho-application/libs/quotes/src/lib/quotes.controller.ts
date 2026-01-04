import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { Roles, UserGuard } from '@company/user-lib';

@UseGuards(UserGuard)
@Controller('zoho-application/quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Roles(['zoho-application-service'])
  @Post('process')
  async processQuoteForPDFCreation(@Body() body: { quoteId: string }) {
    await this.quotesService.processQuoteForPDFCreation(body.quoteId);
  }

  @Roles(['zoho-application-service'])
  @Post('validate-measure-sheet')
  async getMeasureSheetEntries(@Body() body: { quoteId: string }) {
    return this.quotesService.updateQuotedItemsMeasureSheetData(body.quoteId);
  }

  @Roles(['zoho-application-service'])
  @Post('ang-pdf')
  async createQuote(@Body() body: { quoteId: string }) {
    return this.quotesService.handleQuoteCreation(body.quoteId);
  }
}
