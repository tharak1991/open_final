import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { InvoiceService } from '../../service/invoice.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import * as _ from "lodash";
import { CustomValidators } from 'ng2-validation';
import { User } from './../../model/invoice.model';
import { DatePipe } from '@angular/common';

declare let mixpanel: any;
declare let Intercom: any;

@Component({
  selector: 'app-recievables-by-contact',
  templateUrl: './recievables-by-contact.component.html',
  styleUrls: ['./recievables-by-contact.component.css'],
  providers: [InvoiceService, DatePipe]
})
export class RecievablesByContactComponent implements OnInit {

  status: any[] = [];
  data: any = [];
  previous = '';
  next = '';
  current_page = 0;
  total_pages = 0;
  contacts_id = '';
  bydate = 1;
  selected_recievable_type = '1';
  public contact_data: any = [];
  public meta: any = [];
  public routes: any = [];

  y: any;
  public TableDataLoader = '';
  public warning_message = '';
  public hideWarningClass = 'clickHide';
  public submitType: string;
  public beneficiary_name_dwnl = '';
  public crossButton = false;
  public range_start = '';
  public range_end = '';
  public range_due_start = '';
  public range_due_end = '';
  prevent = true;
  filter_toggle = '';
  loader_status = false;
  http_message = "";
  public user: User // our model
  public companies_id;
  public accounts_id;
  public loaderClassPopup = "";
  public inv_attachments: any = [];
  public inv_reminder_attachments: any = [];
  public invoice_data: any = []; // current_invoice_data
  public inv_contact_data: any = []; //current_invoice_data
  public stopRecurrence: boolean = false;
  public invoice_frequency: any = []; //current_invoice_data
  public downloadData: any;
  public allocatedAmtTagged: boolean = false;
  public inv_download_link = "";
  public errorAmt: string = '';
  public errorAmtOffline: any = '';
  public toggle_classTips = "";
  public markPaymentdata: any = [];
  public totalAmtForMarkPayment: number = 0;
  public totalAmtForMarkPaymentOffline: number = 0;
  public externalPaymentData: any = [];
  public markPaymentType: string = "online";
  public showMarkPopup: boolean = false;
  public modeofpayment = [];

  public contact_email_id: string = "";
  public tagged_amt: any;

  public sendReminderSubj: string = "";
  public sendReminderBody: string = "";

  @ViewChild('closePaymentDetail') closePaymentDetail: ElementRef;
  @ViewChild('cancelPaymentModel') cancelPaymentModel: ElementRef;
  @ViewChild('closeUpdatePayment') closeUpdatePayment: ElementRef;
  @ViewChild('cancelSchedulPayment') cancelSchedulPayment: ElementRef;
  @ViewChild('cancelRecurringPayment') cancelRecurringPayment: ElementRef;
  @ViewChild('markPayment') markPayment: ElementRef;
  @ViewChild('closeMarkPaymentModal') closeMarkPaymentModal: ElementRef;
  @ViewChild('sendreminderopen') sendreminderopen: ElementRef;
  @ViewChild('sendreminderclose') sendreminderclose: ElementRef;
  @ViewChild('cancelInvoiceopen') cancelInvoiceopen: ElementRef;
  @ViewChild('cancelInvoiceclose') cancelInvoiceclose: ElementRef;
  @ViewChild('stopRecurringInvoiceopen') stopRecurringInvoiceopen: ElementRef;
  @ViewChild('stopRecurringInvoiceclose') stopRecurringInvoiceclose: ElementRef;
  @ViewChild('openmarkconfirm') openmarkconfirm: ElementRef;
  @ViewChild('cancelmarkconfirm') cancelmarkconfirm: ElementRef;



  filter_form = new FormGroup({
    beneficiary_name: new FormControl(''),
    start_date: new FormControl(''),
    end_date: new FormControl(''),
    amount: new FormControl(''),
    total_receivable: new FormControl(''),
    outstanding: new FormControl(''),
    greater_than: new FormControl(''),
    recievable_type: new FormControl(''),
    status_id: new FormControl(''),
    bydate: new FormControl('')
  });

  sendReminder = new FormGroup({
    login: new FormControl('', [Validators.required]),
    email_subject: new FormControl('', [Validators.required]),
    email_body: new FormControl('', [Validators.required])
  });

