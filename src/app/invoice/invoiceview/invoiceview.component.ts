import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import * as _ from "lodash";
import { User } from './../../model/invoice.model';
import { InvoiceService } from '../../service/invoice.service';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-invoiceview',
  templateUrl: './invoiceview.component.html',
  styles: [`
  .price::first-letter {
    padding-right: 0.3em;
  }
  `],
  providers: [InvoiceService, DatePipe]

})
export class InvoiceviewComponent implements OnInit {

  @ViewChild('sendreminderclose') sendreminderclose: ElementRef;
  @ViewChild('markPayment') markPayment: ElementRef;
  @ViewChild('closeMarkPaymentModal') closeMarkPaymentModal: ElementRef;
  @ViewChild('cancelInvoice') cancelInvoice: ElementRef;
  @ViewChild('cancelStopRecurring') cancelStopRecurring: ElementRef;
  @ViewChild('openmarkconfirm') openmarkconfirm: ElementRef;
  @ViewChild('cancelmarkconfirm') cancelmarkconfirm: ElementRef;

  public user: User // our model
  public companies_id;
  public accounts_id
  public sub: any;
  public invoice_data: any = [];
  public invoice_frequency: any;
  public inv_contact_data: any = [];
  public inv_contact_billing: any = [];
  public inv_item_data: any = [];
  public inv_category: any = [];
  public inv_tags: any = [];
  public inv_attachments: any = [];
  public inv_reminder_attachments: any = [];
  public modeofpayment = [];

  public inv_download_link = "";
  public InvoiceLoader = "";
  public invoice_id;
  public toggle_class = "";
  public toggle_classTips = "";
  public popupLoader = "";
  public errorAmt: string = '';
  public errorAmtOffline: any = '';
  public markPaymentType: string = "online";
  public markPaymentdata: any = [];
  public totalAmtForMarkPayment: number = 0;
  public totalAmtForMarkPaymentOffline: number = 0;
  public externalPaymentData: any = [];
  public showMarkPopup: boolean = false;
  public stopRecurrence: boolean = false;
  public allocatedAmtTagged: boolean = false;
  public loaderClassPopup = "";
  loader_status = false;
  http_message = "";
  public contact_email_id: string = "";
  public tagged_amt: any = [];
  public sendReminderSubj: string = "";
  public sendReminderBody: string = "";

  constructor(private _httpService: InvoiceService, private _router: ActivatedRoute, private router: Router, private datePipe: DatePipe) {
    var currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.companies_id = currentUser && currentUser.company_details.companies_id;
    this.accounts_id = currentUser && currentUser.account_details.accounts_id;
    this.modeofpayment.push({ label: 'Cash', value: 'cash' });
    this.modeofpayment.push({ label: 'Cheque', value: 'cheque' });
  }




  ngOnInit() {
    this.getInvoiceById();
    this.getInvoiceDowloadLink();
    this.user = {
      allocated_amt_tagged: []
    };

  }
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

  onSubmitSendReminder() {
    let data = this.sendReminder.value;
    data.accounts_id = this.accounts_id;
    data.companies_id = this.companies_id;
    data.invoices_id = this.invoice_data.id
    data.files_id = [];
    this._httpService.sendInvoice(data)
      .subscribe((result) => {
        if (result.status == 200) {
          this.sendreminderclose.nativeElement.click();
          this.successLoader("Reminder sent successfully.")
        }
      }, (err: any) => {
        this.sendreminderclose.nativeElement.click();
        this.errorHandle(err);
      }, () => console.log());

  }

  valid_email = true;
  check_email(event) {
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
  }

  getInvoiceById() {
    this.sub = this._router.params.forEach((params: Params) => {
      this.invoice_id = params['id'];
      this.InvoiceLoader = "addLoader";
      this._httpService.getInvoiceById(this.invoice_id)
        .subscribe((result) => {
          if (result.status == 200) {
            this.invoice_data = result.data;
            this.inv_contact_data = result.data.contact.data;
            this.inv_contact_billing = this.inv_contact_data.billing_address.data;
            this.inv_item_data = result.data.invoice_item.data;
            if (this.invoice_data.hasOwnProperty('income_categories')) {
              this.inv_category = this.invoice_data.income_categories.data;
            }
            if (this.invoice_data.invoice_types_id == 3) {
              if (this.invoice_data.hasOwnProperty('frequencies_id') && this.invoice_data.frequencies_id != null) {
                this.invoice_frequency = this.invoice_data.frequency.data;
              }
            }
            this.inv_tags = this.invoice_data.invoice_tags.data;
            this.sendReminderSubj = "Payment Reminder:" + this.invoice_data.invoice_sequence_id;
            let due_date = this.datePipe.transform(this.invoice_data.due_date, 'dd-MM-yyyy');
            this.sendReminderBody = `Dear ${this.invoice_data.contact.data.name},\nThis is gentle payment reminder for Invoice number ${this.invoice_data.invoice_sequence_id} which is due on ${due_date}. \nRequest you to process the payment on or before the due date.\nWarm Regards,`;
            this.sendReminder.controls['email_body'].patchValue(this.sendReminderBody);
            this.inv_reminder_attachments = this.inv_attachments = this.invoice_data.document_proof_files.data;
            this.InvoiceLoader = "";
          }
        }, (err: any) => {
          this.errorHandle(err);
        }, () => console.log());
    });
  }

