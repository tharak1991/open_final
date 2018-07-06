import { Component, OnInit, HostListener } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { InvoiceService } from '../../service/invoice.service';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';

declare let mixpanel: any;
declare let Intercom: any;
@Component({
  selector: 'app-quick-collects',
  templateUrl: './quick-collects.component.html',
  styleUrls: ['./quick-collects.component.css'],
  providers: [InvoiceService, DatePipe]
})
export class QuickCollectsComponent implements OnInit {
  data: any = [];
  meta: any = Object;
  routes: any[] = [];
  filter2: any[] = [];
  status: any[] = [];

  previous = '';
  next = '';
  current_page = 0;
  total_pages = 0;

  public TableDataLoader = '';
  public warning_message = '';
  public hideWarningClass = 'clickHide';
  public submitType: string;
  public beneficiary_name_dwnl = '';
  public crossButton = false;
  prevent = true;
  filter_toggle = '';

  range_start = '';
  range_end = '';
  y: any;
  downloadData: any;

  filter_form = new FormGroup({
    beneficiary_name: new FormControl(''),
    search_type: new FormControl(''),
    id: new FormControl(''),
    amount_by: new FormControl(''),
    amount_type: new FormControl(''),
    amount: new FormControl(''),
    invoice_statuses_id: new FormControl(''),
    due_date_from: new FormControl(''),
    due_date_to: new FormControl(''),
    overdue_type: new FormControl(''),
    overdue_days: new FormControl(''),
  });
  constructor(private _httpService: InvoiceService, private router: Router, private datePipe: DatePipe) {

   this.filter2.push({ label: 'Select', value: '' });
   this.filter2.push({ label: 'Greater than', value: 1 });
   this.filter2.push({ label: 'Less than', value: 2 });
   this.filter2.push({ label: 'Equal to', value: 3 });

    this.routes.push({ label: 'New Request', value: 0 });
    this.routes.push({ label: 'Create Invoice ', value: 1 });
    this.routes.push({ label: 'Quick Collects', value: 2 });
    this.routes.push({ label: 'Bulk Collects', value: 3 });

    this.status.push({ label: 'Select', value: '' });
    this.status.push({ label: 'Pending', value: 1 });
    this.status.push({ label: 'Payment Due', value: 2 });
    this.status.push({ label: 'Paid', value: 3 });
    this.status.push({ label: 'Partially Paid', value: 4 });
    this.status.push({ label: 'Overdue', value: 5 });
    this.status.push({ label: 'Cancelled', value: 6 });

    const date = new Date(); this.y = date.getFullYear();
  }

  ngOnInit() {
    this.getQuickCollects();
  }

  getQuickCollects() {
    this.TableDataLoader = 'addLoader';
    this._httpService.getQuickCollects()
      .subscribe((result) => {
        if (result.status === 200) {
          this.data = [];
          if (result.data.length > 0) {
            this.generat_page(result);
          }
          this.TableDataLoader = '';
        }
      }, (err: any) => {
        this.TableDataLoader = '';
        this.errorHandle(err);
      }, () => console.log());
  }

  submitName(type) {
    this.submitType = type;
  }

