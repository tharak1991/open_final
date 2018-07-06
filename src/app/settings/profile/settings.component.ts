import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { Router } from '@angular/router';
import { SettingService } from './../../service/settings.service'
declare let mixpanel: any;
declare let Intercom: any;

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  providers: [SettingService]

})
export class SettingsComponent implements OnInit {

  public companies_id;
  public accounts_id;
  public users_id;

  constructor(private _httpService: SettingService, private _router: Router) {
    var currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.companies_id = currentUser && currentUser.company_details.companies_id;
    this.accounts_id = currentUser && currentUser.account_details.accounts_id;
    this.users_id = currentUser && currentUser.data.data.users_id;
  }

  public profile_setting: any = [];
  public profile_setting_address: any = [];
  public error: string = "";
  public tax_and_compliance: boolean = false;
  public invoice_detail: boolean = false;
  public loaderClassLogo: string = "";
  public loaderClassT = "";
  public loaderClassI = "";

  public password = new FormControl('', [Validators.required, Validators.pattern('(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{8,}')]);

  @ViewChild('closePasswordChangeForm') closePasswordChangeForm: ElementRef;
  @ViewChild('changedPasswordModal') changedPasswordModal: ElementRef;
  @ViewChild('closeChangedPasswordModal') closeChangedPasswordModal: ElementRef;


  password_changed = new FormGroup({
    old_password: new FormControl('', [Validators.required]),
    new_password: this.password,
    c_password: new FormControl('', [Validators.required, CustomValidators.equalTo(this.password)])
  });

  ngOnInit() {
    this.getSettings();
  }

  getSettings() {
    this._httpService.getSettings()
      .subscribe((result) => {
        if (result.status == 200) {
         // console.log(result);
          this.profile_setting = result.data;
          this.profile_setting_address = this.profile_setting.address;
        }
      },
      (err: any) => {
        if (err.status == 0) { console.log('please check your internet connection'); }
        else if (err.status == 500) { console.log('oops something went wrong, please try again!!'); }
      },
      () => console.log());
  }

  onSubmitChangePassword() {
    let data = this.password_changed.value;
    this._httpService.changePassword({ "old_password": data.old_password, "new_password": data.c_password })
      .subscribe((result) => {
        if (result.status == 200) {
         
          mixpanel.track('settings-updated',data);
          Intercom('trackEvent','settings-updated',data);

          this.closePasswordModal();
          this.changedPasswordModal.nativeElement.click();
        }
      },
      (err: any) => {
        if (err.status == 0) { console.log('please check your internet connection'); }
        else if (err.status == 422) {
          this.error = 'Old password does not match';
        }
        else if (err.status == 500) { console.log('oops something went wrong, please try again!!'); }
      },
      () => console.log());
  }

  gotoLogin() {
    this.closeChangedPasswordModal.nativeElement.click();
    this._router.navigate(['/logout']);
  }
  closePasswordModal() {
    this.closePasswordChangeForm.nativeElement.click();
    this.password_changed.reset();
    this.error = "";
  }

  check_login() {
    this.error = "";
  }

  saveTax() {
    this.loaderClassT = "addLoader";
    let taxData = {
      "companies_id": this.companies_id,
      "company": {
        "service_tax_number": this.profile_setting.service_tax_number,
        "vat_tin_number": this.profile_setting.vat_tin_number,
        "company_gstin": (this.profile_setting.company_gstin)?this.profile_setting.company_gstin.toUpperCase():''
      }
    };
    this._httpService.updateSettings(taxData)
      .subscribe((result) => {
        if (result.status == 200) {

          mixpanel.track('settings-updated',taxData.company);
          Intercom('trackEvent','settings-updated',taxData.company);

          this.tax_and_compliance = false;
          this.loaderClassT = "";
        }
      },
      (err: any) => {
        this.tax_and_compliance = false;
        if (err.status == 0) { console.log('please check your internet connection'); }
        else if (err.status == 500) { console.log('oops something went wrong, please try again!!'); }
        this.loaderClassT = "";
      },
      () => console.log());
  }

  editTax() {
    this.tax_and_compliance = true;
  }

  saveInvoice() {
    this.loaderClassI = "addLoader";
    let invoiceData = {
      "companies_id": this.companies_id,
      "invoice": {
        "invoice_prefix": this.profile_setting.invoice_prefix,
        "number_sequence_initial_value": this.profile_setting.number_sequence_initial_value,
        "terms_and_conditions": this.profile_setting.terms_and_conditions
      }
    }
    this._httpService.updateSettings(invoiceData)
      .subscribe((result) => {
        if (result.status == 200) {

          mixpanel.track('settings-updated',invoiceData.invoice);
          Intercom('trackEvent','settings-updated',invoiceData.invoice);

          this.invoice_detail = false;
          this.loaderClassI = "";

        }
      },
      (err: any) => {
        this.invoice_detail = false;
        if (err.status == 0) { console.log('please check your internet connection'); }
        else if (err.status == 500) { console.log('oops something went wrong, please try again!!'); }
        this.loaderClassI = "";

      },
      () => console.log());
  }

  editInvoice() {
    this.invoice_detail = true;
  }

  onChangeLogo(fileInput: any) {
    this.loaderClassLogo = "addLoader";
    if (fileInput.target.files && fileInput.target.files[0]) {
      let imgSrc = fileInput.target.files[0];
      this._httpService.fileUploadOthers(imgSrc)
        .subscribe((result) => {
          if (result.status == 200) {
            this.loaderClassLogo = "";
            this.profile_setting.logo_url = result.data.url;
            this.editLogo(result.data.id);
          }
        },
        (err: any) => {
          if (err.status == 0) { console.log('please check your internet connection'); console.log(err); }
          else if (err.status == 500) { console.log('oops something went wrong, please try again!!'); }
          else if (err.status == 401) { this._router.navigate(['/login']); }
          this.loaderClassLogo = "";
        },
        () => console.log());
    }
  }

  editLogo(file_id) {
    let logoData = {
      "companies_id": this.companies_id,
      "company": {
        "files_id": file_id,
      }
    }
    this._httpService.updateSettings(logoData)
      .subscribe((result) => {
        console.log(result);
        if (result.status == 200) {

        }
      },
      (err: any) => {
        if (err.status == 0) { console.log('please check your internet connection'); }
        else if (err.status == 500) { console.log('oops something went wrong, please try again!!'); }
      },
      () => console.log());
  }

}