  markPaymentOfflineForm = new FormGroup({
    paid_at: new FormControl('', [Validators.required]),
    mode_of_payment: new FormControl('', [Validators.required]),
    remarks: new FormControl(''),
    invoice_amount_tagged: new FormControl('', [Validators.required])
  });
  constructor(private _httpService: InvoiceService, private router: Router, private datePipe: DatePipe, private _router: ActivatedRoute) {
    var currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.companies_id = currentUser && currentUser.company_details.companies_id;
    this.accounts_id = currentUser && currentUser.account_details.accounts_id;
    this.status.push({ label: 'Pending', value: 1 });
    this.status.push({ label: 'Payment Due', value: 2 });
    this.status.push({ label: 'Paid', value: 3 });
    this.status.push({ label: 'Partially Paid', value: 4 });
    this.status.push({ label: 'Overdue', value: 5 });
    this.status.push({ label: 'Cancelled', value: 6 });

    this.routes.push({ label: 'New Request', value: 0 });
    this.routes.push({ label: 'Create Invoice ', value: 1 });
    this.routes.push({ label: 'Quick Collects', value: 2 });
    this.routes.push({ label: 'Bulk Collects', value: 3 });

    const date = new Date(); this.y = date.getFullYear();
  }

  ngOnInit() {
    this.getQuickCollectsByContact();
  }
  getQuickCollectsByContact() {
    this.TableDataLoader = 'addLoader';
    const sub = this._router.params.forEach((params: Params) => {
      this.contacts_id = params['id'];
      this._httpService.getQuickCollectsByContact(this.contacts_id)
        .subscribe((result) => {

          if (result.status === 200) {
            this.data = [];
            this.contact_data = result.data[0].contact.data;
            this.meta = result.meta;
            if (result.data.length > 0) {
              this.generat_page(result);
            }
            this.TableDataLoader = '';
          }
        }, (err: any) => {
          this.TableDataLoader = '';
          this.errorHandle(err);
        }, () => console.log());
    });

  }
  submitName(type) {
    this.submitType = type;
  }

  submitFilter() {
    this.TableDataLoader = 'addLoader';
    let data = this.filter_form.value;
    let beneficiary_name = '';
    if (this.filter_form.value.beneficiary_name === '') {
      beneficiary_name = '';
    } else if (this.filter_form.value.beneficiary_name !== '') {
      beneficiary_name = this.filter_form.value.beneficiary_name;
    }
    if (typeof beneficiary_name === 'undefined') {
      beneficiary_name = this.filter_form.value.beneficiary_name;
    }


    if (this.submitType === '1') {
      data = {
        'recepient_name': beneficiary_name,
        'amount': '',
        'invoice_date_from': '',
        'invoice_date_to': '',
        'due_date_from': '',
        'due_date_to': '',
        'invoices_statuses_id': '',
        'invoice_types_id': '',
        'limit': 10
      }
    } else if (this.submitType === '2') {
      let invoice_date_from = '';
      let invoice_date_to = '';
      let due_date_from = '';
      let due_date_to = '';

      if (this.filter_form.value.start_date !== '' && this.filter_form.value.start_date != null) {
        this.range_start = this.datePipe.transform(this.filter_form.value.start_date, 'yyyy-MM-dd') + ' 00:00:00';
      } else {
        this.range_start = '';
      }

      if (this.filter_form.value.end_date !== '' && this.filter_form.value.end_date != null) {
        this.range_end = this.datePipe.transform(this.filter_form.value.end_date, 'yyyy-MM-dd') + ' 11:59:59';
      } else {
        this.range_end = '';
      }

      if (this.bydate === 1) {
        invoice_date_from = this.range_start;
        invoice_date_to = this.range_end;
      } else {
        due_date_from = this.range_start;
        due_date_to = this.range_end;
      }

      data = {
        'recepient_name': beneficiary_name,
        'amount': this.filter_form.value.amount,
        'invoice_date_from': invoice_date_from,
        'invoice_date_to': invoice_date_to,
        'due_date_from': due_date_from,
        'due_date_to': due_date_to,
        'invoices_statuses_id': this.filter_form.value.status_id,
        'invoice_types_id': this.filter_form.value.recievable_type,
        'limit': 10
      };
    }


    this._httpService.serchreceivables(data)
      .subscribe((result) => {
        this.TableDataLoader = '';
        this.crossButton = true;
        if (result.status = 200) {

          // mixpanel.track('payment-listing-search-performed',data);
          // Intercom('trackEvent','payment-listing-search-performed',data);

          this.generat_page(result);
          this.filter_toggle = '';
        }
        this.hideWarningClass = 'clickHide';
      }, (err: any) => {
        this.crossButton = false;

        this.TableDataLoader = '';
        this.errorHandle(err);
      }, () => console.log())
  }