  submitFilter() {
    this.TableDataLoader = 'addLoader';
    let data = this.filter_form.value;
    let beneficiary_name = '';
    if (this.filter_form.value.beneficiary_name === '') {
      this.beneficiary_name_dwnl = beneficiary_name = '';
    } else if (this.filter_form.value.beneficiary_name !== '') {
      this.beneficiary_name_dwnl = beneficiary_name = this.filter_form.value.beneficiary_name;
    }
    if (typeof beneficiary_name === 'undefined') {
      this.beneficiary_name_dwnl = beneficiary_name = this.filter_form.value.beneficiary_name;
    }

    if (this.submitType === '1') {
      data = {
        'recepient_name': beneficiary_name,
        'total_billed_greater': '',
        'total_billed_lesser': '',
        'total_billed_equal': '',
        'outstanding_greater': '',
        'outstanding_less': '',
        'outstanding_equal': '',
        'due_date_from': '',
        'due_date_to': '',
        'over_due_days_greater': '',
        'over_due_days_lesser': '',
        'over_due_days_equal': ''
      }
    }else if (this.submitType === '2') {

      if (this.filter_form.value.due_date_from !== '' && this.filter_form.value.due_date_from !== null) {
        this.range_start = this.datePipe.transform(this.filter_form.value.due_date_from, 'yyyy-MM-dd') + ' 00:00:00';
      }else {
        this.range_start = '';
      }

      if (this.filter_form.value.due_date_to !== '' && this.filter_form.value.due_date_to !== null) {
        this.range_end = this.datePipe.transform(this.filter_form.value.due_date_to, 'yyyy-MM-dd') + ' 11:59:59';
      }else {
        this.range_end = '';
      }
      data.due_date_from = this.range_start;
      data.due_date_to = this.range_end;
      data.recepient_name = beneficiary_name;

      if (this.filter_form.value.search_type === '1') {
        data.invoices_sequence_id = this.filter_form.value.id;
        data.receive_id = '';
      }else if (this.filter_form.value.search_type === '2') {
        data.invoices_sequence_id = '';
        data.receive_id = this.filter_form.value.search_type === '1';
      }else {
        data.invoices_sequence_id = '';
        data.receive_id = '';
      }

      if (this.filter_form.value.amount_by === '1') {
        if (this.filter_form.value.amount_type === 1) {
          data.total_billed_greater = this.filter_form.value.amount;
          data.total_billed_lesser = '';
          data.total_billed_equal = '';
        } else if (this.filter_form.value.amount_type === 2) {
          data.total_billed_lesser = this.filter_form.value.amount;
          data.total_billed_greater = '';
          data.total_billed_equal = '';
        } else if (this.filter_form.value.amount_type === 3) {
          data.total_billed_equal = this.filter_form.value.amount;
          data.total_billed_greater = '';
          data.total_billed_lesser = '';
        } else {
          data.total_billed_greater = '';
          data.total_billed_lesser = '';
          data.total_billed_equal = '';
        }
        data.outstanding_greater = '';
        data.outstanding_less = '';
        data.outstanding_equal = '';
      }else if (this.filter_form.value.amount_by === '2') {
        if (this.filter_form.value.amount_type === 1) {
          data.outstanding_greater = this.filter_form.value.amount;
          data.outstanding_less = '';
          data.outstanding_equal = '';
        } else if (this.filter_form.value.amount_type === 2) {
          data.outstanding_less = this.filter_form.value.amount;
          data.outstanding_greater = '';
          data.outstanding_equal = '';
        } else if (this.filter_form.value.amount_type === 3) {
          data.outstanding_equal = this.filter_form.value.amount;
          data.outstanding_greater = '';
          data.outstanding_less = '';
        } else {
          data.outstanding_greater = '';
          data.outstanding_less = '';
          data.outstanding_equal = '';
        }
        data.total_billed_greater = '';
        data.total_billed_lesser = '';
        data.total_billed_equal = '';
      }else {
          data.outstanding_greater = '';
          data.outstanding_less = '';
          data.outstanding_equal = '';
          data.total_billed_greater = '';
          data.total_billed_lesser = '';
          data.total_billed_equal = '';
      }

      if (this.filter_form.value.overdue_type === 1) {
        data.over_due_days_greater = this.filter_form.value.overdue_days;
        data.over_due_days_lesser = '';
        data.over_due_days_equal = '';
      } else if (this.filter_form.value.overdue_type === 2) {
        data.over_due_days_lesser = this.filter_form.value.overdue_days;
        data.over_due_days_greater = '';
        data.over_due_days_equal = '';
      } else if (this.filter_form.value.overdue_type === 3) {
        data.over_due_days_equal = this.filter_form.value.overdue_days;
        data.over_due_days_greater = '';
        data.over_due_days_lesser = '';
      } else {
        data.over_due_days_greater = '';
        data.over_due_days_lesser = '';
        data.over_due_days_equal = '';
      }
    }

    this.downloadData = data;
    // console.log(data);
    this._httpService.getQuickCollectsByFilter(data)
    .subscribe((result) => {
      this.TableDataLoader = '';
      this.crossButton = true;
      if (result.status = 200) {
        mixpanel.track('quick_collects-search-performed', data);
        Intercom('trackEvent', 'quick_collects-search-performed', data);

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
    this.getQuickCollects();
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
    }else {
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
    }else {
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
    const url  = this._httpService.quickCollectDownload(this.downloadData);
    window.open(url, '_blank').focus();
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
    this.meta = result.meta;
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
      {'menu': 'click'}
    );
    Intercom('trackEvent', data);
  }

}
