import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomValidators } from 'ng2-validation';
import { InvoiceService } from '../../service/invoice.service';
import { DatePipe } from '@angular/common';

declare let mixpanel: any;
declare let Intercom: any;
@Component({
  selector: 'app-quick-collects-request',
  templateUrl: './quick-collects-request.component.html',
  styleUrls: ['./quick-collects-request.component.css'],
  providers: [InvoiceService, DatePipe]

})
export class QuickCollectsRequestComponent implements OnInit {
  public companies_id;
  public accounts_id;
  public users_id;
  loader_status = false;
  http_message = '';
  public warning_message = '';
  public hideWarningClass = 'clickHide';
  filteredCustomerSingle: any = [];
  beneficiary_data: any = Object;
  payment_schedules_id = '1';
  frequnecy: any = [];
  request_data: any;
  public toggle_class= '';
  public loaderClasssubmit= '';
  public loaderClassSubmitBeneficiery= '';


  @ViewChild('updateBeneficiarypop') updateBeneficiarypop: ElementRef;
  @ViewChild('addBeneficiarypop') addBeneficiarypop: ElementRef;
  @ViewChild('closeAddBeneficiery') closeAddBeneficiery: ElementRef;
  @ViewChild('closeUpdateBeneficiery') closeUpdateBeneficiery: ElementRef;
  @ViewChild('AddeMandate') AddeMandate: ElementRef;
  @ViewChild('closeeMandate') closeeMandate: ElementRef;

  quick_collect = new FormGroup({
    contacts_id: new FormControl('', Validators.required),
    beneficiary_name: new FormControl('', [Validators.required]),
    total_amount_due: new FormControl('', [Validators.required, Validators.pattern('[0-9]+(\.[0-9][0-9]?)?')]),
    invoice_user_input_reference_id: new FormControl(''),
    invoice_note: new FormControl(''),
    start_date: new FormControl(''),
    frequencies_id: new FormControl(''),
    repeat_for: new FormControl(''),
    is_emandate_requested: new FormControl(''),
    is_recurring: new FormControl('')
  });