  setRecepientName(event) {
    this.beneficiary_name_dwnl = event.target.value;
  }
  refresh_local_variable_form() {
    this.filter_form.reset();
    this.filter_form.controls.beneficiary_name.setValue(this.beneficiary_name_dwnl);
  }

  refresh_local_variable(type) {
    this.filter_form.reset();
    this.crossButton = false;
    this.TableDataLoader = 'addLoader';
    this.data = [];
    this.getQuickCollectsByContact();
  }
  changeRoute(event) {
    switch (event.value) {
      case 1:
        this.hrefClick('create-invoice-btn-clicked');
        this.router.navigate(['/create-invoice']);
        break;
      case 2:
        this.router.navigate(['/receive/quick_collect_request']);
        break;
      case 3:
        this.router.navigate(['/receive/bulk_collects']);
        break;
    }
  }

  toggleFilter() {
    if (this.filter_toggle === '') {
      this.filter_toggle = 'boxDisplayBlock';
    } else {
      this.filter_toggle = '';
    }
  }
  preventFn() {
    this.prevent = false;
  }

  clickedInside($event: Event) {
    if (this.prevent) {
      $event.preventDefault();
      $event.stopPropagation();  // <- that will stop propagation on lower layers
      // console.log("CLICKED INSIDE, MENU WON'T HIDE");
    } else {
      // this.prevent =true;
    }
  }

  @HostListener('document:click', ['$event']) clickedOutside($event) {
    // console.log("CLICKED OUTSIDE");
    if (this.prevent) {
      this.filter_toggle = '';
    }
  }

  download() {
    // let url  = this._httpService.download();
    // window.open(url, '_blank').focus();
  }

  change_page(url) {
    this.TableDataLoader = 'addLoader';
    this._httpService.GetPage(url)
      .subscribe((result) => {
        if (result.status === 200) {
          this.generat_page(result);
        }
      }, (err: any) => {
        this.TableDataLoader = '';
        this.errorHandle(err);
      }, () => console.log());
  }

  generat_page(result) {
    this.data = result.data;
    this.current_page = result.meta.pagination.current_page;
    this.total_pages = result.meta.pagination.total_pages;

    if (result.meta.pagination.links.hasOwnProperty('previous')) {
      this.previous = result.meta.pagination.links.previous;
    } else {
      this.previous = '';
    }

    if (result.meta.pagination.links.hasOwnProperty('next')) {
      this.next = result.meta.pagination.links.next;
    } else {
      this.next = '';
    }

    this.TableDataLoader = '';

  }

  successLoader(message) {
    this.loader_status = true;
    this.http_message = message;
    setTimeout(() => {
      this.loader_status = false;
    }, 5000);
  }

  // error handler
  errorHandle(err) {
    this.hideWarningClass = '';
    if (err.status === 0) {
      this.warning_message = 'Please check your internet connection'
      return;
    } else if (err.status === 500) {
      // this.warning_message = 'server error';
    } else if (err.status === 422) {
      // this.warning_message = 'some validation error';
    } else if (err.status === 401) {
      this.router.navigate(['/logout']);
    }
    this.warning_message = JSON.parse(err._body).message;
  }
  hideWarning() {
    this.hideWarningClass = 'clickHide';
  }

  hrefClick(data) {
    mixpanel.track(
      data,
      { 'menu': 'click' }
    );
    Intercom('trackEvent', data);
  }

  valid_email = true;
  check_email(event) {
    if (event.target.value != '') {
      let regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      var emails = event.target.value.split(",");
      for (var i = 0; i < emails.length; i++) {
        if (emails[i] == "" || !regex.test(emails[i])) {
          this.valid_email = false;
          return;
        } else {
          this.valid_email = true;
        }
      }
    } else {
      this.valid_email = true;
    }
  }

  toggleTipsMark() {
    if (this.toggle_classTips == "") {
      this.toggle_classTips = "width-900";
    } else {
      this.toggle_classTips = "";
    }
  }
  //START------------------------Hover on invoice dropdown by $$DJ$$----------------//

  changeMarkPaymentType(type) {
    this.markPaymentType = type;
  }

  OnClickSendReminder(payment) {
    if (payment.invoice_statuses_id != 6) {
      this.invoice_data = payment;
      //console.log(this.invoice_data);
      this.contact_email_id = this.invoice_data.contact.data.email_id;
      this.sendReminderSubj = "Payment Reminder:" + this.invoice_data.invoice_sequence_id;
      let due_date = this.datePipe.transform(this.invoice_data.due_date, 'dd-MM-yyyy');
      this.sendReminderBody = `Dear ${this.invoice_data.contact.data.name},\nThis is gentle payment reminder for Invoice number ${this.invoice_data.invoice_sequence_id} which is due on ${due_date}. \nRequest you to process the payment on or before the due date.\nWarm Regards,`;
      this.sendReminder.controls['email_body'].patchValue(this.sendReminderBody);
      this.inv_reminder_attachments = this.inv_attachments = this.invoice_data.document_proof_files.data;
      this.sendreminderopen.nativeElement.click();
    }
  }

