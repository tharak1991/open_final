import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { InvoiceService } from '../../service/invoice.service';
import { Router } from '@angular/router';
import * as _ from "lodash";
import { CustomValidators } from 'ng2-validation';
import { User } from './../../model/invoice.model';
import { DatePipe } from '@angular/common';
declare let mixpanel: any;
declare let Intercom: any;

@Component({
  selector: 'app-invoice_list',
  templateUrl: './invoice_list.component.html',
  styles: [`
  .price::first-letter {
    padding-right: 0.3em;
  }
  `],
  providers: [InvoiceService, DatePipe]
})
export class InvoiceListComponent implements OnInit {
  public name: string;
  public expandedItems: any;

  public user: User // our model
  public companies_id;
  public accounts_id;
  public toggle_class = "";
  public type: string = "";
  public markPaymentType: string = "online";
  public showMarkPopup: boolean = false;
  public modeofpayment = [];

  data: any = [];
  frequnecy: any = [];
  attachment_id: any = [];
  expense_category: any = [];
  payment_detail: any;
  loader_status = false;
  http_message = "";
  public inv_download_link = "";
  public errorAmt: string = '';
  public errorAmtOffline: any = '';

  public markPaymentdata: any = [];
  public totalAmtForMarkPayment: number = 0;
  public totalAmtForMarkPaymentOffline: number = 0;
  public externalPaymentData: any = [];

  public TableDataLoader = "";
  public toggle_classTips = "";
  public submitType: string;
  public range_due_start = "";
  public range_due_end = "";
  public range_start = "";
  public range_end = "";
  filter_toggle = "";
  filter: any[] = [];
  status: any[] = [];
  routes: any[] = [];
  filter2: any[] = [];
  overdue_filter: any[] = [];





  filteredCategorySingle: any[] = [];
  filteredStatusSingle: any[] = [];
  filteredCustomerSingle: any = [];

  public beneficiary_name_dwnl = "";

  previous = '';
  next = '';
  current_page = 0;
  total_pages = 0;

  public loaderClassPopup = "";
  public inv_attachments: any = [];
  public inv_reminder_attachments: any = [];
  public invoice_data: any = []; // current_invoice_data
  public inv_contact_data: any = []; //current_invoice_data
  public stopRecurrence: boolean = false;
  public invoice_frequency: any = []; //current_invoice_data
  public downloadData: any;
  public allocatedAmtTagged: boolean = false;

  public crossButton: boolean = false;
  public contact_email_id: string = "";
  public tagged_amt: any;

  public sendReminderSubj: string = "";
  public sendReminderBody: string = "";
  public meta: any = [];


  constructor(private _httpService: InvoiceService, private datePipe: DatePipe, private router: Router) {

    var currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.companies_id = currentUser && currentUser.company_details.companies_id;
    this.accounts_id = currentUser && currentUser.account_details.accounts_id;
    this.frequnecy.push({ label: 'Select Frequency Term', value: null });
    this.frequnecy.push({ label: 'Weekly', value: '1' });
    this.frequnecy.push({ label: 'Monthly', value: '2' });
    this.frequnecy.push({ label: 'Quarterly', value: '3' });
    this.frequnecy.push({ label: 'Half-Yearly', value: '4' });
    this.frequnecy.push({ label: 'Yearly', value: '5' });

    this.filter.push({ label: 'All Invoices', value: 1 });
    this.filter.push({ label: 'Last 2 Weeks', value: 2 });
    this.filter.push({ label: 'Last Month', value: 3 });
    this.filter.push({ label: 'Last 6 Monhts', value: 4 });

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

    this.filter2.push({ label: 'Select', value: '' });
    this.filter2.push({ label: 'Greater than', value: 1 });
    this.filter2.push({ label: 'Less than', value: 2 });
    this.filter2.push({ label: 'Equal to', value: 3 });


    let sp = "-";
    var date = new Date(), y = date.getFullYear(), m = date.getMonth();
    var firstDay = new Date(y, m, 1);
    var lastDay = new Date(y, m + 1, 0);
    let last_date = lastDay.getDate();
    m = m + 1; //january start with 0

    this.range_start = y + sp + m + sp + 1;
    this.range_due_start = y + sp + m + sp + 1;
    this.range_start = this.range_start;
    this.range_due_start = this.range_due_start;
    this.range_end = y + sp + m + sp + last_date;
    this.range_due_end = y + sp + m + sp + last_date;
    this.range_end = this.range_end;
    this.range_due_end = this.range_due_end;
    this.modeofpayment.push({ label: 'Cash', value: 'cash' });
    this.modeofpayment.push({ label: 'Cheque', value: 'cheque' });
  }

