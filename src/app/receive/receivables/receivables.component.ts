import { Component, OnInit, HostListener } from '@angular/core';
import { InvoiceService } from '../../service/invoice.service';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';

declare let mixpanel: any;
declare let Intercom: any;
@Component({
  selector: 'app-receivables',
  templateUrl: './receivables.component.html',
  styleUrls: ['./receivables.component.css'],
  providers: [InvoiceService, DatePipe]
})
export class ReceivablesComponent implements OnInit {
  data: any = [];
  meta: any = Object;
  previous = '';
  next = '';
  current_page = 0;
  total_pages = 0;
  page_show = false;
  page_always_show = false;
  public TableDataLoader = '';
  public warning_message = '';
  public hideWarningClass = 'clickHide';
  public submitType: string;
  public beneficiary_name_dwnl = '';
  public crossButton = false;
  prevent = true;
  filter_toggle = '';
  filter: any[]= [];
  filter2: any[] = [];
  downloadData: any;
  filter_form = new FormGroup({
    beneficiary_name: new FormControl(''),
    amount_by: new FormControl(''),
    amount_type: new FormControl(''),
    dso_type: new FormControl(''),
    start_date: new FormControl(''),
    end_date: new FormControl(''),
    amount: new FormControl(''),
    days: new FormControl('')
  });

  public range_start = '';
  public range_end = '';
  constructor(private _httpService: InvoiceService, private router: Router, private datePipe: DatePipe) {
    const sp = '-';
    const date = new Date(); const y = date.getFullYear(); let m = date.getMonth();
    const firstDay = new Date(y, m, 1);
    const lastDay = new Date(y, m + 1, 0);
    const last_date = lastDay.getDate();
    m = m + 1; // january start with 0

    this.range_start = y + sp + m + sp + 1;
    this.range_start = this.range_start + ' 00:00:00'

    this.range_end = y + sp + m + sp + last_date;
    this.range_end = this.range_end + ' 11:59:59';

    this.filter.push({label: 'FY-' + y, value: 1});
    this.filter.push({label: 'Last Month', value: 2});
    this.filter.push({label: 'Last 3 Month', value: 3});
    this.filter.push({label: 'Last 6 Monhts', value: 4});

    this.filter2.push({ label: 'Select', value: '' });
    this.filter2.push({ label: 'Greater than', value: 1 });
    this.filter2.push({ label: 'Less than', value: 2 });
    this.filter2.push({ label: 'Equal to', value: 3 });
  }

  ngOnInit() {
    this.getReceivables();
  }

  getReceivables() {
    this.TableDataLoader = 'addLoader';

    const data = {
      'range_start': this.range_start,
      'range_end': this.range_end
      // 'range_start': '2017-2-1 00:00:00',
      // 'range_end': '2018-2-1 00:00:00'
    }
    this.downloadData = data;
    this._httpService.getReceivables(data)
      .subscribe((result) => {
        this.page_show = true;
        if (result.status === 200) {
          this.data = [];
          if (result.data.length > 0) {
            this.page_always_show = true;
            this.generat_page(result);
          }
          this.TableDataLoader = '';
        }
      }, (err: any) => {
        this.page_show = true;
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
        'range_start': '',
        'range_end': '',
        'dso_greater': '',
        'dso_lesser': '',
        'dso_equal': ''
      }
    }else if (this.submitType === '2') {

      if (this.filter_form.value.start_date !== '' && this.filter_form.value.start_date !== null) {
        this.range_start = this.datePipe.transform(this.filter_form.value.start_date, 'yyyy-MM-dd') + ' 00:00:00';
      }else {
        this.range_start = '';
      }

      if (this.filter_form.value.end_date !== '' && this.filter_form.value.end_date !== null) {
        this.range_end = this.datePipe.transform(this.filter_form.value.end_date, 'yyyy-MM-dd') + ' 11:59:59';
      }else {
        this.range_end = '';
      }
      data.range_start = this.range_start;
      data.range_end = this.range_end;
      data.recepient_name = beneficiary_name;

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

      if (this.filter_form.value.dso_type === 1) {
        data.dso_greater = this.filter_form.value.days;
        data.dso_lesser = '';
        data.dso_equal = '';
      } else if (this.filter_form.value.dso_type === 2) {
        data.dso_lesser = this.filter_form.value.days;
        data.dso_greater = '';
        data.dso_equal = '';
      } else if (this.filter_form.value.dso_type === 3) {
        data.dso_equal = this.filter_form.value.days;
        data.dso_greater = '';
        data.dso_lesser = '';
      } else {
        data.dso_greater = '';
        data.dso_lesser = '';
        data.dso_equal = '';
      }

    }
    this.downloadData = data;
    this._httpService.getReceivablesByFilter(data)
    .subscribe((result) => {
      this.TableDataLoader = '';
      this.crossButton = true;
      if (result.status = 200) {
        mixpanel.track('receivables-listing-search-performed', data);
        Intercom('trackEvent', 'receivables-listing-search-performed', data);

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

  filter_By_Month(event) {
    this.TableDataLoader = 'addLoader';
    const filter_date = event.value;
    const date = new Date(), y = date.getFullYear();
    if (filter_date === 1) {
      const days = 365; // Days you want to subtract
      const last = new Date(date.getTime() - (days * 24 * 60 * 60 * 1000));
      this.range_start = this.datePipe.transform(last, 'yyyy-MM-dd');
      this.range_end = this.datePipe.transform(date, 'yyyy-MM-dd');
    } else if (filter_date === 2) {
      const days = 30; // Days you want to subtract
      const last = new Date(date.getTime() - (days * 24 * 60 * 60 * 1000));
      this.range_start = this.datePipe.transform(last, 'yyyy-MM-dd');
      this.range_end = this.datePipe.transform(date, 'yyyy-MM-dd');
    }  else if (filter_date === 3) {
      const days = 90; // Days you want to subtract
      const last = new Date(date.getTime() - (days * 24 * 60 * 60 * 1000));
      this.range_start = this.datePipe.transform(last, 'yyyy-MM-dd');
      this.range_end = this.datePipe.transform(date, 'yyyy-MM-dd');
    } else if (filter_date === 4) {
      const days = 180; // Days you want to subtract
      const last = new Date(date.getTime() - (days * 24 * 60 * 60 * 1000));
      this.range_start = this.datePipe.transform(last, 'yyyy-MM-dd');
      this.range_end = this.datePipe.transform(date, 'yyyy-MM-dd');
    }

    const data = {
      'range_start': this.range_start + ' 00:00:00',
      'range_end': this.range_end + ' 11:59:59'
    }
    this.downloadData = data;
    this._httpService.getReceivables(data)
      .subscribe((result) => {
        mixpanel.track('receivables-listing-search-performed-by-month', data);
        Intercom('trackEvent', 'receivables-listing-search-performed-by-month', data);
        this.page_show = true;
        if (result.status === 200) {
          this.data = [];
          if (result.data.length > 0) {
            this.generat_page(result);
          }
          this.TableDataLoader = '';
        }
      }, (err: any) => {
        this.page_show = true;
        this.TableDataLoader = '';
        this.errorHandle(err);
      }, () => console.log());
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
    this.getReceivables();
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
    const url  = this._httpService.receivablesDownload(this.downloadData);
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
