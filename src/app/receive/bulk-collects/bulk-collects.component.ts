import { Component, OnInit, HostListener, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { InvoiceService } from '../../service/invoice.service';
import { ReceiveService } from '../../service/receive.service';
import { DatePipe } from '@angular/common';


import { Router } from '@angular/router';
declare let mixpanel: any;
declare let Intercom: any;

@Component({
  selector: 'app-bulk-collects',
  templateUrl: './bulk-collects.component.html',
  styleUrls: ['./bulk-collects.component.css'],
  providers: [InvoiceService, ReceiveService, DatePipe]
})
export class BulkCollectsComponent implements OnInit {
  data: any = [];
  status: any = [];
  filter2: any = [];
  onChangeUploadedFiles: any = [];
  previous = '';
  next = '';
  current_page = 0;
  total_pages = 0;
  successmsg = '';
  range_start = '';
  range_end = '';
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

  filter_form = new FormGroup({
    beneficiary_name: new FormControl(''),
    category_name: new FormControl(''),
    start_date: new FormControl(''),
    end_date: new FormControl(''),
    amount: new FormControl(''),
    status: new FormControl(''),
    batch_id: new FormControl(''),
    total_value: new FormControl('')
  });

  @ViewChild('closeBtn') closeBtn: ElementRef;
  @ViewChild('openMessageModel') openMessageModel: ElementRef;

  constructor(private _httpService: InvoiceService, private _httpReceive: ReceiveService,
    private router: Router, private datePipe: DatePipe) {

    this.status.push({ label: 'Select', value: '' });
    this.status.push({ label: 'Uploaded', value: 'uploaded' });
    this.status.push({ label: 'processed', value: 'processed' });
    this.status.push({ label: 'Reuploaded', value: 'reuploaded' });
    this.status.push({ label: 'Reprocessed', value: 'reprocessed' });

    this.filter2.push({ label: 'Select', value: '' });
    this.filter2.push({ label: 'Greater than', value: 1 });
    this.filter2.push({ label: 'Less than', value: 2 });
    this.filter2.push({ label: 'Equal to', value: 3 });

  }

  ngOnInit() {
    this.bulkCollectlist()
  }



  bulkCollectlist() {
    this._httpReceive.getBulkCollectList()
      .subscribe((result) => {
        this.page_show = true;
        if (result.status = 200) {
          // this.data = result.data;

          this.page_always_show = true;
          this.generat_page(result);

        }
        this.hideWarningClass = 'clickHide';
      }, (err: any) => {
        this.page_show = true;
        this.errorHandle(err);
      }, () => console.log())
  }

  submitName(type) {
    this.submitType = type;
  }

  downloadTemplate() {
    this._httpReceive.getTemplate()
      .subscribe((result) => {
        if (result.status = 200) {
          // this.generat_page(result);
          // this.filter_toggle = '';
          window.open(result.data.url, '_self');
        }
        this.hideWarningClass = 'clickHide';
      }, (err: any) => {
        this.errorHandle(err);
      }, () => console.log())
  }

  onChangeUploadfile(fileInput: any) {
    if (fileInput.target.files && fileInput.target.files[0]) {
      const imgSrc = fileInput.target.files[0];
      this._httpReceive.fileUploadOthers(imgSrc)
        .subscribe((result) => {
          this.hideWarningClass = 'clickHide';

          if (result.status === 200) {
            this.onChangeUploadedFiles[0] = result.data
          }
        },
          (err: any) => {
            this.errorHandle(err);
          },
          () => console.log());
    }
  }

  UploadBulkCollect() {
    if (this.onChangeUploadedFiles.length > 0) {
      // this.onChangeUploadedFiles.forEach(ele => {
      //   files_id.push(ele.id);
      // });
      this._httpReceive.uploadBulkCollect({ 'files_id': this.onChangeUploadedFiles[0].id })
        .subscribe((result) => {
          if (result.status = 200) {
            // this.generat_page(result);
            // this.filter_toggle = '';
            this.successmsg = result.meta.message
            this.closeUploadModel();
            this.openMessageModel.nativeElement.click();
          }
          this.hideWarningClass = 'clickHide';
        }, (err: any) => {
          this.errorHandle(err);
        }, () => console.log())
    }
  }

  closeUploadModel() {
    this.onChangeUploadedFiles = [];
    this.closeBtn.nativeElement.click();
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
        'filename': beneficiary_name,
        'batch_id': '',
        'status': '',
        'uploaded_date_from': '',
        'uploaded_date_to': '',
        'total_value_greater': '',
        'total_value_lesser': '',
        'total_value_equal': '',
        'limit': 10
      }
    } else if (this.submitType === '2') {

      if (this.filter_form.value.start_date !== '' && this.filter_form.value.start_date != null) {
        this.range_start = this.datePipe.transform(this.filter_form.value.start_date, 'yyyy-MM-dd');

      } else {
        this.range_start = '';
      }

      if (this.filter_form.value.end_date !== '' && this.filter_form.value.end_date != null) {
        this.range_end = this.datePipe.transform(this.filter_form.value.end_date, 'yyyy-MM-dd');
      } else {
        this.range_end = '';
      }


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


      data = {
        'filename': beneficiary_name,
        'uploaded_date_from': this.range_start,
        'uploaded_date_to': this.range_end,
        'batch_id': this.filter_form.value.batch_id,
        'status': this.filter_form.value.status,
        'total_value_greater': (this.filter_form.value.total_value === 1) ? this.filter_form.value.amount : '',
        'total_value_lesser': (this.filter_form.value.total_value === 2) ? this.filter_form.value.amount : '',
        'total_value_equal': (this.filter_form.value.total_value === 3) ? this.filter_form.value.amount : '',
        'limit': 10
      };
    }
    this._httpReceive.filterBulkCollection(data)
      .subscribe((result) => {
        this.TableDataLoader = '';
        this.crossButton = true;

        if (result.status = 200) {
          mixpanel.track('bulk-collect-listing-search-performed', data);
          Intercom('trackEvent', 'bulk-collect-listing-search-performed', data);
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

  bulkCollectDownloadFailed(batch_id) {
    const data = {
      'status': 'failed',
      'batch_id': batch_id
    }
    this._httpReceive.getBulkCollectDownloadFailed(data)
      .subscribe((result) => {

        if (result.status = 200) {
          window.open(result.data.url, '_self');
        }
        this.hideWarningClass = 'clickHide';
      }, (err: any) => {
        this.errorHandle(err);
      }, () => console.log())

  }

  refresh_local_variable_form() {
    this.filter_form.reset();
  }

  refresh_local_variable(type) {
    this.filter_form.reset();
    this.crossButton = false;
    // this.is_email_mobile = 1;
    this.TableDataLoader = 'addLoader';
    this._httpReceive.getBulkCollectList()
      .subscribe((result) => {
        this.page_show = true;
        if (result.status = 200) {
          this.page_always_show = true;
          this.generat_page(result);
        }
        this.hideWarningClass = 'clickHide';
      }, (err: any) => {
        this.page_show = true;
        this.errorHandle(err);
      }, () => console.log())

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

}
