import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ZohoAppHardwareRentalsModule } from '@company/hardware-rentals-lib';
import { ZohoAppWelcomeEventModule } from '@company/welcome-event-lib';
import { QualificationPlanModule } from '@company/qualification-plan-lib';
import { QuotesModule } from '@company/quotes-lib';
import { MeasureModuleListModule } from '@company/measure-module-list-lib';
import { DebtorModule } from '@company/debtor-lib';
import { EnrollmentsLibModule } from '@company/enrollments-lib';
import { ContractLibModule } from '@company/contract-lib';
import { CertificatesModule } from '@company/certificates-lib';
import { ZohoAppMeasureSheetsModule } from '@company/measure-sheets-lib';

@Module({
  imports: [
    HttpModule.register({ global: true }),
    ZohoAppHardwareRentalsModule,
    ZohoAppWelcomeEventModule,
    QualificationPlanModule,
    QuotesModule,
    MeasureModuleListModule,
    DebtorModule,
    ContractLibModule,
    EnrollmentsLibModule,
    CertificatesModule,
    ZohoAppMeasureSheetsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