  addBeneficiary = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-z ]+$'), Validators.maxLength(50)]),
      email_id: new FormControl('', [Validators.required, CustomValidators.email]),
      mobile_number: new FormControl('', [Validators.required, Validators.pattern('^[6789][0-9]{9}$')]),
  });

  updateBeneficiary = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-z ]+$'), Validators.maxLength(50)]),
    email_id: new FormControl('', [Validators.required, CustomValidators.email]),
    mobile_number: new FormControl('', [Validators.required, Validators.pattern('^[6789][0-9]{9}$')]),
  });

  constructor(private _httpService: InvoiceService, private _router: Router, private datePipe: DatePipe) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.companies_id = currentUser && currentUser.company_details.companies_id;
    this.accounts_id  = currentUser && currentUser.account_details.accounts_id;
    this.users_id = currentUser && currentUser.data.data.users_id;
  }

  ngOnInit() {
    this.getFrequencyList();
  }

  onSubmitQuickCollect() {
    this.loaderClasssubmit = 'addLoader';
    const data = this.quick_collect.value;
    data.invoice_types_id = '4';
    data.companies_id = this.companies_id;
    data.accounts_id = this.accounts_id;

    if (this.quick_collect.value.is_recurring) {
      // data.is_recurring = '1';
      data.start_date = this.datePipe.transform(this.quick_collect.value.start_date, 'yyyy-MM-dd');
      if (this.quick_collect.value.is_emandate_requested) {
        data.is_emandate_requested = 1;
      }
    }
    this.AddeMandate.nativeElement.click();
    this.request_data = data;
    return ;

    // this._httpService.quickCollectRequest(data)
    // .subscribe((result) => {
    //   mixpanel.track('quick-collect-requested', this.request_data);
    //   Intercom('trackEvent', 'quick-collect-requested', this.request_data);
    //   this.loaderClasssubmit = '';
    //   this.successLoader('Quick Collect Requested.');
    //   this.hideWarningClass = 'clickHide';
    //   setTimeout(() => {
    //     this._router.navigate(['/receive/quick_collects']);
    //   }, 2000);
    //   }, (err: any) => {
    //     this.errorHandle(err);
    //   }, () => console.log());
  }

  emandate_requested_submit(type) {
    if (type) {
      this.request_data.is_pg_enabled = 1;
    }else {
      this.request_data.is_pg_enabled = 0;
    }
    delete this.request_data.beneficiary_name;
    this._httpService.quickCollectRequest(this.request_data)
    .subscribe((result) => {
      mixpanel.track('quick-collect-requested', this.request_data);
      Intercom('trackEvent', 'quick-collect-requested', this.request_data);
      this.loaderClasssubmit = '';
      this.successLoader('Quick Collect Requested.');
      this.hideWarningClass = 'clickHide';
      this.closeeMandate.nativeElement.click();
      setTimeout(() => {
        this._router.navigate(['/receive/quick_collects']);
      }, 2000);

      }, (err: any) => {
      this.closeeMandate.nativeElement.click();
        this.errorHandle(err);
      }, () => console.log());
  }

  check_recurrence(event) {
    if (event) {
      this.quick_collect.controls['start_date'].setValidators([Validators.required]);
      this.quick_collect.controls['frequencies_id'].setValidators([Validators.required]);
      this.quick_collect.controls['repeat_for'].setValidators([Validators.required]);
      this.quick_collect.controls['is_emandate_requested'].setValidators([Validators.required]);
      this.quick_collect.updateValueAndValidity();

    } else {
      this.quick_collect.controls['start_date'].clearValidators();
      this.quick_collect.controls['start_date'].setValue('');

      this.quick_collect.controls['frequencies_id'].clearValidators();
      this.quick_collect.controls['frequencies_id'].setValue('');

      this.quick_collect.controls['repeat_for'].clearValidators();
      this.quick_collect.controls['repeat_for'].setValue('');

      this.quick_collect.controls['is_emandate_requested'].clearValidators();
      this.quick_collect.controls['is_emandate_requested'].setValue('');

      this.quick_collect.updateValueAndValidity();
    }
  }
  onSubmitAddBeneficiary() {
    this.loaderClassSubmitBeneficiery = 'addLoader';
    const data = this.addBeneficiary.getRawValue();
    data.accounts_id = this.accounts_id;
    data.companies_id = this.companies_id;
    this._httpService.createContact(data)
    .subscribe((result) => {
      this.quick_collect.patchValue({beneficiary_name: result.data});
      this.quick_collect.patchValue({contacts_id: result.data.id});
      this.loaderClassSubmitBeneficiery = '';
      this.closeAddBeneficiery.nativeElement.click();

      mixpanel.track('customer-added-successfully', this.request_data);
      Intercom('trackEvent', 'customer-added-successfully', this.request_data);

      this.successLoader('Customer added successfully');

      this.hideWarningClass = 'clickHide';
      }, (err: any) => {
      this.loaderClassSubmitBeneficiery = '';
      this.closeAddBeneficiery.nativeElement.click();
      this.errorHandle(err);
      }, () => console.log());
  }

  onSubmitUpdateBeneficiary() {
    this.loaderClassSubmitBeneficiery = 'addLoader';
    const data = this.updateBeneficiary.getRawValue();
    data.accounts_id = this.accounts_id;
    data.companies_id = this.companies_id;
    this._httpService.updateContact(data, this.beneficiary_data.id)
    .subscribe((result) => {
      this.loaderClassSubmitBeneficiery = '';
      this.closeUpdateBeneficiery.nativeElement.click();
      this.quick_collect.patchValue({contacts_id: this.beneficiary_data.id});
      this.successLoader('Beneficiery updated successfully');
      this.hideWarningClass = 'clickHide';
    }, (err: any) => {
      this.loaderClassSubmitBeneficiery = '';
      this.closeUpdateBeneficiery.nativeElement.click();
      this.errorHandle(err);
    }, () => console.log());
  }

  openBeneficiaryModal(): void {
    this.updateBeneficiarypop.nativeElement.click();
  }

  openBeneficiaryAddModal(): void {
    this.addBeneficiarypop.nativeElement.click();
  }


  getBeneficiaryDetail(event) {
    if (event.id === 'new') {
      this.quick_collect.patchValue({beneficiary_name: {}});
      this.addBeneficiary.reset();
      this.addBeneficiary.patchValue({'name': event.query});
      this.openBeneficiaryAddModal();
    }else if (event.email_id === '' || event.email_id === null || event.mobile_number === '' || event.mobile_number == null) {
     this.beneficiary_data = event;
     this.openBeneficiaryModal();
    } else {
      this.beneficiary_data = event;
      this.quick_collect.patchValue({contacts_id: event.id});
    }
  }

  search(event) {
   const query = event.query;
   this._httpService.getCustomers(query).subscribe((result) => {
     if (result.data.length > 0) {
       this.filteredCustomerSingle = result.data;
       this.filteredCustomerSingle.splice(0, 0,
        {'id': 'new', 'name': '+ Add Customer', 'query': '', 'class': 'new'});
     } else {
       this.filteredCustomerSingle = [{'id': 'new', 'name': '+ Add ' + query, 'query': query, 'class': 'new'}];
     }
     this.hideWarningClass = 'clickHide';
    }, (err: any) => {
      this.errorHandle(err);
    }, () => console.log())
  }
  errorHandle(err) {
    this.loaderClasssubmit = '';
    this.hideWarningClass = '';
    if (err.status === 0) {
    this.warning_message = 'Please check your internet connection';
      return;
    }else if (err.status === 500) {
			// this.warning_message = 'server error';
    }else if (err.status === 422) {
			// this.warning_message = 'some validation error';
    }else if (err.status === 401) {
      this._router.navigate(['/logout']);
    }
        this.warning_message = JSON.parse(err._body).message;
  }

  hideWarning() {
    this.hideWarningClass = 'clickHide';
  }
  successLoader(message) {
    this.loader_status = true;
    this.http_message = message;
    setTimeout(() => {
      this.loader_status = false;
    }, 5000);
  }
  getFrequencyList() {
    this.frequnecy = this._httpService.getFrequencyList();
  }
}
