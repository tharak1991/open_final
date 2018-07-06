import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { OnboardComponent } from './onboard/onboard.component';
import { ProprietershipComponent } from './onboard/proprietership.component';
import { PartnershipComponent } from './onboard/partnership.component';
import { PrivateLimitedComponent } from './onboard/private_limited.component';
import { TrustSocietiesComponent } from './onboard/trust_societies.component';
import { TransferFundComponent } from './payment/transfer_fund/transfer.component';
import { AddFundComponent } from './payment/add_fund/add_fund.component';
import { PaymentComponent } from './payment/payment.component';
import { TransferListComponent } from './payment/transfer_list/transfer_list.component';
import { WithdrawMoneyComponent } from './payment/withdraw_money/withdraw.component';
import { SendInvoiceComponent } from './invoice/send_invoice/send_invoice.component';
import { InvoiceComponent } from './invoice/create/invoice.component';
import { InvoiceEditComponent } from './invoice/edit/edit_invoice.component';
import { InvoiceListComponent } from './invoice/list/invoice_list.component';
import { LogoutComponent } from './login/logout.component';
import { TransactionsComponent } from './account/transactions/transactions';
import { InvoiceviewComponent } from './invoice/invoiceview/invoiceview.component';
import { AccountingComponent } from './accounting/accounting.component';
import { BookKeepingUncategorisedComponent } from './accounting/uncategorised/uncategorised';
import { AppsComponent } from './apps/apps.component';
import { SettingsComponent } from './settings/profile/settings.component';
import { AuthGuard } from './auth/auth.guard';
import { OnboardAuthGuard } from './auth/onboard.guard';
import { ReceivablesComponent } from './receive/receivables/receivables.component';
import { QuickCollectsComponent } from './receive/quick-collects/quick-collects.component';
import { BulkCollectsComponent } from './receive/bulk-collects/bulk-collects.component';
import { QuickCollectsRequestComponent } from './receive/quick-collects-request/quick-collects-request.component';
import { RecievablesByContactComponent } from './receive/recievables-by-contact/recievables-by-contact.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  { path: 'logout', component: LogoutComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'onboard-individual', component: OnboardComponent, canActivate: [OnboardAuthGuard] },
  { path: 'onboard-proprietership', component: ProprietershipComponent, canActivate: [OnboardAuthGuard] },  
  { path: 'onboard-partnership', component: PartnershipComponent, canActivate: [OnboardAuthGuard] },
  { path: 'onboard-private-limited', component: PrivateLimitedComponent, canActivate: [OnboardAuthGuard] },   
  { path: 'onboard-trust-or-societies', component: TrustSocietiesComponent, canActivate: [OnboardAuthGuard] },  
  { path: 'payment-transfer', component: TransferListComponent, canActivate: [AuthGuard] },
  { path: 'transfer-fund', component: TransferFundComponent, canActivate: [AuthGuard] },
  { path: 'add-fund', component: AddFundComponent, canActivate: [AuthGuard] },
  { path: 'payments', component: TransferListComponent, canActivate: [AuthGuard] },
  { path: 'withdraw-money', component: WithdrawMoneyComponent, canActivate: [AuthGuard] },
  { path: 'create-invoice', component: InvoiceComponent, canActivate: [AuthGuard] },
  { path: 'edit-invoice/:id', component: InvoiceEditComponent, canActivate: [AuthGuard] },
  { path: 'send-invoice/:id', component: SendInvoiceComponent, canActivate: [AuthGuard] },
  { path: 'invoice-detail/:id', component: InvoiceviewComponent, canActivate: [AuthGuard]},
  { path: 'transactions', component: TransactionsComponent, canActivate: [AuthGuard] },
  { path: 'apps', component: AppsComponent, canActivate: [AuthGuard] },
  { path: 'book-keeping', component: AccountingComponent, canActivate: [AuthGuard] },
  { path: 'book-keeping-uncategorised', component: BookKeepingUncategorisedComponent, canActivate: [AuthGuard] },
  { path: 'invoices', component: InvoiceListComponent, canActivate: [AuthGuard] },
  { path: 'profile-settings', component: SettingsComponent, canActivate: [AuthGuard] },
  { path: 'receive', component: ReceivablesComponent, canActivate: [AuthGuard] },
  { path: 'receive/quick_collects', component: QuickCollectsComponent, canActivate: [AuthGuard] },
  { path: 'receive/bulk_collects', component: BulkCollectsComponent, canActivate: [AuthGuard] },
  { path: 'receive/contact/:id', component: RecievablesByContactComponent, canActivate: [AuthGuard] },
  { path: 'receive/quick_collect_request', component: QuickCollectsRequestComponent, canActivate: [AuthGuard] },
  { path: 'logout', redirectTo : 'login' },
  { path: '**', redirectTo : '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