  onSubmitSendReminder() {
    this.loaderClassPopup = "addLoader";
    let data = this.sendReminder.value;
    data.accounts_id = this.accounts_id;
    data.companies_id = this.companies_id;
    data.invoices_id = this.invoice_data.id
    data.files_id = [];
    this._httpService.sendInvoice(data)
      .subscribe((result) => {
        if (result.status == 200) {
          this.loaderClassPopup = "";
          this.sendreminderclose.nativeElement.click();
          this.successLoader("Reminder sent successfully.")
        }
      }, (err: any) => {
        this.sendreminderclose.nativeElement.click();
        this.errorHandle(err);
      }, () => console.log());

  }

  OnClickMarkPayment(payment) {
    this.showMarkPopup = true;
    this.markPaymentdata = payment;
    let data = {
      "id": this.markPaymentdata.contact.data.id
    }
    this._httpService.getExternalPayment(data)
      .subscribe((result) => {
        this.externalPaymentData = result.data;
        for (let j = 0; j < result.data.length; j++) {
          this.user.allocated_amt_tagged[j] = 0;
        }
      }, (err: any) => {
        this.errorHandle(err);
      }, () => console.log());
    setTimeout(() => { this.markPayment.nativeElement.click(); }, 500)
  }

  calculateAllocatedAmtOffline(total, current_text_value) {
    if (current_text_value == '') current_text_value = 0;
    if (+current_text_value > total) {
      this.errorAmtOffline = current_text_value;
    } else {
      this.totalAmtForMarkPaymentOffline = current_text_value;
      this.errorAmtOffline = '';
    }
  }

  calculateAllocatedAmt(total, current_data, current_text_value = 0) {
    let sum = this.user.allocated_amt_tagged.reduce((a, b) => a + b, 0);
    if (sum > total) {
      this.errorAmt = sum;
    } else {
      this.totalAmtForMarkPayment = sum;
      this.errorAmt = '';
    }
    if (current_text_value > current_data.balance_amount_to_be_tagged) {
      this.allocatedAmtTagged = true;
    } else {
      this.allocatedAmtTagged = false;
    }
  }

  closeModalMarkPayment() {
    this.errorAmt = '';
    this.errorAmtOffline = '';
    this.totalAmtForMarkPayment = 0;
    this.totalAmtForMarkPaymentOffline = 0;
    this.allocatedAmtTagged = false;
    this.markPaymentOfflineForm.reset();
    this.closeMarkPaymentModal.nativeElement.click();
  }

  confirmMarkpayment(confirm_type) {
    if (confirm_type == 'online') {
      this.cancelmarkconfirm.nativeElement.click();
      this.loaderClassPopup = "addLoader";
      let i = 0;
      var today = new Date();
      let date2 = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
      this.externalPaymentData.forEach(element => {
        let data = {
          "external_payments_id": element.external_payments_id,
          "invoices_id": this.markPaymentdata.id,
          "contacts_id": element.contacts_id,
          "accounts_id": this.accounts_id,
          "companies_id": this.companies_id,
          "invoice_amount_tagged": this.tagged_amt[i],
          "is_offline": 0,
          "mode_of_payment": element.mode_of_transfer,
          "paid_at": date2
        }
        if (data.invoice_amount_tagged != 0 && data.invoice_amount_tagged > 0) {
          this._httpService.markPayment(data)
            .subscribe((result) => {
              if (result.status == 200) {
                setTimeout(() => {
                  this.loaderClassPopup = "";
                  this.closeMarkPaymentModal.nativeElement.click();
                  this.totalAmtForMarkPayment = 0;
                  this.totalAmtForMarkPaymentOffline = 0;
                  this.successLoader("Payment marked successfully.");
                }, 3000)
              }
            }, (err: any) => {
              this.loaderClassPopup = "";
              this.closeMarkPaymentModal.nativeElement.click();
              this.errorHandle(err);
            }, () => console.log());
        }
        i++;
      });
    }

    if (confirm_type == 'offline') {
      this.cancelmarkconfirm.nativeElement.click();
      this.loaderClassPopup = "addLoader";
      let data = this.markPaymentOfflineForm.value;
      data.paid_at = this.datePipe.transform(data.paid_at, 'yyyy-MM-dd');
      data.is_offline = 1;
      data.accounts_id = this.accounts_id;
      data.companies_id = this.companies_id;
      data.contacts_id = this.markPaymentdata.contact.data.id;
      data.invoices_id = this.markPaymentdata.id;
      this._httpService.markPayment(data)
        .subscribe((result) => {
          this.closeMarkPaymentModal.nativeElement.click();
          this.totalAmtForMarkPayment = 0;
          this.totalAmtForMarkPaymentOffline = 0;
          this.markPaymentdata = [];
          this.loaderClassPopup = "";
          this.successLoader("Payment marked successfully.");
        }, (err: any) => {
          this.loaderClassPopup = "";
          this.closeMarkPaymentModal.nativeElement.click();
          this.errorHandle(err);
        }, () => console.log());
    }
  }

