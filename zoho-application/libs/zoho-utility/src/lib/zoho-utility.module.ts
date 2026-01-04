import { Module } from '@nestjs/common';
import { ZohoUtilityService } from './zoho-utility.service';
import { AirtableLibModule } from '@company/airtable-lib';
import { ZohoInternalConnectorModule } from '@company/zoho-connector';

@Module({
  imports: [AirtableLibModule, ZohoInternalConnectorModule],
  controllers: [],
  providers: [ZohoUtilityService],
  exports: [ZohoUtilityService],
})
export class ZohoUtilityModule {}