  //-----------ELEMENT REFERENCE VARIABLES-----------------///
  @ViewChild('getPaymentDetail') getPaymentDetail: ElementRef;
  @ViewChild('updatePayments') updatePayments: ElementRef;
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

  updatePaymentForm = new FormGroup({
    expense_categories_id: new FormControl('', [Validators.required]),
    frequnecy_id: new FormControl(''),
    purpose: new FormControl('', [Validators.required]),
    tags: new FormControl(''),
    notes: new FormControl(''),
    files_id: new FormControl(''),
    amount: new FormControl(''),
    payment_schedules_id: new FormControl(''),
    payment_date: new FormControl(''),
    start_date: new FormControl(''),
    repeat_for: new FormControl('')
  });

  filter_form = new FormGroup({
    beneficiary_name: new FormControl(''),
    email_phone: new FormControl(''),
    status_id: new FormControl(''),
    category_name: new FormControl(''),
    email_id: new FormControl(''),
    invoice_id: new FormControl(''),
    mobile_number: new FormControl('', Validators.pattern('^[789][0-9]{9}$')),
    bydate: new FormControl(''),
    byamount: new FormControl(''),
    byamount_status: new FormControl(''),
    overdue_days: new FormControl(''),

    // start_due_date: new FormControl(''),
    // end_due_date: new FormControl(''),
    // start_date: new FormControl(''),
    // end_date: new FormControl(''),
    start_date: new FormControl(''),
    end_date: new FormControl(''),
    amount: new FormControl(''),
    no_of_days: new FormControl('')
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

  ngOnInit() {
    this.getInvoices('all');
    this.user = {
      allocated_amt_tagged: []
    };
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

  getInvoices(type) {
    this.refresh_local_variable_internal_call(type);
    this.TableDataLoader = "addLoader";
    this.type = type;
    this._httpService.getAllInvoicebyType(type)
      .subscribe((result) => {
        if (result.status == 200) {
          this.data = [];
          this.meta = result.meta;
          if (result.data.length > 0) {
            this.generat_page(result);
          }
          this.TableDataLoader = "";
        }
      }, (err: any) => {
        this.TableDataLoader = "";
        this.errorHandle(err);
      }, () => console.log());
  }

  getSubRecurring(id) {
    // this._httpService.getSubRecurringInvoices(id)
    //   .subscribe((result) => {
    //     console.log(result);
    //   },
    //   (err: any) => {
    //     if (err.status == 0) { console.log('please check your internet connection'); }
    //   },
    //   () => console.log());
  }

  download() {
    // this.downloadData = {
    //   "invoice_types_id": (this.type == 'all') ? 1 : +this.type,
    //   "due_date_from": this.range_due_start,
    //   "due_date_to": this.range_due_end,
    //   "invoice_date_from": this.range_start,
    //   "invoice_date_to": this.range_end,
    //   "income_categories_id": this.filter_form.value.category_name.id,
    //   "invoice_statuses_id": this.filter_form.value.status_id,
    //   "amount": this.filter_form.value.amount,
    //   "email_id": this.filter_form.value.email_id,
    //   "mobile_number": this.filter_form.value.mobile_number,
    //   "invoice_sequence_id": this.filter_form.value.invoice_id,
    //   "recepient_name": this.beneficiary_name_dwnl
    // };

    let url = this._httpService.download(this.downloadData);
    window.open(url, '_blank').focus();
  }

  showExpendedData(data: any) {
    // console.log(data);
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

  //------------------------FILTER & SORT START ----------------//
  toggleFilter() {
    if (this.filter_toggle == '') {
      this.filter_toggle = 'boxDisplayBlock';
    } else {
      this.filter_toggle = '';
    }
  }

  prevent = true;
  preventFn() {
    this.prevent = false;
  }

  clickedInside($event: Event) {
    if (this.prevent) {
      $event.preventDefault();
      $event.stopPropagation();  // <- that will stop propagation on lower layers
      //console.log("CLICKED INSIDE, MENU WON'T HIDE");
    } else {
      //this.prevent =true;
    }
  }

  @HostListener('document:click', ['$event']) clickedOutside($event) {
    if (this.prevent) {
      this.filter_toggle = '';
    }
  }

  is_email_mobile = 1;
  check_email_mobile(event) {
    if (event == 1) {
      this.filter_form.controls.mobile_number.setValue('');
      this.filter_form.controls.invoice_id.setValue('');
    }
    if (event == 2) {
      this.filter_form.controls.email_id.setValue('');
      this.filter_form.controls.invoice_id.setValue('');
    }
    if (event == 3) {
      this.filter_form.controls.email_id.setValue('');
      this.filter_form.controls.mobile_number.setValue('');
    }
    this.is_email_mobile = event;
  }

  searchCategory(event) {
    let query = event.query;
    this._httpService.getExpenseCategorySearch(query).subscribe((result) => {
      if (result.data.length > 0) {
        this.filteredCategorySingle = [];
        this.filteredCategorySingle = result.data;
      }
    }, (err: any) => {
      this.errorHandle(err);
    }, () => console.log());
  }

  submitName(type) {
    this.submitType = type;
  }

  search(event) {
    let query = event.query;
    this._httpService.getCustomers(query).subscribe((result) => {
      if (result.data.length > 0) {
        this.filteredCustomerSingle = result.data;
      }
    }, (err: any) => {
      this.errorHandle(err);
    }, () => console.log())
  }

  submitFilter() {
    this.filter_toggle = '';
    this.TableDataLoader = "addLoader";
    let data = this.filter_form.value;

    let beneficiary_name = '';
    if (this.filter_form.value.beneficiary_name == '') {
      this.beneficiary_name_dwnl = beneficiary_name = '';
    } else if (this.filter_form.value.beneficiary_name != '') {
      this.beneficiary_name_dwnl = beneficiary_name = this.filter_form.value.beneficiary_name;
    }
    if (typeof beneficiary_name == 'undefined') {
      this.beneficiary_name_dwnl = beneficiary_name = this.filter_form.value.beneficiary_name;
    }
    if (this.submitType == '1') {

      data = {
        "invoice_types_id": this.type,
        "recepient_name": beneficiary_name,
        "due_date_from": '',
        "due_date_to": '',
        "invoice_date_from": '',
        "invoice_date_to": '',
        // "income_categories_id": '',
        "invoice_statuses_id": '',
        "byamount": '',
        "email_id": '',
        "mobile_number": '',
        "invoice_sequence_id": '',
        "over_due_days_equal": '',
        "over_due_days_greater": '',
        "over_due_days_lesser": '',
        "limit": 10
      }

    } else if (this.submitType == '2') {

      let invoice_date_from = "";
      let invoice_date_to = "";
      let due_date_from = "";
      let due_date_to = "";
      let by_amount = "";
      let by_amount_status = "";
      let prefix = "";

      if (this.filter_form.value.start_date != '' && this.filter_form.value.start_date != null) {
        this.range_start = this.datePipe.transform(this.filter_form.value.start_date, 'yyyy-MM-dd');
      } else {
        this.range_start = "";
      }

      if (this.filter_form.value.end_date != '' && this.filter_form.value.end_date != null) {
        this.range_end = this.datePipe.transform(this.filter_form.value.end_date, 'yyyy-MM-dd');
      } else {
        this.range_end = "";
      }

      if (this.filter_form.value.bydate == 1) {
        invoice_date_from = this.range_start;
        invoice_date_to = this.range_end;
      } else {
        due_date_from = this.range_start;
        due_date_to = this.range_end;
      }

      if (this.filter_form.value.byamount === '1') {
        if (this.filter_form.value.byamount_status === 1) {
          data.total_billed_greater = this.filter_form.value.amount;
          data.total_billed_lesser = '';
          data.total_billed_equal = '';
        } else if (this.filter_form.value.byamount_status === 2) {
          data.total_billed_lesser = this.filter_form.value.amount;
          data.total_billed_greater = '';
          data.total_billed_equal = '';
        } else if (this.filter_form.value.byamount_status === 3) {
          data.total_billed_equal = this.filter_form.value.amount;
          data.total_billed_greater = '';
          data.total_billed_lesser = '';
        } else {
          data.total_billed_greater = '';
          data.total_billed_lesser = '';
          data.total_billed_equal = '';
        }

      } else if (this.filter_form.value.byamount === '2') {
        if (this.filter_form.value.byamount_status === 1) {
          data.outstanding_greater = this.filter_form.value.amount;
          data.outstanding_less = '';
          data.outstanding_equal = '';
        } else if (this.filter_form.value.byamount_status === 2) {
          data.outstanding_less = this.filter_form.value.amount;
          data.outstanding_greater = '';
          data.outstanding_equal = '';
        } else if (this.filter_form.value.byamount_status === 3) {
          data.outstanding_equal = this.filter_form.value.amount;
          data.outstanding_greater = '';
          data.outstanding_less = '';
        } else {
          data.outstanding_greater = '';
          data.outstanding_less = '';
          data.outstanding_equal = '';
        }
      } else {
        data.total_billed_greater = '';
        data.total_billed_lesser = '';
        data.total_billed_equal = '';
        data.outstanding_greater = '';
        data.outstanding_less = '';
        data.outstanding_equal = '';
      }

      if (this.filter_form.value.overdue_days === 1) {
        data.over_due_days_greater = this.filter_form.value.no_of_days;
        data.over_due_days_lesser = '';
        data.over_due_days_equal = '';
      } else if (this.filter_form.value.overdue_days === 2) {
        data.over_due_days_lesser = this.filter_form.value.no_of_days;
        data.over_due_days_greater = '';
        data.over_due_days_equal = '';
      } else if (this.filter_form.value.overdue_days === 3) {
        data.over_due_days_equal = this.filter_form.value.no_of_days;
        data.over_due_days_greater = '';
        data.over_due_days_lesser = '';
      } else {
        data.over_due_days_greater = '';
        data.over_due_days_lesser = '';
        data.over_due_days_equal = '';
      }

      // if (this.filter_form.value.start_due_date != '' && this.filter_form.value.start_due_date != null) {
      //   this.range_due_start = this.datePipe.transform(this.filter_form.value.start_due_date, 'yyyy-MM-dd');
      // } else {
      //   this.range_due_start = "";
      // }

      // if (this.filter_form.value.end_due_date != '' && this.filter_form.value.end_due_date != null) {
      //   this.range_due_end = this.datePipe.transform(this.filter_form.value.end_due_date, 'yyyy-MM-dd');
      // } else {
      //   this.range_due_end = "";
      // }

      data.invoice_types_id = this.type;
      data.due_date_from = due_date_from;
      data.due_date_to = due_date_to;
      data.invoice_date_from = invoice_date_from;
      data.invoice_date_to = invoice_date_to;
      data.recepient_name = beneficiary_name;
      data.invoice_sequence_id = this.filter_form.value.invoice_id;
      data.invoice_statuses_id = this.filter_form.value.status_id;
      data.limit = 10;

      // data = {
      //   "invoice_types_id": this.type,
      //   "due_date_from": due_date_from,
      //   "due_date_to": due_date_to,
      //   "invoice_date_from": invoice_date_from,
      //   "invoice_date_to": invoice_date_to,
      //   // "income_categories_id": (this.filter_form.value.category_name) ? this.filter_form.value.category_name.id : '',
      //   "invoice_statuses_id": this.filter_form.value.status_id,
      //   "email_id": this.filter_form.value.email_id,
      //   "mobile_number": this.filter_form.value.mobile_number,
      //   "invoice_sequence_id": this.filter_form.value.invoice_id,
      //   "recepient_name": beneficiary_name,
      //   "limit": 10,
      // };
    }

    this._httpService.getInvoiceByFilter(data)
      .subscribe((result) => {
        if (result.status == 200) {
          mixpanel.track('invoice-listing-search-performed', data);
          Intercom('trackEvent', 'invoice-listing-search-performed', data);
          this.crossButton = true;
          this.TableDataLoader = "";
          this.filter_toggle = '';
          this.generat_page(result);
          this.downloadData = data;
        }
      }, (err: any) => {
        this.crossButton = false;
        this.TableDataLoader = "";
        this.filter_toggle = '';
        this.errorHandle(err);
      }, () => console.log())
  }

  refresh_local_variable(type) {
    // this.range_start = "";
    // this.range_end = "";
    // this.range_due_start = "";
    // this.range_due_end = "";
    // this.filter_form.controls.category_name.setValue("");
    // this.filter_form.controls.status_id.setValue("");
    // this.filter_form.controls.amount.setValue("");
    // this.filter_form.controls.email_id.setValue("");
    // this.filter_form.controls.mobile_number.setValue("");
    // this.filter_form.controls.invoice_id.setValue("");
    // this.filter_form.controls.beneficiary_name.setValue("");

    this.downloadData = {
      "invoice_types_id": this.type,
      "recepient_name": '',
      "due_date_from": '',
      "due_date_to": '',
      "invoice_date_from": '',
      "invoice_date_to": '',
      "income_categories_id": '',
      "invoice_statuses_id": '',
      "amount": '',
      "email_id": '',
      "mobile_number": '',
      "invoice_sequence_id": ''
    }
    this.filter_form.reset();
    this.crossButton = false;
    this.is_email_mobile = 1;
    this.filter_form.controls.email_phone.setValue(1);

    this.TableDataLoader = "addLoader";
    this.type = type;
    this._httpService.getAllInvoicebyType(type)
      .subscribe((result) => {
        if (result.status == 200) {
          this.data = [];
          if (result.data.length > 0) {
            this.generat_page(result);
          }
          this.TableDataLoader = "";
        }
      }, (err: any) => {
        this.TableDataLoader = "";
        this.errorHandle(err);
      }, () => console.log());
  }

  refresh_local_variable_form() {
    this.filter_form.reset();
    this.filter_form.controls.beneficiary_name.setValue(this.beneficiary_name_dwnl);
    this.is_email_mobile = 1;
    this.filter_form.controls.email_phone.setValue(1);
  }

  refresh_local_variable_internal_call(type) {
    this.downloadData = {
      "invoice_types_id": type,
      "recepient_name": '',
      "due_date_from": '',
      "due_date_to": '',
      "invoice_date_from": '',
      "invoice_date_to": '',
      // "income_categories_id": '',
      "invoice_statuses_id": '',
      "email_id": '',
      "mobile_number": '',
      "byamount": '',
      "over_due_days_equal": '',
      "over_due_days_greater": '',
      "over_due_days_lesser": '',
      "invoice_sequence_id": ''
    }
    this.filter_form.reset();
    this.crossButton = false;
    this.is_email_mobile = 1;
    this.filter_form.controls.email_phone.setValue(1);
  }

  setRecepientName(event) {
    this.beneficiary_name_dwnl = event.target.value;
  }

  filter_By_Month(event) {
    this.TableDataLoader = "addLoader";
    let filter_date = event.value;
    let sp = "-";
    var date = new Date(), y = date.getFullYear(), m = date.getMonth();

    if (filter_date == 1) {
      var firstDay = new Date(y, m, 1);
      var lastDay = new Date(y, m + 1, 0);
      let last_date = lastDay.getDate();
      m = m + 1; //january start with 0
      this.range_start = y + sp + m + sp + 1;
      this.range_end = y + sp + m + sp + last_date;
    } else if (filter_date == 2) {
      var days = 14; // Days you want to subtract
      var date = new Date();
      var last = new Date(date.getTime() - (days * 24 * 60 * 60 * 1000));
      this.range_start = this.datePipe.transform(last, 'yyyy-MM-dd');
      this.range_end = this.datePipe.transform(date, 'yyyy-MM-dd');
    } else if (filter_date == 3) {
      // var d = new Date();
      // var new_date = d.setMonth(d.getMonth() - 1);
      // var date = new Date(new_date), y = date.getFullYear(), m = date.getMonth();
      // var lastDay = new Date(y, m + 1, 0);
      // var firstDay = new Date(y, m, 1);
      // this.range_start =this.datePipe.transform(firstDay, 'yyyy-MM-dd');
      // this.range_end =this.datePipe.transform(lastDay, 'yyyy-MM-dd');

      var days = 30; // Days you want to subtract
      var date = new Date();
      var last = new Date(date.getTime() - (days * 24 * 60 * 60 * 1000));
      this.range_start = this.datePipe.transform(last, 'yyyy-MM-dd');
      this.range_end = this.datePipe.transform(date, 'yyyy-MM-dd');

    } else if (filter_date == 4) {
      // var d = new Date();
      // var new_date = d.setMonth(d.getMonth() - 6);
      // var date = new Date(new_date), y = date.getFullYear(), m = date.getMonth();
      // var firstDay = new Date(y, m, 1);
      // this.range_start =this.datePipe.transform(firstDay, 'yyyy-MM-dd');

      // var d = new Date();
      // var new_date = d.setMonth(d.getMonth() - 1);
      // var date = new Date(new_date), y = date.getFullYear(), m = date.getMonth();
      // var lastDay = new Date(y, m + 1, 0);
      // this.range_end =this.datePipe.transform(lastDay, 'yyyy-MM-dd');

      var days = 180; // Days you want to subtract
      var date = new Date();
      var last = new Date(date.getTime() - (days * 24 * 60 * 60 * 1000));
      this.range_start = this.datePipe.transform(last, 'yyyy-MM-dd');
      this.range_end = this.datePipe.transform(date, 'yyyy-MM-dd');
    }

    let data = {
      "invoice_types_id": this.type,
      "recepient_name": '',
      "due_date_from": '',
      "due_date_to": '',
      "invoice_date_from": this.range_start,
      "invoice_date_to": this.range_end,
      "income_categories_id": '',
      "invoice_statuses_id": '',
      "amount": '',
      "email_id": '',
      "mobile_number": '',
      "invoice_sequence_id": '',
      "limit": 10
    }

    this._httpService.getInvoiceByFilter(data)
      .subscribe((result) => {
        if (result.status == 200) {
          this.TableDataLoader = "";
          this.filter_toggle = '';
          this.generat_page(result);
        }
      }, (err: any) => {
        this.TableDataLoader = "";
        this.filter_toggle = "";
        this.errorHandle(err);
      }, () => console.log())
  }

  mysort(event) {
    // console.log(window.event)
    // console.log(window.event.bubbles);
    if (typeof window.event.bubbles != 'undefined' && window.event.bubbles == true) {
      let sortedBy = "";
      if (event.order == 1) {
        sortedBy = 'desc';
      } else {
        sortedBy = 'asc';
      }

      let beneficiary_name = '';
      if (this.filter_form.value.beneficiary_name == '') {
        this.beneficiary_name_dwnl = beneficiary_name = '';
      } else if (this.filter_form.value.beneficiary_name != '') {
        this.beneficiary_name_dwnl = beneficiary_name = this.filter_form.value.beneficiary_name;
      }
      if (typeof beneficiary_name == 'undefined') {
        this.beneficiary_name_dwnl = beneficiary_name = this.filter_form.value.beneficiary_name;
      }

      if (this.filter_form.value.start_date != '' && this.filter_form.value.start_date != null) {
        this.range_start = this.datePipe.transform(this.filter_form.value.start_date, 'yyyy-MM-dd');
      } else {
        this.range_start = "";
      }

      if (this.filter_form.value.end_date != '' && this.filter_form.value.end_date != null) {
        this.range_end = this.datePipe.transform(this.filter_form.value.end_date, 'yyyy-MM-dd');
      } else {
        this.range_end = "";
      }


      if (this.filter_form.value.start_due_date != '' && this.filter_form.value.start_due_date != null) {
        this.range_due_start = this.datePipe.transform(this.filter_form.value.start_due_date, 'yyyy-MM-dd');
      } else {
        this.range_due_start = "";
      }

      if (this.filter_form.value.end_due_date != '' && this.filter_form.value.end_due_date != null) {
        this.range_due_end = this.datePipe.transform(this.filter_form.value.end_due_date, 'yyyy-MM-dd');
      } else {
        this.range_due_end = "";
      }

      let data = {
        "invoice_types_id": this.type,
        "due_date_from": this.range_due_start,
        "due_date_to": this.range_due_end,
        "invoice_date_from": this.range_start,
        "invoice_date_to": this.range_end,
        "income_categories_id": (this.filter_form.value.category_name) ? this.filter_form.value.category_name.id : '',
        "invoice_statuses_id": this.filter_form.value.status_id,
        "amount": this.filter_form.value.amount,
        "email_id": this.filter_form.value.email_id,
        "mobile_number": this.filter_form.value.mobile_number,
        "invoice_sequence_id": this.filter_form.value.invoice_id,
        "recepient_name": beneficiary_name,
        "limit": 10,
        "page": 1,
        "orderBy": event.field,
        "sortedBy": sortedBy
      };

      //console.log(data);
      this._httpService.sortInvoices(data)
        .subscribe(
          (result) => {
            if (result.status == 200) {
              this.generat_page(result);
            }
          }, (err: any) => {
            this.errorHandle(err);
          }, () => console.log()
        );
    }
  }
  //-------------------------------FILTER & SORT END-----------------------------------// 

  updatePayment() {
    this.closePaymentDetail.nativeElement.click();
    this.updatePayments.nativeElement.click();
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
          this.getInvoices(this.type);
        }
      }, (err: any) => {
        this.cancelInvoiceclose.nativeElement.click();
        this.errorHandle(err);
      }, () => console.log());
  }

  OnClickStopRecurring(payment) {
    this.invoice_data = payment;
    if (this.invoice_data.invoice_types_id == 3 && this.invoice_data.invoice_statuses_id != 6 && this.invoice_data.is_recurring != 0) {
      if (this.invoice_data.hasOwnProperty('frequencies_id') && this.invoice_data.frequencies_id != null) {
        this.invoice_frequency = this.invoice_data.frequency.data;
      }
      this.stopRecurringInvoiceopen.nativeElement.click();
    }
  }

  OnSubmitStopRecurring() {
    if (this.invoice_data.invoice_types_id == 3 && this.invoice_data.is_recurring == 1) {
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

  toggleStopRecurrence(value) {
    if (value) {
      this.stopRecurrence = true;
    } else {
      this.stopRecurrence = false;
    }
  }

  //END---Hover on invoice dropdown by $$DJ$$----//

  //pagination start
  change_page(url) {
    this.TableDataLoader = "addLoader";
    this._httpService.GetPage(url)
      .subscribe((result) => {
        if (result.status == 200) {
          this.generat_page(result);
        }
      }, (err: any) => {
        this.TableDataLoader = "";
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
      this.previous = "";
    }

    if (result.meta.pagination.links.hasOwnProperty('next')) {
      this.next = result.meta.pagination.links.next;
    } else {
      this.next = "";
    }

    this.TableDataLoader = "";

  }

  changeRoute(event) {
    switch (event.value) {
      case 1:
        this.hrefClick('create-invoice-btn-clicked');
        this.router.navigate(['/create-invoice']);
        break;
      case 2:
        this.router.navigate(['/receive/quick_collects']);
        break;
      case 3:
        this.router.navigate(['/receive/bulk_collects']);
        break;
    }
  }

  successLoader(message) {
    this.loader_status = true;
    this.http_message = message;
    setTimeout(() => {
      this.loader_status = false;
    }, 5000);
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

  hideWarning() {
    this.hideWarningClass = "clickHide";
  }
  //error handler
  hrefClick(data) {
    mixpanel.track(
      data,
      { "menu": "click" }
    );
    Intercom('trackEvent', data);

  }
}

