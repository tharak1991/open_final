import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { CustomFormsModule } from 'ng2-validation'
import {MultiSelectModule, DataTableModule, SharedModule, ChartModule, ChipsModule, TooltipModule, DropdownModule,
  FileUploadModule, CheckboxModule, CalendarModule, ProgressBarModule, RadioButtonModule, AutoCompleteModule} from 'primeng/primeng';
import {SlimLoadingBarModule} from 'ng2-slim-loading-bar';
import { WebCamComponent } from 'ack-angular-webcam';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
// import { CookieModule } from 'ngx-cookie';
import { ChartsModule } from 'ng2-charts';
import { PdfViewerComponent } from 'ng2-pdf-viewer';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './login/logout.component';
import { RegisterComponent } from './register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { OnboardComponent } from './onboard/onboard.component';
import { ProprietershipComponent } from './onboard/proprietership.component';
import { PartnershipComponent } from './onboard/partnership.component';
import { PrivateLimitedComponent } from './onboard/private_limited.component';
import { TrustSocietiesComponent } from './onboard/trust_societies.component';
import { TransferFundComponent } from './payment/transfer_fund/transfer.component';
import { AddFundComponent } from './payment/add_fund/add_fund.component';
import { TransferListComponent } from './payment/transfer_list/transfer_list.component';
import { WithdrawMoneyComponent } from './payment/withdraw_money/withdraw.component';
import { PaymentComponent } from './payment/payment.component';
import { BaseService } from './service/base.service';
import { ConfigService } from './service/config.service';
import { AuthGuard } from './auth/auth.guard';
import { OnboardAuthGuard } from './auth/onboard.guard';
import { HeaderComponent } from './common/header/header.component';
import { SidebarComponent } from './common/sidebar/sidebar.component';
import { InvoiceListComponent } from './invoice/list/invoice_list.component';
import { InvoiceEditComponent } from './invoice/edit/edit_invoice.component';
import { SendInvoiceComponent } from './invoice/send_invoice/send_invoice.component';
import { InvoiceComponent } from './invoice/create/invoice.component';
import { TransactionsComponent } from './account/transactions/transactions';
import { InvoiceviewComponent } from './invoice/invoiceview/invoiceview.component';
import { AccountingComponent } from './accounting/accounting.component';
import { BookKeepingUncategorisedComponent } from './accounting/uncategorised/uncategorised';
import { AppsComponent } from './apps/apps.component';
import { SettingsComponent } from './settings/profile/settings.component';
import { ReceivablesComponent } from './receive/receivables/receivables.component';
import { QuickCollectsComponent } from './receive/quick-collects/quick-collects.component';
import { BulkCollectsComponent } from './receive/bulk-collects/bulk-collects.component';
import { QuickCollectsRequestComponent } from './receive/quick-collects-request/quick-collects-request.component';
import { RecievablesByContactComponent } from './receive/recievables-by-contact/recievables-by-contact.component';

@NgModule({
  declarations: [
    AppComponent, HeaderComponent, SidebarComponent,
    LoginComponent, LogoutComponent, RegisterComponent,
    DashboardComponent,
    OnboardComponent, ProprietershipComponent, PartnershipComponent, PrivateLimitedComponent, TrustSocietiesComponent,
    WebCamComponent,
    TransferFundComponent, AddFundComponent, PaymentComponent, TransferListComponent, WithdrawMoneyComponent,
    SendInvoiceComponent, InvoiceComponent, InvoiceEditComponent, InvoiceListComponent, InvoiceviewComponent,
    TransactionsComponent, PdfViewerComponent, AccountingComponent, BookKeepingUncategorisedComponent,
    AppsComponent, SettingsComponent, ReceivablesComponent, QuickCollectsComponent, BulkCollectsComponent,
    QuickCollectsRequestComponent, RecievablesByContactComponent
  ],
  imports: [DataTableModule, SharedModule,
    BrowserModule, TooltipModule, HttpModule, FormsModule, ReactiveFormsModule, CustomFormsModule, SlimLoadingBarModule.forRoot(),
    AppRoutingModule, MultiSelectModule, ChartModule, ChartsModule, DropdownModule, FileUploadModule, CheckboxModule, CalendarModule,
    ProgressBarModule, RadioButtonModule, AutoCompleteModule, ChipsModule, BrowserAnimationsModule
  ],
  providers: [AuthGuard, OnboardAuthGuard, BaseService, ConfigService],
  bootstrap: [AppComponent]
})
export class AppModule { }