  getInvoiceDowloadLink() {
    this._httpService.getInvoicePdf(this.invoice_id)
      .subscribe((result) => {
        if (result.status == 200) {
          this.inv_download_link = result.file1;
        }
      }, (err: any) => {
        this.errorHandle(err);
      }, () => console.log());
  }

  print_pdf(file) {
    var w = window.open(file); //Required full file path.
    w.print();
  }

  toggleTips() {
    if (this.toggle_class == "") {
      this.toggle_class = "showTips";
    } else {
      this.toggle_class = "";
    }
  }
  toggleTipsMark() {
    if (this.toggle_classTips == "") {
      this.toggle_classTips = "width-900";
    } else {
      this.toggle_classTips = "";
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

    for (let ep = 0; ep < this.externalPaymentData.length; ep++) {
      if (this.user.allocated_amt_tagged[ep] > this.externalPaymentData[ep].balance_amount_to_be_tagged) {
        this.allocatedAmtTagged = true;
        return;
      }
      else {
        this.allocatedAmtTagged = false;
      }
    }
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

  closeModalMarkPayment() {
    this.errorAmt = '';
    this.errorAmtOffline = '';
    this.totalAmtForMarkPayment = 0;
    this.totalAmtForMarkPaymentOffline = 0;
    this.allocatedAmtTagged = false;
    this.markPaymentOfflineForm.reset();
    this.closeMarkPaymentModal.nativeElement.click();
  }

  OnClickMarkPayment(payment) {
    this.showMarkPopup = true;
    this.markPaymentdata = payment;
    let data = {
      "id": this.inv_contact_data.id
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
                  this.closeModalMarkPayment();
                  this.successLoader("Payment marked successfully.");
                }, 3000)
              }
            }, (err: any) => {
              this.loaderClassPopup = "";
              this.closeModalMarkPayment();
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
          this.closeModalMarkPayment();
          this.markPaymentdata = [];
          this.loaderClassPopup = "";
          this.successLoader("Payment marked successfully.");
        }, (err: any) => {
          this.loaderClassPopup = "";
          this.closeModalMarkPayment();
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

  changeMarkPaymentType(type) {
    this.markPaymentType = type;
  }

  OnClickCancelInvoice() {
    this.popupLoader = "addLoader";
    let data = {
      "invoice_statuses_id": 6
    }
    this._httpService.getCancelInvoice(data, this.invoice_data.id)
      .subscribe((result) => {
        if (result.status == 200) {
          this.invoice_data = result.data;
          this.popupLoader = "";
          this.cancelInvoice.nativeElement.click();
        }
      }, (err: any) => {
        this.popupLoader = "";
        this.cancelInvoice.nativeElement.click();
        this.errorHandle(err);
      }, () => console.log());
  }

  stopRecurring() {
    if (this.invoice_data.invoice_types_id == 3 && this.invoice_data.is_recurring == 1) {
      this.popupLoader = "addLoader";
      let data = {
        "is_recurring": 0
      }
      this._httpService.getStopRecurring(data, this.invoice_data.id)
        .subscribe((result) => {
          if (result.status == 200) {
            this.invoice_data = result.data;
            this.popupLoader = "";
            this.cancelStopRecurring.nativeElement.click();
          }
        }, (err: any) => {
          this.popupLoader = "";
          this.cancelStopRecurring.nativeElement.click();
          this.errorHandle(err);
        }, () => console.log());
    }
  }

  toggleStopRecurrence(value) {
    if (value) {
      this.stopRecurrence = true;
    } else {
      this.stopRecurrence = false;
    }
  }

  //error handler
  public warning_message = "";
  public hideWarningClass = "clickHide";
  errorHandle(err) {
    this.loaderClassPopup = "";
    this.hideWarningClass = "";
    if (err.status == 0) {
      this.warning_message = "Please check your internet connection"
      return;
    }
    else if (err.status == 500) {
      //this.warning_message = 'server error'; 
    }
    else if (err.status == 422) {
      //this.warning_message = 'some validation error'; 
    }
    else if (err.status == 401) {
      this.router.navigate(['/logout']);
    }
    this.warning_message = JSON.parse(err._body).message;
  }

  successLoader(message) {
    this.loader_status = true;
    this.http_message = message;
    setTimeout(() => {
      this.loader_status = false;
    }, 5000);
  }

  hideWarning() {
    this.hideWarningClass = "clickHide";
  }
}