  onSubmitMarkPayment(model: User, isValid: boolean) {
    this.tagged_amt = _.values(model);
    this.openmarkconfirm.nativeElement.click();
  }

  onSubmitMarkPaymentOffline() {
    this.openmarkconfirm.nativeElement.click();
  }

  OnClickDownloadInvoice(payment) {
    let id = payment.id;
    this._httpService.getInvoicePdf(id)
      .subscribe((result) => {
        if (result.status == 200) {
          this.inv_download_link = result.file1;
          window.open(this.inv_download_link, '_blank');
        }
      }, (err: any) => {
        this.errorHandle(err);
      }, () => console.log());
  }

  OnClickCancleInvoice(payment) {
    this.invoice_data = payment;
    this.inv_contact_data = this.invoice_data.contact.data;
    if ((this.invoice_data.invoice_statuses_id != 4 || this.invoice_data.invoice_statuses_id != 3) && this.invoice_data.invoice_statuses_id != 6) {
      this.cancelInvoiceopen.nativeElement.click();
    }
  }

  OnSubmitCancelInvoice() {
    this.loaderClassPopup = "addLoader";
    let data = {
      "invoice_statuses_id": 6
    }
    this._httpService.getCancelInvoice(data, this.invoice_data.id)
      .subscribe((result) => {
        if (result.status == 200) {
          this.invoice_data = [];
          this.loaderClassPopup = "";
          this.cancelInvoiceclose.nativeElement.click();
          this.successLoader("Invoice cancelled successfully.");
          this.getQuickCollectsByContact();
        }
      }, (err: any) => {
        this.cancelInvoiceclose.nativeElement.click();
        this.errorHandle(err);
      }, () => console.log());
  }

  OnClickStopRecurring(payment) {
    this.invoice_data = payment;
    if (this.invoice_data.invoice_types_id == 4 && this.invoice_data.invoice_statuses_id != 6 && this.invoice_data.is_recurring != 0) {
      if (this.invoice_data.hasOwnProperty('frequencies_id') && this.invoice_data.frequencies_id != null) {
        this.invoice_frequency = this.invoice_data.frequency.data;
      }
      this.stopRecurringInvoiceopen.nativeElement.click();
    }
  }

  OnSubmitStopRecurring() {
    if (this.invoice_data.invoice_types_id == 4 && this.invoice_data.is_recurring == 1) {
      this.loaderClassPopup = "addLoader";
      let data = {
        "is_recurring": 0
      }
      this._httpService.getStopRecurring(data, this.invoice_data.id)
        .subscribe((result) => {
          if (result.status == 200) {
            this.invoice_data = [];
            this.loaderClassPopup = "";
            this.stopRecurringInvoiceclose.nativeElement.click();
            this.successLoader("Invoice recurrence stopped successfully.");

          }
        }, (err: any) => {
          this.errorHandle(err);
        }, () => console.log());
    }
  }

  OnClickEmandate(data, invoice_id) {
    this.TableDataLoader = 'addLoader';
    if (data == null || data == 1) data = 0;
    let is_emandate_requested;
    if (data == 1)
      is_emandate_requested = 0;
    else
      is_emandate_requested = 1;

    this._httpService.updateInvoice({ "is_emandate_requested": is_emandate_requested }, invoice_id)
      .subscribe((result) => {
        if (result.status == 200) {
          this.getQuickCollectsByContact();
          this.loaderClassPopup = "";
          //this.successLoader("Invoice recurrence stopped successfully.");
        }
      }, (err: any) => {
        this.errorHandle(err);
      }, () => console.log());
  }

  toggleStopRecurrence(value) {
    if (value) {
      this.stopRecurrence = true;
    } else {
      this.stopRecurrence = false;
    }
  }

  //END---Hover on invoice dropdown by $$DJ$$----//


}
