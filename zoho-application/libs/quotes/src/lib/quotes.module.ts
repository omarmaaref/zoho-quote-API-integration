import { Module } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { QuotesController } from './quotes.controller';
import { ZohoInternalConnectorModule } from '@company/zoho-connector';
import { AirtableLibModule } from '@company/airtable-lib';
import { OpenaiLibModule } from '@company/openai-lib';
import { ZohoUtilityModule } from '@company/zoho-utility-lib';
import { HttpModule } from '@nestjs/axios';
import { QualificationPlanModule } from '@company/qualification-plan-lib';
import { SelfPaidQuotesService } from './quotes.selfpaid.service';
import { QuotesHelperService } from './quotes.helper.service';

@Module({
  imports: [
    HttpModule,
    QualificationPlanModule,
    ZohoInternalConnectorModule,
    AirtableLibModule,
    ZohoUtilityModule,
    OpenaiLibModule,
  ],
  controllers: [QuotesController],
  providers: [QuotesService, SelfPaidQuotesService, QuotesHelperService],
  exports: [QuotesService],
})
export class QuotesModule {}
