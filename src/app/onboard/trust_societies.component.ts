import { Component, OnInit, trigger, transition, style, animate, state, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { OnBoardingService } from '../service/onboard.service';
import { ConfigService } from '../service/config.service';
import { CustomValidators } from 'ng2-validation';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import DetectRTC from 'detectrtc';
declare let window: any;
declare let mixpanel: any;
declare let Intercom: any;

@Component({
  selector: 'onboard-trust_societies',
  templateUrl: './trust_societies.component.html',
  animations: [
    trigger(
      'myAnimation',
      [
        transition(
          ':enter', [
            style({ overflow: 'hidden', maxHeight: '1px', }),
            animate('700ms', style({ maxHeight: '1000px' }))
          ]
        ),
        transition(
          ':leave', [
            style({ overflow: 'hidden', maxHeight: '1000px', }),
            animate('1000ms', style({ maxHeight: '1px' }))
          ]
        )]
    )
  ],
  styles: [`.not-active {
    pointer-events: none;
    cursor: default;
    opacity:0.3;
    }`
  ],
  providers: [OnBoardingService, DatePipe]
})

export class TrustSocietiesComponent implements OnInit {

  public companies_id;
  public accounts_id;
  public users_id;
  public pan_aadhar;
  public onbord_flag = 1; //1,2,3,4
  public onbord_form_flag = 1; //1,2,3
  public update_onbord_flag = 0; //1,2,3,4
  public update_onbord_form_flag = 0; //1,2,3
  public uploadImg;
  public business = 5;
  public address_proofs_id;
  //-----------------------------------------------------------//
  public businees_type: any[] = [];
  public businees_category: any[] = [];
  public address_proof_type: any[] = [];
  public state_list: any[] = [];
  public mob_data: any = [];
  public gender = [];
  public address_proof: any = [];
  public current_address_proofs_files_id: any = [];
  public business_address_proof: any = [];
  public business_current_address_proofs_files_id: any = [];
  public captured: any = false;
  public webcam: any;
  public error: any;
  public options: any;
  public camStart = false;
  public camStatus: any;
  public pan_data: any;
  public business_pan_data: any;
  public aadhar_data_front: any;
  public aadhar_data_back: any;
  public aadhar_e_data: any;
  public business_address_data: any = '';
  //-----------------------------------------------------------//
  public aadhar_e_data_content: boolean = false;
  public is_certified: boolean = false;
  public manualSignInBtnTimeStatus: boolean = false;
  public aadhar_save: boolean = false;
  public showCurrnetAddressForm: boolean = false;
  public stakeholder_address_textarea: boolean = true;
  public showSTHStateDropDown: boolean = false; // stakeholder detail state dropdown
  public invalid_otp: boolean = false;
  public adobeIconForBusinessPan: boolean = false;
  public adobeIconForPersonalPan: boolean = false;
  public adobeIconForAadharFront: boolean = false;
  public adobeIconForAadharBack: boolean = false;
  //-----------------------------------------------------------//
  public toggle_class = "";
  public loaderClassPan = "";
  public loaderClassBusinessPan = "";
  public loaderClassFront = "";
  public loaderClassBack = "";
  public loaderClassBusinessProof = "";
  public loaderClasssubmit = "";
  public statusUploadPan = "";
  public statusUploadBusinessPan = "";
  public statusUploadBusinessProof = "";
  public statusUploadFront = "";
  public statusUploadBack = "";
  public businees_pan_file_url = "";
  public stakeholder_pan_file_url = "";
  public aadhaarcard_front_file_url = "";
  public aadhaarcard_back_file_url = "";
  public businees_address_file_url = "";
  public warning_message = "";
  public hideWarningClass = "clickHide";
  public adobeIconUrl: string = "assets/images/adobe.png";
  //-----------------------------------------------------------//
  public check_almost = 0;
  public maxDate: Date;
  //-----------------------------------------------------------//
  @ViewChild('closeBtn') closeBtn: ElementRef;
  @ViewChild('savepanBtn') savepanBtn: ElementRef;
  //-----------------------------------------------------------//

  constructor(private _config: ConfigService, private _httpService: OnBoardingService, private _router: Router, private datePipe: DatePipe) {
    this.options = {
      audio: false,
      video: true,
      width: 380,
      height: 284,
      fallbackSrc: 'fallback/jscam_canvas_only.swf'
    };
    this.gender.push({ label: 'Male', value: 'male' });
    this.gender.push({ label: 'Female', value: 'female' });
    var currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.companies_id = currentUser && currentUser.company_details.companies_id;
    this.accounts_id = currentUser && currentUser.account_details.accounts_id;
    this.users_id = currentUser && currentUser.data.data.users_id;
    this.checkCam();
    this.setMaxDate();
  }

  ngOnInit() {
    this.getMobData();
    this.businessTypes();
    this.businessCategories();
    this.addressProofTypes();
    this.getState();
  }

  setMaxDate() {
    let today = new Date();
    let month = today.getMonth();
    let year = today.getFullYear();
    this.maxDate = new Date();
    this.maxDate.setMonth(month);
    this.maxDate.setFullYear(year);
  }

  business_detail = new FormGroup({
    mob_business_types_id: new FormControl('', [Validators.required]),
    registered_business_name: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-z0-9 ]{1,100}$')]),
    brand_name: new FormControl('', [Validators.maxLength(100)]),
    gstin_number: new FormControl('', [Validators.pattern('^[0-9]{2}[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}[1-9A-Za-z]{1}[Z-z]{1}[0-9A-Za-z]{1}$')]),
    mob_business_categories_id: new FormControl('', [Validators.required])
  });


  business_detail_bupdate = new FormGroup({
    mob_business_types_id: new FormControl({ value: this.mob_data.mob_business_types_id, disabled: true }, [Validators.required]),
    registered_business_name: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-z0-9 ]{1,100}$')]),
    brand_name: new FormControl('', [Validators.maxLength(100)]),
    gstin_number: new FormControl('', [Validators.pattern('^[0-9]{2}[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}[1-9A-Za-z]{1}[Z-z]{1}[0-9A-Za-z]{1}$')]),
    mob_business_categories_id: new FormControl('', [Validators.required])
  });


  business_detail_update = new FormGroup({
    registered_business_name: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-z0-9 ]{1,100}$')]),
    business_pan: new FormGroup({
      doi: new FormControl(''),
      files_id: new FormControl(''),
      pan_number: new FormControl('', [Validators.pattern('^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$')]),
    })
  });

  stakeholder_detail = new FormGroup({
    individual_pan_first_name: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z ]+$')]),
    individual_pan_second_name: new FormControl('', [Validators.pattern('^[a-zA-Z ]+')]),
    individual_pan_last_name: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z ]+')]),
    // individual_pan_gender: new FormControl('', [Validators.required]),
    individual_pan_dob: new FormControl(''),
    individual_pan_number: new FormControl('', [Validators.required, Validators.pattern('^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$')])
  });

  stakeholder_address = new FormGroup({
    aadhaar_first_name: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z ]+'), Validators.maxLength(50)]),
    aadhaar_number: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{12}$')]),
    aadhaar_dob: new FormControl('', [Validators.required]),
    aadhaar_gender: new FormControl('', [Validators.required]),
    aadhaar_address: new FormControl('', [Validators.required]),
    aadhaar_city: new FormControl('', [Validators.required]),
    aadhaar_state: new FormControl('', [Validators.required]),
    aadhaar_pin: new FormControl('', [Validators.required]),
    is_current_address_different: new FormControl(''),
    current_address: new FormGroup({
      address_line: new FormControl(''),
      city: new FormControl(''),
      state: new FormControl(''),
      pincode: new FormControl(''),
      address_proofs_id: new FormControl('')
    }),
  });

  business_address = new FormGroup({
    address_proof: new FormGroup({
      address_proofs_id: new FormControl(''),
      files_id: new FormControl('')
    }),
    registered_address: new FormGroup({
      address_line: new FormControl('', [Validators.required]),
      city: new FormControl('', [Validators.required]),
      state: new FormControl('', [Validators.required]),
      pincode: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{6}$')])
    }),
  });

  almostDone1 = new FormGroup({
    certify: new FormControl('', [Validators.required]),
  });

  almostDone2 = new FormGroup({
    otp: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{6}$')]),
  });

  onSubmitBusinessAddress() {
    this.loaderClasssubmit = "addLoader";
    let data = this.business_address.value;
    data.companies_id = this.companies_id;
    data.accounts_id = this.accounts_id;
    data.current_step = 3;
    data.current_sub_step = 1;
    data.mob_master_id = this.mob_data.mob_master_id;
    data.operation_address = data.registered_address;
    data.address_proof.files_id = this.business_current_address_proofs_files_id;
    this._httpService.createBusinessAddress(data)
      .subscribe((result) => {
        this.hideWarningClass = "clickHide";
        if (result.status == 200) {
          mixpanel.track('address-tab-save-proceeded', data);
          Intercom('trackEvent', 'address-tab-save-proceeded', data);
          this.getMobData();
        }
      },
      (err: any) => {
        this.loaderClasssubmit = "";
        this.hideWarningClass = "";
        if (err.status != 0) { this.warning_message = JSON.parse(err._body).message; }
        if (err.status == 0) { this.warning_message = "Please check your internet connection" }
        else if (err.status == 500) { console.log('oops something went wrong, please try again!!'); }
        else if (err.status == 422) { this.error = 'some validation error'; }
        else if (err.status == 401) { this._router.navigate(['/login']); }
      },
      () => console.log());
  }

  onSubmitBusinessDetail() {
    this.loaderClasssubmit = "addLoader";
    let data = this.business_detail.value;
    data.gstin_number = data.gstin_number.toUpperCase();
    data.companies_id = this.companies_id;
    data.accounts_id = this.accounts_id;
    data.current_step = 1;
    data.current_sub_step = 1;
    this._httpService.business_details(data)
      .subscribe((result) => {
        this.hideWarningClass = "clickHide";
        if (result.status == 200) {
          mixpanel.track('business-tab-save-proceeded', data);
          Intercom('trackEvent', 'business-tab-save-proceeded', data);
          this.getMobData();
        }
      },
      (err: any) => {
        this.loaderClasssubmit = "";
        this.hideWarningClass = "";
        if (err.status != 0) { this.warning_message = JSON.parse(err._body).message; }
        if (err.status == 0) { this.warning_message = "Please check your internet connection" }
        else if (err.status == 500) { console.log('oops something went wrong, please try again!!'); }
        else if (err.status == 422) { this.error = 'some validation error'; }
        else if (err.status == 401) { this._router.navigate(['/login']); }
      },
      () => console.log());
  }

  onSubmitBusinessDetailUpdate() {
    this.loaderClasssubmit = "addLoader";
    let data = this.business_detail_update.value;

    data.business_pan.pan_number = data.business_pan.pan_number.toUpperCase();
    data.companies_id = this.companies_id;
    data.accounts_id = this.accounts_id;
    data.current_step = 1;
    data.current_sub_step = 3;
    data.business_pan.files_id = [this.business_pan_data.id];
    data.business_pan.name = data.registered_business_name;
    data.business_pan.doi = this.datePipe.transform(data.business_pan.doi, 'yyyy-MM-dd');

    let id = this.mob_data.mob_business_details.data.mob_business_details_id;
    this._httpService.business_detail_update(data, id)
      .subscribe((result) => {
        this.hideWarningClass = "clickHide";
        if (result.status == 200) {
          this.getMobData();
        }
      },
      (err: any) => {
        this.loaderClasssubmit = "";
        this.hideWarningClass = "";
        if (err.status != 0) { this.warning_message = JSON.parse(err._body).message; }
        if (err.status == 0) { this.warning_message = "Please check your internet connection" }
        else if (err.status == 500) { console.log('oops something went wrong, please try again!!'); }
        else if (err.status == 422) { this.error = 'some validation error'; }
        else if (err.status == 401) { this._router.navigate(['/login']); }
      },
      () => console.log());
  }

  //business pan image upload from system
  onChangeBusinessPan(fileInput: any) {
    this.loaderClassBusinessPan = "addLoader";
    this.statusUploadBusinessPan = "uploadStart";
    if (fileInput.target.files && fileInput.target.files[0]) {
      if (fileInput.target.files[0].type == "application/pdf") {
        this.adobeIconForBusinessPan = true;
      } else {
        this.adobeIconForBusinessPan = false;
      }
      let imgSrc = fileInput.target.files[0];
      this._httpService.businessPan(imgSrc)
        .subscribe((result) => {
          this.hideWarningClass = "clickHide";

          if (result.status == 200) {
            this.loaderClassBusinessPan = "";
            this.statusUploadBusinessPan = "uploadStart uploadComplete";
            this.business_pan_data = result.data;
            this.business_pan_data.meta = result.meta;

            if (result.meta.content == false) {
              setTimeout(() => {
                this.savepanBtn.nativeElement.click()
              }, 100)
            }

          }
        },
        (err: any) => {
          this.loaderClassBusinessPan = "";
          this.hideWarningClass = "";
          if (err.status != 0) { this.warning_message = JSON.parse(err._body).message; }
          if (err.status == 0) { this.warning_message = "Please check your internet connection" }
          else if (err.status == 500) { console.log('oops something went wrong, please try again!!'); }
          else if (err.status == 401) { this._router.navigate(['/login']); }
        },
        () => console.log());
    }
  }

  //business pan image upload from webcam
  onChangeBusinessPan2(formData) {
    this.loaderClassBusinessPan = "addLoader";
    this.statusUploadBusinessPan = "uploadStart";
    if (formData) {
      this._httpService.businessPanFormdata(formData)
        .subscribe((result) => {
          this.hideWarningClass = "clickHide";
          if (result.status == 200) {
            this.loaderClassBusinessPan = "";
            this.statusUploadBusinessPan = "uploadStart uploadComplete";
            let name = result.meta.name.split(' ');
            result.meta.individual_pan_first_name = name[0];
            result.meta.individual_pan_last_name = name[1];
            this.business_pan_data = result.data;
            this.business_pan_data.meta = result.meta;
            this.getMobData();
          }
        },
        (err: any) => {
          this.loaderClassBusinessPan = "";
          this.hideWarningClass = "";
          if (err.status != 0) { this.warning_message = JSON.parse(err._body).message; }
          if (err.status == 0) { this.warning_message = "Please check your internet connection" }
          else if (err.status == 500) { console.log('oops something went wrong, please try again!!'); }
          else if (err.status == 401) { this._router.navigate(['/login']); }
        },
        () => console.log());
    }
  }

  //pan image upload from system
  onChangePan(fileInput: any) {
    this.loaderClassPan = "addLoader";
    this.statusUploadPan = "uploadStart";
    if (fileInput.target.files && fileInput.target.files[0]) {
      if (fileInput.target.files[0].type == "application/pdf") {
        this.adobeIconForPersonalPan = true;
      } else {
        this.adobeIconForPersonalPan = false;
      }
      let imgSrc = fileInput.target.files[0];
      this._httpService.individualPan(imgSrc)
        .subscribe((result) => {
          this.hideWarningClass = "clickHide";
          if (result.status == 200) {
            this.statusUploadPan = "uploadStart uploadComplete";
            this.hideWarningClass = "clickHide"
            if (result.meta.content == true) {
              let name = result.meta.name.split(' ');
              result.meta.individual_pan_first_name = name[0];
              result.meta.individual_pan_last_name = name[1];
              this.pan_data = result.data;
              this.pan_data.meta = result.meta;
            } else {
              this.pan_data = {
                'id': result.data.id,
                'url': result.data.url,
                "meta": {
                  'individual_pan_first_name': '',
                  'individual_pan_last_name': '',
                  'individual_pan_gender': '',
                  'individual_pan_second_name': '',
                  'dob': '',
                  'number': ''
                }
              };
              setTimeout(() => {
                this.savepanBtn.nativeElement.click()
              }, 100)
            }
            this.loaderClassPan = "";
          }
        },
        (err: any) => {
          this.loaderClassPan = "";
          this.hideWarningClass = "";
          if (err.status != 0) { this.warning_message = JSON.parse(err._body).message; }
          if (err.status == 0) { this.warning_message = "Please check your internet connection" }
          else if (err.status == 500) { console.log('oops something went wrong, please try again!!'); }
          else if (err.status == 401) { this._router.navigate(['/login']); }
        },
        () => console.log());
    }
  }

  //pan image upload from webcam
  onChangePan2(formData) {
    this.loaderClassPan = "addLoader";
    this.statusUploadPan = "uploadStart";
    if (formData) {
      this._httpService.individualPanFormdata(formData)
        .subscribe((result) => {
          this.hideWarningClass = "clickHide";
          if (result.status == 200) {
            this.statusUploadPan = "uploadStart uploadComplete";
            this.hideWarningClass = "clickHide"
            if (result.meta.content == true) {
              let name = result.meta.name.split(' ');
              result.meta.individual_pan_first_name = name[0];
              result.meta.individual_pan_last_name = name[1];
              this.pan_data = result.data;
              this.pan_data.meta = result.meta;
            } else {
              this.pan_data = {
                'id': result.data.id,
                'url': result.data.url,
                "meta": {
                  'individual_pan_first_name': '',
                  'individual_pan_last_name': '',
                  'individual_pan_gender': '',
                  'individual_pan_second_name': '',
                  'dob': '',
                  'number': ''
                }
              };
              setTimeout(() => {
                this.savepanBtn.nativeElement.click()
              }, 100)
            }
            this.loaderClassPan = "";
          }
        },
        (err: any) => {
          this.loaderClassPan = "";
          this.hideWarningClass = "";
          if (err.status != 0) { this.warning_message = JSON.parse(err._body).message; }
          if (err.status == 0) { this.warning_message = "Please check your internet connection" }
          else if (err.status == 500) { console.log('oops something went wrong, please try again!!'); }
          else if (err.status == 401) { this._router.navigate(['/login']); }
        },
        () => console.log());
    }
  }

  //other address image upload from system
  onChangeOthers(fileInput: any) {
    if (fileInput.target.files && fileInput.target.files[0]) {
      for (let imgSrc of fileInput.target.files) {
        this._httpService.fileUploadOthers(imgSrc)
          .subscribe((result) => {
            this.hideWarningClass = "clickHide";
            if (result.status == 200) {
              this.address_proof.push(result.data);
              this.current_address_proofs_files_id.push(result.data.id);
            }
          },
          (err: any) => {
            this.hideWarningClass = "";
            if (err.status != 0) { this.warning_message = JSON.parse(err._body).message; }
            if (err.status == 0) { this.warning_message = "Please check your internet connection" }
            else if (err.status == 500) { console.log('oops something went wrong, please try again!!'); }
            else if (err.status == 401) { this._router.navigate(['/login']); }
          },
          () => console.log());
      }
    }
  }

  //other address image upload from system
  onChangeAddressProofOthers(fileInput: any) {
    if (fileInput.target.files && fileInput.target.files[0]) {
      this.loaderClassBusinessProof = "addLoader";
      this.statusUploadBusinessProof = "uploadStart";
      for (let imgSrc of fileInput.target.files) {

        this._httpService.fileUploadOthers(imgSrc)
          .subscribe((result) => {
            this.hideWarningClass = "clickHide";
            if (result.status == 200) {
              this.business_address_proof.push(result.data);
              this.business_current_address_proofs_files_id.push(result.data.id);
            }
          },
          (err: any) => {
            this.loaderClassBusinessProof = "";
            this.hideWarningClass = "";
            if (err.status != 0) { this.warning_message = JSON.parse(err._body).message; }
            if (err.status == 0) { this.warning_message = "Please check your internet connection" }
            else if (err.status == 500) { console.log('oops something went wrong, please try again!!'); }
            else if (err.status == 401) { this._router.navigate(['/login']); }
          },
          () => console.log());

      }
      this.loaderClassBusinessProof = "";
      this.statusUploadBusinessProof = "uploadStart uploadComplete";
    }
  }

  //pan/aadhar image delete from system
  delteFiles(id, step, type) {
    this.loaderClasssubmit = "addLoader";
    if (id) {
      this._httpService.deleteFiles(id)
        .subscribe((result) => {
          this.hideWarningClass = "clickHide";
          //console.log(result);
          if (result.status == 200) {
            if (step == 1) {
              this.onbord_flag = 2;
              this.onbord_form_flag = 1;
              this.pan_data = ''; //temp
              this.loaderClassPan = ""
              this.statusUploadPan = "";


            } else if (step == 2) {
              this.aadhar_data_front = '';
              this.loaderClassFront = "";
              this.statusUploadFront = "";


            } else if (step == 3) {
              this.aadhar_data_back = '';
              this.loaderClassBack = "";
              this.statusUploadBack = "";


            } else if (step == 4) {
              //slice the image array
              this.business_pan_data = ''; //temp
              this.loaderClassBusinessPan = ""
              this.statusUploadBusinessPan = "";

            } else if (step == 5) {
              this.aadhar_e_data_content = false;
              this.statusUploadFront = "";
              this.statusUploadBack = "";
              if (type == 'update') {
                this.update_onbord_flag = 2;
                this.update_onbord_form_flag = 3;
              }

            }

            this.loaderClasssubmit = "";

          }
        },
        (err: any) => {
          this.loaderClasssubmit = "";
          this.hideWarningClass = "";
          if (err.status != 0) { this.warning_message = JSON.parse(err._body).message; }
          if (err.status == 0) { this.warning_message = "Please check your internet connection" }
          else if (err.status == 500) { console.log('oops something went wrong, please try again!!'); }
        },
        () => console.log());
    }
  }

  //delete other images
  delteOtherFiles(data) {
    if (data) {
      this.address_proof.splice(this.address_proof.indexOf(data), 1);
      this.current_address_proofs_files_id.splice(this.current_address_proofs_files_id.indexOf(data.id), 1);
    }
  }

  //delete business address proof images
  delteBusinessAddressFiles(data) {
    if (data) {
      this.business_address_proof.splice(this.business_address_proof.indexOf(data), 1);
      this.business_current_address_proofs_files_id.splice(this.business_current_address_proofs_files_id.indexOf(data.id), 1);
    }
  }

  //aadhar image upload from system
  onChangeAadhar(fileInput: any, state) {
    this.showSTHStateDropDown = false;

    if (state == 1) {
      this.loaderClassFront = "addLoader";
      this.statusUploadFront = "uploadStart";
    } else {
      this.loaderClassBack = "addLoader";
      this.statusUploadBack = "uploadStart";
    }

    if (fileInput.target.files && fileInput.target.files[0]) {

      if (fileInput.target.files[0].type == "application/pdf") {
        if (state == 1) this.adobeIconForAadharFront = true;
        else this.adobeIconForAadharBack = true;
      } else {
        if (state == 1) this.adobeIconForAadharFront = false;
        else this.adobeIconForAadharBack = false;
      }

      let imgSrc = fileInput.target.files[0];
      this._httpService.individualAadhar(imgSrc)
        .subscribe((result) => {
          this.hideWarningClass = "clickHide";

          if (result.status == 200) {
            if (state == 1) {
              this.aadhar_data_front = result.data;
              this.aadhar_data_front.meta = result.meta;

              this.loaderClassFront = "";
              this.statusUploadFront = "uploadStart uploadComplete";
            } else if (state == 2) {

              // if (typeof result.meta.address == 'undefined' || result.meta.address == '') {
              //   this.stakeholder_address_textarea = false;
              //   this.showCurrnetAddressForm = true;
              // } else {
              //   this.stakeholder_address_textarea = true;
              //   this.stakeholder_address.patchValue({ aadhaar_address: result.meta.address });
              // }

              this.aadhar_data_back = {
                "meta": {
                  "splitAddress": {
                    "addressLine": "",
                    "city": "",
                    "state": "",
                    "state1": ""
                  },
                  "pincode": ""
                },
                "id": result.data.id,
                "url": result.data.url
              };

              if (result.hasOwnProperty('meta')) {
                if (result.meta.hasOwnProperty('splitAddress')) {
                  this.aadhar_data_back = {
                    "meta": {
                      "splitAddress": {
                        "addressLine": result.meta.splitAddress.addressLine,
                        "city": (result.meta.splitAddress.city.length > 0) ? result.meta.splitAddress.city[0] : "",
                        "state": (result.meta.splitAddress.state[0].length > 0) ? result.meta.splitAddress.state[0][0] : "",
                        "state1": (result.meta.splitAddress.state[0].length > 0) ? result.meta.splitAddress.state[0][1] : ""
                      },
                      "pincode": result.meta.splitAddress.pincode
                    },
                    "id": result.data.id,
                    "url": result.data.url
                  };
                  if (result.meta.splitAddress.state[0].length == 0) {
                    this.showSTHStateDropDown = true;
                  }
                }
              }
              if (result.meta.content == false) {
                this.showSTHStateDropDown = true;
              }

              // this.aadhar_data_back = result.data;
              // this.aadhar_data_back.meta = result.meta;


              this.loaderClassBack = "";
              this.statusUploadBack = "uploadStart uploadComplete";

            }
            //this.getMobData();  
          }
        },
        (err: any) => {
          this.loaderClassFront = "";
          this.loaderClassBack = "";
          this.hideWarningClass = "";
          if (err.status != 0) { this.warning_message = JSON.parse(err._body).message; }
          if (err.status == 0) { this.warning_message = "Please check your internet connection" }
          else if (err.status == 500) { console.log('oops something went wrong, please try again!!'); }
          else if (err.status == 401) { this._router.navigate(['/login']); }
        },
        () => console.log());
    }
  }

  //aadhar image upload from webcam
  onChangeAadhar2(formData, aadhar_page) {
    this.showSTHStateDropDown = false;
    if (aadhar_page == 1) {
      this.loaderClassFront = "addLoader";
      this.statusUploadFront = "uploadStart";
    } else {
      this.loaderClassBack = "addLoader";
      this.statusUploadBack = "uploadStart";
    }
    if (formData) {
      this._httpService.individualAadharFormdata(formData)
        .subscribe((result) => {
          this.hideWarningClass = "clickHide";
          if (result.status == 200) {
            if (aadhar_page == 1) {
              this.aadhar_data_front = result.data;
              this.aadhar_data_front.meta = result.meta;

              this.loaderClassFront = "";
              this.statusUploadFront = "uploadStart uploadComplete";

            } else if (aadhar_page == 2) {

              // if (typeof result.meta.address == 'undefined' || result.meta.address == '') {
              //   this.stakeholder_address_textarea = false;
              //   this.showCurrnetAddressForm = true;
              // } else {
              //   this.stakeholder_address_textarea = true;
              //   this.stakeholder_address.patchValue({ aadhaar_address: result.meta.address });
              // }

              this.aadhar_data_back = {
                "meta": {
                  "splitAddress": {
                    "addressLine": "",
                    "city": "",
                    "state": "",
                    "state1": ""
                  },
                  "pincode": ""
                },
                "id": result.data.id,
                "url": result.data.url
              };

              if (result.hasOwnProperty('meta')) {
                if (result.meta.hasOwnProperty('splitAddress')) {
                  this.aadhar_data_back = {
                    "meta": {
                      "splitAddress": {
                        "addressLine": result.meta.splitAddress.addressLine,
                        "city": (result.meta.splitAddress.city.length > 0) ? result.meta.splitAddress.city[0] : "",
                        "state": (result.meta.splitAddress.state[0].length > 0) ? result.meta.splitAddress.state[0][0] : "",
                        "state1": (result.meta.splitAddress.state[0].length > 0) ? result.meta.splitAddress.state[0][1] : ""
                      },
                      "pincode": result.meta.splitAddress.pincode
                    },
                    "id": result.data.id,
                    "url": result.data.url
                  };
                  if (result.meta.splitAddress.state[0].length == 0) {
                    this.showSTHStateDropDown = true;
                  }
                }
              }

              if (result.meta.content == false) {
                this.showSTHStateDropDown = true;
              }

              // this.aadhar_data_back = result.data;
              // this.aadhar_data_back.meta = result.meta;


              this.loaderClassBack = "";
              this.statusUploadBack = "uploadStart uploadComplete";


            }
            this.getMobData();
          }
        },
        (err: any) => {
          this.loaderClassFront = "";
          this.loaderClassBack = "";
          this.hideWarningClass = "";
          if (err.status != 0) { this.warning_message = JSON.parse(err._body).message; }
          if (err.status == 0) { this.warning_message = "Please check your internet connection" }
          else if (err.status == 500) { console.log('oops something went wrong, please try again!!'); }
          else if (err.status == 401) { this._router.navigate(['/login']); }
        },
        () => console.log());
    }
  }

  //aadhar image upload from system
  onChangeEaadhaar(fileInput: any) {
    this.showSTHStateDropDown = false;
    this.loaderClasssubmit = "addLoader";

    if (fileInput.target.files && fileInput.target.files[0]) {
      let imgSrc = fileInput.target.files[0];
      this._httpService.individualAadhar(imgSrc)
        .subscribe((result) => {
          this.hideWarningClass = "clickHide";
          if (result.status == 200) {
            this.loaderClasssubmit = "";
            this.statusUploadFront = "uploadComplete";
            this.statusUploadBack = "uploadComplete";

            this.aadhar_e_data = {
              "meta": {
                "uid": "",
                "gender": "",
                "dob": "",
                "name": "",
                "splitAddress": {
                  "addressLine": "",
                  "city": "",
                  "state": "",
                  "state1": ""
                },
                "pincode": ""
              },
              "id": result.data.id,
              "url": result.data.url,
              "original_file_name": result.data.original_file_name
            };

            if (result.meta.content == true) {
              this.aadhar_e_data_content = true;
              // this.aadhar_e_data_ = result.data;
              this.loaderClassFront = "";
              if (result.hasOwnProperty('meta')) {

                this.aadhar_e_data = {
                  "meta": {
                    "uid": result.meta.uid,
                    "gender": result.meta.gender,
                    "dob": result.meta.dob,
                    "name": result.meta.name,
                    "splitAddress": {
                      "addressLine": "",
                      "city": "",
                      "state": "",
                      "state1": ""
                    },
                    "pincode": ""
                  },
                  "id": result.data.id,
                  "url": result.data.url,
                  "original_file_name": result.data.original_file_name
                };

                if (result.meta.hasOwnProperty('splitAddress')) {
                  this.aadhar_e_data = {
                    "meta": {
                      "uid": result.meta.uid,
                      "gender": result.meta.gender,
                      "dob": result.meta.dob,
                      "name": result.meta.name,
                      "splitAddress": {
                        "addressLine": result.meta.splitAddress.addressLine,
                        "city": (result.meta.splitAddress.city.length > 0) ? result.meta.splitAddress.city[0] : "",
                        "state": (result.meta.splitAddress.state[0].length > 0) ? result.meta.splitAddress.state[0][0] : "",
                        "state1": (result.meta.splitAddress.state[0].length > 0) ? result.meta.splitAddress.state[0][1] : ""
                      },
                      "pincode": result.meta.splitAddress.pincode
                    },
                    "id": result.data.id,
                    "url": result.data.url,
                    "original_file_name": result.data.original_file_name

                  };
                  if (result.meta.splitAddress.state[0].length == 0) {
                    this.showSTHStateDropDown = true;
                  }
                }

              }
              this.loaderClassBack = "";
            } else {

              this.aadhar_e_data = {
                "meta": {
                  "uid": "",
                  "gender": "",
                  "dob": "",
                  "name": "",
                  "splitAddress": {
                    "addressLine": "",
                    "city": "",
                    "state": "",
                    "state1": ""
                  },
                  "pincode": ""
                },
                "id": result.data.id,
                "url": result.data.url,
                "original_file_name": result.data.original_file_name
              };
              this.aadhar_e_data_content = true;
              this.showSTHStateDropDown = true;
            }

            //this.getMobData();
          }

        },
        (err: any) => {
          this.loaderClasssubmit = "";
          this.hideWarningClass = "";
          if (err.status != 0) { this.warning_message = JSON.parse(err._body).message; }
          if (err.status == 0) { this.warning_message = "Please check your internet connection" }
          else if (err.status == 500) { console.log('oops something went wrong, please try again!!'); }
          else if (err.status == 401) { this._router.navigate(['/login']); }
        },
        () => console.log());
    }
  }

  onSubmitStakeholerDetail() {
    this.loaderClasssubmit = "addLoader";
    let data = this.stakeholder_detail.value;
    data.companies_id = this.companies_id;
    data.accounts_id = this.accounts_id;
    data.current_step = 2;
    data.current_sub_step = 2;
    data.individual_pan_dob = this.datePipe.transform(data.individual_pan_dob, 'yyyy-MM-dd');
    data.mob_master_id = this.mob_data.mob_master_id;
    if (typeof this.pan_data != 'undefined') {
      data.files_id = [this.pan_data.id];
    }

    this._httpService.stakeholderPan(data)
      .subscribe((result) => {
        this.hideWarningClass = "clickHide";
        if (result.status == 200) {
          this.getMobData();
        }
      },
      (err: any) => {
        this.loaderClasssubmit = "";
        this.hideWarningClass = "";
        if (err.status != 0) { this.warning_message = JSON.parse(err._body).message; }
        if (err.status == 0) { this.warning_message = "Please check your internet connection" }
        else if (err.status == 500) { console.log('oops something went wrong, please try again!!'); }
        else if (err.status == 422) { this.error = 'some validation error'; }
        else if (err.status == 401) { this._router.navigate(['/login']); }

      },
      () => console.log());
  }

  onSubmitStakeholerAddress() {
    this.loaderClasssubmit = "addLoader";
    if (this.stakeholder_address.valid) {
      let data = this.stakeholder_address.value;
      data.companies_id = this.companies_id;
      data.accounts_id = this.accounts_id;
      data.current_step = 2;
      data.current_sub_step = 3;
      data.aadhaar_dob = this.datePipe.transform(data.aadhaar_dob, 'yyyy-MM-dd');
      data.mob_master_id = this.mob_data.mob_master_id;

      // if (typeof this.aadhar_data_back.meta.splitAddress == 'undefined' || this.aadhar_data_back.meta.splitAddress == '') {
      //   data.aadhaar_address = data.current_address.address_line;
      //   data.aadhaar_city = data.current_address.city;
      //   data.aadhaar_state = data.current_address.state;
      //   data.aadhaar_pin = data.current_address.pincode;
      // } else {
      //   data.aadhaar_city = this.aadhar_data_back.meta.splitAddress.city[0];
      //   data.aadhaar_state = this.aadhar_data_back.meta.splitAddress.state[0][0];
      //   data.aadhaar_pin = this.aadhar_data_back.meta.pincode;
      // }


      if (this.aadhar_e_data_content) {
        data.e_aadhaar_files_id = this.aadhar_e_data.id;
        if (this.aadhar_e_data.hasOwnProperty('meta')) {
          if (this.aadhar_e_data.meta.hasOwnProperty('splitAddress')) {
            if (this.aadhar_e_data.meta.splitAddress.state1 != "") {
              data.aadhaar_state = this.aadhar_e_data.meta.splitAddress.state1;
            }
          }
        }
      } else {
        data.aadhaar_front_files_id = this.aadhar_data_front.id;
        data.aadhaar_back_files_id = this.aadhar_data_back.id;
        if (this.aadhar_data_back.hasOwnProperty('meta')) {
          if (this.aadhar_data_back.meta.hasOwnProperty('splitAddress')) {
            if (this.aadhar_data_back.meta.splitAddress.state1 != "") {
              data.aadhaar_state = this.aadhar_data_back.meta.splitAddress.state1;
            }
          }
        }
      }

      data.mob_stakeholder_details_id = this.mob_data.mob_stakeholder_details.data.mob_stakeholder_details_id;
      data.current_address_proof_types_id = data.current_address.address_proofs_id;
      data.current_address_proofs_files_id = this.current_address_proofs_files_id;


      // if (typeof this.aadhar_data_back.meta.splitAddress != 'undefined' && this.aadhar_data_back.meta.splitAddress != '') {
      if (data.is_current_address_different == true) {
        data.is_current_address_different = 1;
        delete data.current_address.address_proofs_id;
      } else {
        data.is_current_address_different = 0;
        data.current_address.address_line = data.aadhaar_address
        data.current_address.city = data.aadhaar_city;
        data.current_address.state = data.aadhaar_state;
        data.current_address.pincode = data.aadhaar_pin;
        delete data.current_address.address_proofs_id;
      }
      // }
      this._httpService.stakeholderAadharAddress(data)
        .subscribe((result) => {
          this.hideWarningClass = "clickHide";
          if (result.status == 200) {
            mixpanel.track('stakeholder-tab-save-proceeded', data);
            data.business_pan_url = this.businees_pan_file_url;
            data.stakeholder_pan_url = this.stakeholder_pan_file_url;
            data.stakeholder_aadhar_front = this.aadhar_data_front.url;
            data.stakeholder_aadhar_back = this.aadhar_data_back.url;
            if (this.aadhar_e_data_content) {
              data.stakeholder_e_aadhar = this.aadhar_e_data.url;
            }
            Intercom('trackEvent', 'stakeholder-tab-save-proceeded', data);
            this.getMobData();
          }
        },
        (err: any) => {
          this.loaderClasssubmit = "";
          this.hideWarningClass = "";
          if (err.status != 0) { this.warning_message = JSON.parse(err._body).message; }
          if (err.status == 0) { this.warning_message = "Please check your internet connection" }
          else if (err.status == 500) { console.log('oops something went wrong, please try again!!'); }
          else if (err.status == 422) { this.error = 'some validation error'; }
          else if (err.status == 401) { this._router.navigate(['/login']); }

        },
        () => console.log());
    } else {
      this.loaderClasssubmit = "";
      Object.keys(this.stakeholder_address.controls).forEach(field => {
        const control = this.stakeholder_address.get(field);
        control.markAsTouched({ onlySelf: true });
      });
    }
  }

  manualySinging() {
    this.loaderClasssubmit = "addLoader";
    let data = {
      "users_id": this.users_id,
      "accounts_id": this.accounts_id,
      "companies_id": this.companies_id,
      "mob_master_id": this.mob_data.mob_master_id,
      "current_step": 4,
      "current_sub_step": 2
    };
    this._httpService.manualSigning(data)
      .subscribe((result) => {
        this.hideWarningClass = "clickHide";
        if (result.status == 201) {
          this.loaderClasssubmit = "";

          // localStorage.setItem('isWelcomeOnboard', 'true');
          // this._router.navigate(['/dashboard']);
          mixpanel.track('contact-tab-save-proceeded', data);

          Intercom('trackEvent', 'contact-tab-save-proceeded', data);
          this.getMobData();
        }
      },
      (err: any) => {
        this.loaderClasssubmit = "";
        this.hideWarningClass = "";
        if (err.status != 0) { this.warning_message = JSON.parse(err._body).message; }
        if (err.status == 0) { this.warning_message = "Please check your internet connection" }
        else if (err.status == 500) { console.log('oops something went wrong, please try again!!'); }
        else if (err.status == 401) { this._router.navigate(['/login']); }
      },
      () => console.log());
  }

  checkAlmost1(data) {
    if (data) {
      this.check_almost = 1;
    } else {
      this.check_almost = 0;
    }
  }
  certified_authority(value) {
    if (value) {
      this.is_certified = true;
    } else {
      this.is_certified = false;
    }
  }

  onSubmitCertify() {
    this.loaderClasssubmit = "addLoader";
    let data = this.almostDone1.value;
    data.aadhaar_details_id = this.mob_data.mob_stakeholder_details.data.aadhaar_details_id;
    data.mob_master_id = this.mob_data.mob_master_id;
    data.current_step = 4;
    data.current_sub_step = 1;
    delete data.certify;
    this._httpService.generateAadharotp(data)
      .subscribe((result) => {
        this.hideWarningClass = "clickHide";
        if (result.status == 201) {
          this.getMobData();

        }
      },
      (err: any) => {
        this.loaderClasssubmit = "";
        this.hideWarningClass = "";
        if (err.status != 0) {
          if (err.status == 412) {
            this.onbord_flag = 4;
            this.onbord_form_flag = 2;
          }
          this.warning_message = JSON.parse(err._body).message;
        }
        if (err.status == 0) { this.warning_message = "Please check your internet connection" }
        else if (err.status == 500) { console.log('oops something went wrong, please try again!!'); }
        else if (err.status == 422) { this.error = 'some validation error'; }
        else if (err.status == 401) { this._router.navigate(['/login']); }

      },
      () => console.log());
  }

  resendOtp() {
    this.loaderClasssubmit = "addLoader";
    let data = {
      "aadhaar_details_id": this.mob_data.mob_stakeholder_details.data.aadhaar_details_id,
      "mob_master_id": this.mob_data.mob_master_id,
      "current_step": 4,
      "current_sub_step": 1
    };
    this._httpService.generateAadharotp(data)
      .subscribe((result) => {
        this.hideWarningClass = "clickHide";
        if (result.status == 201) {
          this.manualSignInBtnTimeStatus = false;
          this.getMobData();
        }
      },
      (err: any) => {
        this.loaderClasssubmit = "";
        this.hideWarningClass = "";
        if (err.status != 0) { this.warning_message = JSON.parse(err._body).message; }
        if (err.status == 0) { this.warning_message = "Please check your internet connection" }
        else if (err.status == 500) { console.log('oops something went wrong, please try again!!'); }
        else if (err.status == 422) { this.error = 'some validation error'; }
        else if (err.status == 401) { this._router.navigate(['/login']); }

      },
      () => console.log());
  }

  onSubmitOtp() {
    this.loaderClasssubmit = "addLoader";

    let data = this.almostDone2.value;
    data.companies_id = this.companies_id;
    data.accounts_id = this.accounts_id;
    data.aadhaar_details_id = this.mob_data.mob_stakeholder_details.data.aadhaar_details_id;
    data.mob_master_id = this.mob_data.mob_master_id;
    data.current_step = 4;
    data.current_sub_step = 2;
    this._httpService.submitAadharotp(data)
      .subscribe((result) => {
        this.hideWarningClass = "clickHide";
        if (result.status == 200) {
          this.invalid_otp = false;
          mixpanel.track('contact-tab-save-proceeded', data);
          Intercom('trackEvent', 'contact-tab-save-proceeded', data);
          this.getMobData();
        }
      },
      (err: any) => {
        this.loaderClasssubmit = "";
        this.hideWarningClass = "";
        if (err.status != 0) { this.warning_message = JSON.parse(err._body).message; }
        if (err.status == 0) { this.warning_message = "Please check your internet connection" }
        else if (err.status == 500) { console.log('oops something went wrong, please try again!!'); }
        else if (err.status == 412) { this.invalid_otp = true; }
        else if (err.status == 422) { this.error = 'some validation error'; }
        else if (err.status == 401) { this._router.navigate(['/login']); }
      },
      () => console.log());
  }

  clearMsg() {
    this.invalid_otp = false;
  }

  savePan() {

    if (this.mob_data.hasOwnProperty('mob_stakeholder_details')) {
      if (this.mob_data.mob_stakeholder_details.data.hasOwnProperty('individual_pan_details')) {
        this.update_onbord_flag = 2;
        this.update_onbord_form_flag = 2;
        this.onbord_flag = 0;
        this.onbord_form_flag = 0;
      } else {
        this.onbord_flag = 2;
        this.onbord_form_flag = 2;
        this.update_onbord_flag = 0;
        this.update_onbord_form_flag = 0;
      }
    } else {
      this.onbord_flag = 2;
      this.onbord_form_flag = 2;
      this.update_onbord_flag = 0;
      this.update_onbord_form_flag = 0;
    }
  }

  saveBusinessPan() {
    if (this.mob_data.hasOwnProperty('mob_business_details')) {
      if (this.mob_data.mob_business_details.data.hasOwnProperty('individual_pan_details')) {
        this.update_onbord_flag = 1;
        this.update_onbord_form_flag = 3;
        this.onbord_flag = 0;
        this.onbord_form_flag = 0;
      } else {
        this.onbord_flag = 1;
        this.onbord_form_flag = 3;
        this.update_onbord_flag = 0;
        this.update_onbord_form_flag = 0;
      }
    } else {
      this.onbord_flag = 1;
      this.onbord_form_flag = 3;
      this.update_onbord_flag = 0;
      this.update_onbord_form_flag = 0;
    }

  }

  saveAadhar() {
    this.aadhar_save = true;
  }

  captureMultipartBusinessPan() {
    this.closeBtn.nativeElement.click();
    return this.webcam.captureAsFormData({ fileName: 'file.png' })
      .then(base => {
        this.onChangeBusinessPan2(base);
        setTimeout(() => this.webcam.resizeVideo(), 0)
      })
      .catch(e => console.error(e))
  }

  captureMultipartPan() {
    this.closeBtn.nativeElement.click();
    return this.webcam.captureAsFormData({ fileName: 'file.png' })
      .then(base => {
        this.onChangePan2(base);
        setTimeout(() => this.webcam.resizeVideo(), 0)
      })
      .catch(e => console.error(e))
  }

  captureMultipartAadharFront() {
    this.closeBtn.nativeElement.click();
    return this.webcam.captureAsFormData({ fileName: 'file.png' })
      .then(base => {
        this.onChangeAadhar2(base, 1);
        setTimeout(() => this.webcam.resizeVideo(), 0)
      })
      .catch(e => console.error(e))
  }

  captureMultipartAadharBack() {
    this.closeBtn.nativeElement.click();
    return this.webcam.captureAsFormData({ fileName: 'file.png' })
      .then(base => {
        this.onChangeAadhar2(base, 2);
        setTimeout(() => this.webcam.resizeVideo(), 0)
      })
      .catch(e => console.error(e))
  }

  getMobData() {
    this.loaderClasssubmit = "addLoader";
    this._httpService.getMobDetails()
      .subscribe((result) => {
        this.hideWarningClass = "clickHide";
        this.mob_data = result.data;

        if (typeof this.mob_data != "undefined" && typeof this.mob_data.mob_business_types_id != "undefined" && this.mob_data.mob_business_types_id != 5) {
          this._router.navigate(['/login']);
        }
        if (typeof this.mob_data != 'undefined' && this.mob_data.hasOwnProperty('mob_business_details') && this.mob_data.mob_business_details) {
          this.update_onbord_flag = 0;
          this.update_onbord_form_flag = 0;
          if (this.mob_data.current_step == 1 && this.mob_data.current_sub_step == 1) {
            this.onbord_flag = 1;
            this.onbord_form_flag = 2;
          } else if (this.mob_data.current_step == 1 && this.mob_data.current_sub_step == 2) {
            this.onbord_flag = 1;
            this.onbord_form_flag = 3;
          } else if (this.mob_data.current_step == 1 && this.mob_data.current_sub_step == 3) {
            this.onbord_flag = 2;
            this.onbord_form_flag = 1;
          } else if (this.mob_data.current_step == 2 && this.mob_data.current_sub_step == 1) {
            this.onbord_flag = 2;
            this.onbord_form_flag = 2;
          } else if (this.mob_data.current_step == 2 && this.mob_data.current_sub_step == 2) {
            this.onbord_flag = 2;
            this.onbord_form_flag = 3;
          } else if (this.mob_data.current_step == 2 && this.mob_data.current_sub_step == 3) {
            this.onbord_flag = 3;
            this.onbord_form_flag = 1;
          } else if (this.mob_data.current_step == 3 && this.mob_data.current_sub_step == 1) {
            this.onbord_flag = 4;
            this.onbord_form_flag = 1;
          } else if (this.mob_data.current_step == 4 && this.mob_data.current_sub_step == 1) {
            this.onbord_flag = 4;
            this.onbord_form_flag = 2;
            setTimeout(() => {
              this.manualSignInBtnTimeStatus = true;
            }, 30000);
          } else if (this.mob_data.current_step == 4 && this.mob_data.current_sub_step == 2) {
            var currentUser = JSON.parse(localStorage.getItem('currentUser'));
            currentUser.account_details.company.data[0].mob_master = { 'data': result.data };
            currentUser.company_details.brand_name = this.mob_data.mob_business_details.data.brand_name;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            result.meta.forEach(e => {
              if (e.hasOwnProperty('intercom')) {
                let email = "";
                let user_hash = "";
                email = e.intercom.email;
                user_hash = e.intercom.intercom_user_hash;
                window.intercomSettings = {
                  app_id: this._config._intercom_id,
                  email: email,
                  user_hash: user_hash,
                  user_type: 'Trust',
                  brand_name: result.data.mob_business_details.data.brand_name,
                  date_of_incorporation: result.data.mob_business_details.data.date_of_incorporation,
                  gstin_number: result.data.mob_business_details.data.gstin_number,
                  pan_no: result.data.mob_business_details.data.business_pan_details.data.pan_number,
                  aadhaar_number: result.data.mob_stakeholder_details.data.aadhaar_details.data.aadhaar_number,
                  dob: result.data.mob_stakeholder_details.data.aadhaar_details.data.aadhaar_dob
                }
                window.Intercom('update');
              }
            });
            localStorage.setItem('isWelcomeOnboard', 'true');
            this._router.navigate(['/dashboard']);
          } else {
            this.onbord_flag = 1;
            this.onbord_form_flag = 1;
          }
        } else {
          this.onbord_flag = 1;
          this.onbord_form_flag = 1;
        }

        // this.onbord_flag=1;
        // this.onbord_form_flag=2;
        // if (typeof this.mob_data != "undefined" && typeof this.mob_data.mob_business_details != "undefined" && typeof this.mob_data.mob_business_details.data.individual_pan_details != "undefined") {
        //   this.statusUploadBusinessPan = "uploadComplete";
        // }

        // if (typeof this.mob_data != "undefined" && typeof this.mob_data.mob_stakeholder_details != "undefined" && typeof this.mob_data.mob_stakeholder_details.data.individual_pan_details != "undefined") {
        //   this.statusUploadPan = "uploadComplete";
        // }

        // if (typeof this.mob_data != "undefined" && typeof this.mob_data.mob_stakeholder_details != "undefined" && typeof this.mob_data.mob_stakeholder_details.data.aadhaar_details != "undefined") {
        //   this.statusUploadFront = "uploadComplete";
        //   //  this.statusUploadBack="uploadComplete";            
        // }

        if (typeof this.mob_data != "undefined" && typeof this.mob_data.mob_address_details != "undefined" && typeof this.mob_data.mob_address_details.data.document_proof_files != "undefined") {
          this.statusUploadBusinessProof = "uploadComplete";
          //  this.statusUploadBack="uploadComplete";            
        }

        if (result.hasOwnProperty('meta')) {
          result.meta.forEach(e => {
            if (e.file_type == 18) { this.aadhaarcard_front_file_url = e.url; this.statusUploadFront = "uploadComplete"; }
            if (e.file_type == 19) { this.aadhaarcard_back_file_url = e.url; this.statusUploadBack = "uploadComplete"; }
            if (e.file_type == 20) { this.stakeholder_pan_file_url = e.url; this.statusUploadPan = "uploadComplete"; }
            if (e.file_type == 23) {
              this.aadhar_e_data_content = true;
              this.aadhar_e_data = { "original_file_name": e.original_file_name }
              this.statusUploadFront = "uploadComplete";
              this.statusUploadBack = "uploadComplete";
            }
            if (e.file_type == 24) { this.businees_pan_file_url = e.url; this.statusUploadBusinessPan = "uploadComplete" }
          });
        }
        //clear loader flags on success
        this.hideWarningClass = "clickHide";
        this.loaderClasssubmit = "";
        this.loaderClassPan = "";
        this.camStatus = localStorage.getItem('camStatus');

      },
      (err: any) => {
        this.loaderClassPan = "";
        this.loaderClasssubmit = "";
        this.hideWarningClass = "";
        if (err.status != 0) { this.warning_message = JSON.parse(err._body).message; }
        if (err.status == 0) { this.warning_message = "Please check your internet connection" }
        else if (err.status == 500) { console.log('oops something went wrong, please try again!!'); }
      },
      () => console.log());
  }

  businessCategories() {
    this.businees_category = this._httpService.getBusinessCategories();
  }

  businessTypes() {
    this.businees_type = this._httpService.getBusinessTypes();
  }

  getState() {
    this.state_list = this._httpService.getStateList();
  }

  addressProofTypes() {
    this.address_proof_type = this._httpService.getAddressProofTypes();
  }

  toggleCurrentAddressForm(value) {
    if (value) {
      this.showCurrnetAddressForm = true;
    } else {
      this.showCurrnetAddressForm = false;
    }
  }

  toggleTips() {
    if (this.toggle_class == "") {
      this.toggle_class = "showTips";
    } else {
      this.toggle_class = "";
    }
  }

  onSuccess(stream: any) {
    //console.log('capturing video stream');
  };

  onError(err) {
  };
  checkCam() {
    DetectRTC.load(function () {
      localStorage.setItem('camStatus', DetectRTC.hasWebcam);
    });


  }
  userTypeChange(data) {
    let user_type = data.value;
    if (user_type == 1) {
      this._router.navigate(['/onboard-individual']);
    } else if (user_type == 2) {
      this._router.navigate(['/onboard-proprietership']);
    } else if (user_type == 3) {
      this._router.navigate(['/onboard-partnership']);
    } else if (user_type == 4) {
      this._router.navigate(['/onboard-private-limited']);
    } else if (user_type == 5) {
      this._router.navigate(['/onboard-trust-or-societies']);
    }
  }
  startCapture(data) {
    this.pan_aadhar = data;
    this.camStart = true;
    this.uploadImg = "";

  }
  stotCapture() {
    this.camStart = false;
    this.webcam.ngOnDestroy();
  }

  hideWarning() {
    this.hideWarningClass = "clickHide";
  }

  ////////////////////////////////// UPDATE CODE START ///////////////////////////
  ////////////////////////////All code dedicated only for TRUST OB///////////////

  update_click(current_step, current_sub_step, update_weight) {
    if (typeof this.mob_data != 'undefined') {
      let mob_weight = "" + this.mob_data.current_step + "" + this.mob_data.current_sub_step;
      this.onbord_flag = 0;
      this.onbord_form_flag = 0;
      if (update_weight <= mob_weight) {

        this.aadhar_save = false;
        if (this.mob_data.hasOwnProperty('mob_stakeholder_details')) {
          if (this.mob_data.mob_stakeholder_details.data.hasOwnProperty('aadhaar_details')) {
            if (this.mob_data.mob_stakeholder_details.data.aadhaar_details.data.hasOwnProperty('document_proof_files')) {
              let data = this.mob_data.mob_stakeholder_details.data.aadhaar_details.data.document_proof_files.data;
              data.forEach(e => {
                if (e.address_proof_types_id == 23) {
                  this.aadhar_e_data_content = true;
                  this.aadhar_e_data = {
                    "meta": {
                      "uid": this.mob_data.mob_stakeholder_details.data.aadhaar_details.data.aadhaar_number,
                      "gender": this.mob_data.mob_stakeholder_details.data.aadhaar_details.data.aadhaar_gender,
                      "dob": this.mob_data.mob_stakeholder_details.data.aadhaar_details.data.aadhaar_dob,
                      "name": this.mob_data.mob_stakeholder_details.data.aadhaar_details.data.aadhaar_first_name,
                      "splitAddress": {
                        "addressLine": this.mob_data.mob_stakeholder_details.data.aadhaar_details.data.aadhaar_address,
                        "city": this.mob_data.mob_stakeholder_details.data.aadhaar_details.data.aadhaar_city,
                        "state": this.mob_data.mob_stakeholder_details.data.aadhaar_details.data.aadhaar_state,
                        "state1": this.mob_data.mob_stakeholder_details.data.aadhaar_details.data.aadhaar_state
                      },
                      "pincode": this.mob_data.mob_stakeholder_details.data.aadhaar_details.data.aadhaar_pin
                    },
                    "id": e.files.data[0].id,
                    "url": e.files.data[0].url,
                    "original_file_name": e.files.data[0].original_file_name
                  };
                }
                if (e.address_proof_types_id == 18) {
                  this.aadhar_data_front = {
                    "meta": {
                      "uid": this.mob_data.mob_stakeholder_details.data.aadhaar_details.data.aadhaar_number,
                      "gender": this.mob_data.mob_stakeholder_details.data.aadhaar_details.data.aadhaar_gender,
                      "dob": this.mob_data.mob_stakeholder_details.data.aadhaar_details.data.aadhaar_dob,
                      "name": this.mob_data.mob_stakeholder_details.data.aadhaar_details.data.aadhaar_first_name,
                      "pincode": this.mob_data.mob_stakeholder_details.data.aadhaar_details.data.aadhaar_pin,
                    },
                    "id": e.files.data[0].id,
                    "url": e.files.data[0].url,
                    "original_file_name": e.files.data[0].original_file_name
                  };

                  if (e.files.data[0].mime_type == "application/pdf") {
                    this.adobeIconForAadharFront = true;
                  }
                }
                if (e.address_proof_types_id == 19) {
                  this.aadhar_data_back = {
                    "meta": {
                      "splitAddress": {
                        "addressLine": this.mob_data.mob_stakeholder_details.data.aadhaar_details.data.aadhaar_address,
                        "city": this.mob_data.mob_stakeholder_details.data.aadhaar_details.data.aadhaar_city,
                        "state": this.mob_data.mob_stakeholder_details.data.aadhaar_details.data.aadhaar_state,
                        "state1": this.mob_data.mob_stakeholder_details.data.aadhaar_details.data.aadhaar_state
                      },
                      "pincode": this.mob_data.mob_stakeholder_details.data.aadhaar_details.data.aadhaar_pin
                    },
                    "id": e.files.data[0].id,
                    "url": e.files.data[0].url,
                    "original_file_name": e.files.data[0].original_file_name
                  };

                  if (e.files.data[0].mime_type == "application/pdf") {
                    this.adobeIconForAadharBack = true;
                  }
                }
              });
            }

            if (this.mob_data.mob_stakeholder_details.data.is_current_address_different == 0 || this.mob_data.mob_stakeholder_details.data.is_current_address_different == false) {
              this.current_address_proofs_files_id = [];
            }
          }
        }

        if (this.mob_data.hasOwnProperty('mob_address_details')) {
          this.business_address_data = this.mob_data.mob_address_details.data;
          this.business_address_data = {
            "registered_address": {
              "data": {
                "address_line": this.mob_data.mob_address_details.data.registered_address.data.address_line,
                "city": this.mob_data.mob_address_details.data.registered_address.data.city,
                "state": this.mob_data.mob_address_details.data.registered_address.data.state,
                "pincode": this.mob_data.mob_address_details.data.registered_address.data.pincode
              }
            },
            "document_proof_files": {
              "data": [
                {
                  "address_proof_types_id": (this.mob_data.mob_address_details.data.document_proof_files.data.length > 0) ? this.mob_data.mob_address_details.data.document_proof_files.data[0].address_proof_types_id : ''
                }
              ]
            }
          };
          let data = this.mob_data.mob_address_details.data.document_proof_files.data;
          this.business_address_proof = [];
          this.business_current_address_proofs_files_id = [];
          data.forEach(e => {
            if (e.address_proof_types_id != 18 && e.address_proof_types_id != 19 && e.address_proof_types_id != 23) {
              this.business_address_proof.push(e.files.data[0]);
              this.business_current_address_proofs_files_id.push(e.files.data[0].id);
            }
          });
        }

        if (this.mob_data.hasOwnProperty('mob_business_details')) {
          if (this.mob_data.mob_business_details.data.hasOwnProperty('business_pan_details')) {
            if (this.mob_data.mob_business_details.data.business_pan_details.data.hasOwnProperty('document_proof_files')) {
              this.business_pan_data = {
                "id": this.mob_data.mob_business_details.data.business_pan_details.data.document_proof_files.data[0].files.data[0].id,
                "url": this.mob_data.mob_business_details.data.business_pan_details.data.document_proof_files.data[0].files.data[0].url,
                "meta": {
                  "name": this.mob_data.mob_business_details.data.registered_business_name,
                  "dateOfIssue": this.mob_data.mob_business_details.data.business_pan_details.data.doi,
                  "number": this.mob_data.mob_business_details.data.business_pan_details.data.pan_number
                }
              };
              if (this.mob_data.mob_business_details.data.business_pan_details.data.document_proof_files.data[0].files.data[0].mime_type == "application/pdf") {
                this.adobeIconForBusinessPan = true;
              }
            } else {
              this.business_pan_data = {
                "id": (typeof this.business_pan_data != 'undefined') ? this.business_pan_data.id : '',
                "url": (typeof this.business_pan_data != 'undefined') ? this.business_pan_data.url : '',
                "meta": {
                  "name": this.mob_data.mob_business_details.data.registered_business_name,
                  "dateOfIssue": this.mob_data.mob_business_details.data.business_pan_details.data.doi,
                  "number": this.mob_data.mob_business_details.data.business_pan_details.data.pan_number
                }
              };
            }
          }
        }

        this.onbord_flag = 0;
        this.onbord_form_flag = 0;
        this.update_onbord_flag = current_step;
        this.update_onbord_form_flag = current_sub_step;
      } else {

        if (update_weight >= mob_weight) {
          this.update_onbord_flag = 0;
          this.update_onbord_form_flag = 0;
          if (this.mob_data.current_step == 1 && this.mob_data.current_sub_step == 1) {
            this.onbord_flag = 1;
            this.onbord_form_flag = 2;
          } else if (this.mob_data.current_step == 1 && this.mob_data.current_sub_step == 3) {
            this.onbord_flag = 2;
            this.onbord_form_flag = 1;
          } else if (this.mob_data.current_step == 2 && this.mob_data.current_sub_step == 2) {
            this.onbord_flag = 2;
            this.onbord_form_flag = 3;
          }
          else {
            this.onbord_flag = current_step;
            this.onbord_form_flag = current_sub_step;
          }
        } else {
          this.update_onbord_flag = this.mob_data.current_step;
          this.update_onbord_form_flag = this.mob_data.current_sub_step;
        }
      }

      if (this.update_onbord_flag == 2 && this.update_onbord_form_flag == 3) {
        if (this.mob_data.mob_stakeholder_details.data.is_current_address_different == 1) {
          this.toggleCurrentAddressForm(true);
          let data = this.mob_data.mob_stakeholder_details.data.aadhaar_details.data.document_proof_files.data;
          this.address_proof = [];
          this.current_address_proofs_files_id = [];
          data.forEach(e => {
            if (e.address_proof_types_id != 18 && e.address_proof_types_id != 19) {
              this.address_proof.push(e.files.data[0]);
              this.current_address_proofs_files_id.push(e.files.data[0].id);
              this.address_proofs_id = e.address_proof_types_id;
            }
          });
        }
      }
    } else {
      this.onbord_flag = 1;
      this.onbord_form_flag = 1;
    }
  }


  set_files(current_step, current_sub_step, file_data) {

    this.onbord_flag = 0;
    this.onbord_form_flag = 0;
    if (file_data == 'pancard') {
      if (this.mob_data.hasOwnProperty('mob_stakeholder_details')) {
        if (this.mob_data.mob_stakeholder_details.data.hasOwnProperty('individual_pan_details')) {
          if (this.mob_data.mob_stakeholder_details.data.individual_pan_details.data.hasOwnProperty('document_proof_files')) {
            this.pan_data = {
              'id': this.mob_data.mob_stakeholder_details.data.individual_pan_details.data.document_proof_files.data[0].files.data[0].id,
              'url': this.mob_data.mob_stakeholder_details.data.individual_pan_details.data.document_proof_files.data[0].files.data[0].url,
              "meta": {
                'individual_pan_first_name': this.mob_data.mob_stakeholder_details.data.individual_pan_details.data.individual_pan_first_name,
                'individual_pan_last_name': this.mob_data.mob_stakeholder_details.data.individual_pan_details.data.individual_pan_last_name,
                // 'individual_pan_gender': this.mob_data.mob_stakeholder_details.data.individual_pan_details.data.individual_pan_gender,
                'individual_pan_second_name': this.mob_data.mob_stakeholder_details.data.individual_pan_details.individual_pan_second_name,
                'dob': this.mob_data.mob_stakeholder_details.data.individual_pan_details.data.individual_pan_dob,
                'number': this.mob_data.mob_stakeholder_details.data.individual_pan_details.data.individual_pan_number
              }
            };
            if (this.mob_data.mob_stakeholder_details.data.individual_pan_details.data.document_proof_files.data[0].files.data[0].mime_type == "application/pdf") {
              this.adobeIconForPersonalPan = true;
            }
          } else {
            this.pan_data = {
              'id': (typeof this.pan_data != 'undefined') ? this.pan_data.id : '',
              'url': (typeof this.pan_data != 'undefined') ? this.pan_data.url : '',
              "meta": {
                'individual_pan_first_name': this.mob_data.mob_stakeholder_details.data.individual_pan_details.data.individual_pan_first_name,
                'individual_pan_last_name': this.mob_data.mob_stakeholder_details.data.individual_pan_details.data.individual_pan_last_name,
                // 'individual_pan_gender': this.mob_data.mob_stakeholder_details.data.individual_pan_details.data.individual_pan_gender,
                'individual_pan_second_name': this.mob_data.mob_stakeholder_details.data.individual_pan_details.individual_pan_second_name,
                'dob': this.mob_data.mob_stakeholder_details.data.individual_pan_details.data.individual_pan_dob,
                'number': this.mob_data.mob_stakeholder_details.data.individual_pan_details.data.individual_pan_number
              }
            };
          }



        }
        else {
          this.pan_data = ''
        }
      }
    }

    this.update_onbord_flag = current_step;
    this.update_onbord_form_flag = current_sub_step;

  }


  updateonSubmitBusinessDetail() {
    this.loaderClasssubmit = "addLoader";
    let data = this.business_detail_bupdate.value;
    data.companies_id = this.companies_id;
    data.accounts_id = this.accounts_id;
    data.mob_business_types_id = this.mob_data.mob_business_types_id;
    // data.current_step = 1;
    // data.current_sub_step = 1;
    let id = this.mob_data.mob_business_details.data.mob_business_details_id;
    this._httpService.updateBusinessDetail(data, id)
      .subscribe((result) => {
        this.hideWarningClass = "clickHide";
        if (result.status == 200) {
          this.getMobData();
        }
      },
      (err: any) => {
        this.loaderClasssubmit = "";
        this.hideWarningClass = "";
        if (err.status != 0) { this.warning_message = JSON.parse(err._body).message; }
        if (err.status == 0) { this.warning_message = "Please check your internet connection" }
        else if (err.status == 500) { console.log('oops something went wrong, please try again!!'); }
        else if (err.status == 422) { this.error = 'some validation error'; }
        else if (err.status == 401) { this._router.navigate(['/login']); }
      },
      () => console.log());
  }

  updateonSubmitStakeholerDetail() {
    this.loaderClasssubmit = "addLoader";
    let data = this.stakeholder_detail.value;
    data.companies_id = this.companies_id;
    data.accounts_id = this.accounts_id;
    // data.current_step = 2;
    // data.current_sub_step = 2;
    data.mob_master_id = this.mob_data.mob_master_id;
    if (typeof this.pan_data != 'undefined') {
      data.files_id = [this.pan_data.id];
    }
    data.individual_pan_dob = this.datePipe.transform(data.individual_pan_dob, 'yyyy-MM-dd');
    let id = this.mob_data.mob_stakeholder_details.data.mob_stakeholder_details_id;
    this._httpService.updateStakeholderPan(data, id)
      .subscribe((result) => {
        this.hideWarningClass = "clickHide";
        if (result.status == 200) {
          this.getMobData();
        }
      },
      (err: any) => {
        this.loaderClasssubmit = "";
        this.hideWarningClass = "";
        if (err.status != 0) { this.warning_message = JSON.parse(err._body).message; }
        if (err.status == 0) { this.warning_message = "Please check your internet connection" }
        else if (err.status == 500) { console.log('oops something went wrong, please try again!!'); }
        else if (err.status == 422) { this.error = 'some validation error'; }
        else if (err.status == 401) { this._router.navigate(['/login']); }
      },
      () => console.log());
  }

  updateonSubmitStakeholerAddress() {
    this.loaderClasssubmit = "addLoader";
    if (this.stakeholder_address.valid) {

      let data = this.stakeholder_address.value;
      data.companies_id = this.companies_id;
      data.accounts_id = this.accounts_id;
      data.mob_master_id = this.mob_data.mob_master_id;
      data.aadhaar_dob = this.datePipe.transform(data.aadhaar_dob, 'yyyy-MM-dd');

      if (this.aadhar_e_data_content) {
        data.e_aadhaar_files_id = this.aadhar_e_data.id;
        data.mob_master_id = this.mob_data.mob_master_id;
        if (this.aadhar_e_data.hasOwnProperty('meta')) {
          if (this.aadhar_e_data.meta.hasOwnProperty('splitAddress')) {
            if (this.aadhar_e_data.meta.splitAddress.state1 != "") {
              data.aadhaar_state = this.aadhar_e_data.meta.splitAddress.state1;
            }
          }
        }
      } else {
        data.aadhaar_front_files_id = this.aadhar_data_front.id;
        data.aadhaar_back_files_id = this.aadhar_data_back.id;
        if (this.aadhar_data_back.hasOwnProperty('meta')) {
          if (this.aadhar_data_back.meta.hasOwnProperty('splitAddress')) {
            if (this.aadhar_data_back.meta.splitAddress.state1 != "") {
              data.aadhaar_state = this.aadhar_data_back.meta.splitAddress.state1;
            }
          }
        }
      }

      data.current_address_proof_types_id = data.current_address.address_proofs_id;
      data.current_address_proofs_files_id = this.current_address_proofs_files_id;
      data.is_current_address_different = this.mob_data.mob_stakeholder_details.data.is_current_address_different;
      if (data.is_current_address_different == 1) {
        data.is_current_address_different = 1;
        delete data.current_address.address_proofs_id;
      } else {
        data.is_current_address_different = 0;
        data.current_address.address_line = data.aadhaar_address
        data.current_address.city = data.aadhaar_city;
        data.current_address.state = data.aadhaar_state;
        data.current_address.pincode = data.aadhaar_pin;

        delete data.current_address.address_proofs_id;
      }
      let id = this.mob_data.mob_stakeholder_details.data.mob_stakeholder_details_id;
      this._httpService.updateAadhaarDetails(data, id)
        .subscribe((result) => {
          this.hideWarningClass = "clickHide";
          if (result.status == 200) {
            this.getMobData();
          }
        },
        (err: any) => {
          this.loaderClasssubmit = "";
          this.hideWarningClass = "";
          if (err.status != 0) { this.warning_message = JSON.parse(err._body).message; }
          if (err.status == 0) { this.warning_message = "Please check your internet connection" }
          else if (err.status == 500) { console.log('oops something went wrong, please try again!!'); }
          else if (err.status == 422) { this.error = 'some validation error'; }
          else if (err.status == 401) { this._router.navigate(['/login']); }

        },
        () => console.log());
    } else {
      this.loaderClasssubmit = "";
      Object.keys(this.stakeholder_address.controls).forEach(field => {
        const control = this.stakeholder_address.get(field);
        control.markAsTouched({ onlySelf: true });
      });
    }

  }

  updateonSubmitBusinessAddress() {
    this.loaderClasssubmit = "addLoader";
    let data = this.business_address.value;
    data.companies_id = this.companies_id;
    data.accounts_id = this.accounts_id;
    // data.current_step = 3;
    // data.current_sub_step = 1;
    data.mob_master_id = this.mob_data.mob_master_id;
    data.operation_address = data.registered_address;
    data.address_proof.files_id = this.business_current_address_proofs_files_id;
    let id = this.mob_data.mob_address_details.data.mob_address_details_id;
    this._httpService.updateAddressDetail(data, id)
      .subscribe((result) => {
        this.hideWarningClass = "clickHide";
        if (result.status == 200) {
          this.getMobData();
        }
      },
      (err: any) => {
        this.loaderClasssubmit = "";
        this.hideWarningClass = "";
        if (err.status != 0) { this.warning_message = JSON.parse(err._body).message; }
        if (err.status == 0) { this.warning_message = "Please check your internet connection" }
        else if (err.status == 500) { console.log('oops something went wrong, please try again!!'); }
        else if (err.status == 422) { this.error = 'some validation error'; }
        else if (err.status == 401) { this._router.navigate(['/login']); }
      },
      () => console.log());

  }
  //////////////////// UPDATE CODE END /////////////////////////////////////////////////////////////////////////////////////////////////



}
