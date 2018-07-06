import { Component, OnInit, ViewChild, ElementRef, Renderer } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { LoginService } from '../service/login.service';
import { ConfigService } from '../service/config.service';
import { CustomValidators } from 'ng2-validation';
import { SlimLoadingBarService } from 'ng2-slim-loading-bar';

declare let Intercom: any;
declare let mixpanel: any;



@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  providers: [LoginService]
})

export class RegisterComponent implements OnInit {
  @ViewChild('sendotp') sendotp: ElementRef;
  @ViewChild('otp1') otp1: ElementRef;
  @ViewChild('otp2') otp2: ElementRef;
  @ViewChild('otp3') otp3: ElementRef;
  @ViewChild('otp4') otp4: ElementRef;
  @ViewChild('otp5') otp5: ElementRef;
  @ViewChild('otp6') otp6: ElementRef;
  @ViewChild('sub') sub: ElementRef;
  @ViewChild('closeBtn') closeBtn: ElementRef;


  //Local variables
  pass_text: string = "password";
  verification_code;
  businees: any[] = [];
  email_check: boolean = true;
  mobile_check: boolean = true;
  new_mobile_check: boolean = true;
  last_name_check: boolean = true;
  showOtpForm: boolean = true;
  showTimer: boolean = true;
  invalid_otp: boolean = false;
  fdata: any;
  timer = 30;
  timer_status = 0;
  mobile_number: number;
  token: string;
  error: string = "";
  public loaderClass: string = "";

  public inverval;

  //CONSTANT TEXT PROPERTIES INHERITED FROM GLOBAL CONTENT MANAGER

  constructor(private _config: ConfigService, private _renderer: Renderer, private _router: Router, private route: ActivatedRoute, private _httpService: LoginService, private slimLoadingBarService: SlimLoadingBarService) {

  }



  //forms start//
  registrationForm = new FormGroup({
    first_name: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z ]+'), Validators.maxLength(50)]),
    email: new FormControl('', [Validators.required, CustomValidators.email]),
    username: new FormControl('', [Validators.required, Validators.pattern('^[789][0-9]{9}$')]),
    password: new FormControl('', [Validators.required, Validators.pattern('^(?=.*?[a-zA-Z])(?=.*?[0-9]).{8,}$'), Validators.minLength(8), Validators.maxLength(20)]),
    business_type: new FormControl('')
  });

  otpForm = new FormGroup({
    otp1: new FormControl('', [Validators.required, Validators.maxLength(1)]),
    otp2: new FormControl('', [Validators.required, Validators.maxLength(1)]),
    otp3: new FormControl('', [Validators.required, Validators.maxLength(1)]),
    otp4: new FormControl('', [Validators.required, Validators.maxLength(1)]),
    otp5: new FormControl('', [Validators.required, Validators.maxLength(1)]),
    otp6: new FormControl('', [Validators.required, Validators.maxLength(1)]),
  });

  changeNumberForm = new FormGroup({
    newNumber: new FormControl('', [Validators.required, Validators.pattern('^[789][0-9]{9}$')])

  });
  //forms end ///

  ngOnInit() {
    var currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let token = currentUser && currentUser.token;
    if (currentUser && typeof currentUser.account_details != 'undefined' && typeof currentUser.account_details.company != 'undefined'
      && typeof currentUser.account_details.company.data != 'undefined' && typeof currentUser.account_details.company.data[0].mob_master != 'undefined'
    ) {
      let user_type = currentUser && currentUser.account_details.company.data[0].mob_master.data.mob_business_types_id;
      let current_step = currentUser && currentUser.account_details.company.data[0].mob_master.data.current_step;
      let current_sub_step = currentUser && currentUser.account_details.company.data[0].mob_master.data.current_sub_step;
      if (token) {
        if (current_step == 4 && current_sub_step == 2) {
          this._router.navigate(['/dashboard']);
        } else {
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
      } else {
        this._httpService.logout();
      }
    } else {
      this._httpService.logout();

    }
    this.businessTypes();
  }


  next(el, event) {
    if ((event.keyCode >= 48 && event.keyCode <= 57) || (event.keyCode >= 96 && event.keyCode <= 105))
      if (event.target.value.length > 0)
        this._renderer.invokeElementMethod(el, 'focus', []);
    this.invalid_otp = false;
  }

  public pass_image = "eyeclose_icon.svg";
  viewPassword() {
    if (this.pass_text == "password") {
      this.pass_text = "text";
      this.pass_image = "eye_icon.svg";

    } else {
      this.pass_text = "password";
      this.pass_image = "eyeclose_icon.svg";


    }
  }

  businessTypes() {
    this.businees = this._httpService.getBusinessTypes();
  }


  checkEmailAvailablity(event) {
    let data = event.target.value;
    if (data != '') {
      this._httpService.loginAvailabilty(data)
        .subscribe((result) => {

          if (result.login_available == true) {
            this.email_check = true;
          } else {
            this.email_check = false;
          }
        },
        (err: any) => {
          if (err.status == 0) { console.log('please check your internet connection'); }
          else if (err.status == 500) { console.log('oops something went wrong, please try again!!'); }

        },
        () => console.log());
    }
  }

  checkMobileAvailablity(event) {
    let data = event.target.value;
    if (data != '') {
      this._httpService.loginAvailabilty(data)
        .subscribe((result) => {
          if (result.login_available == true) {
            this.mobile_check = true;
          } else {
            this.mobile_check = false;
          }
        },
        (err: any) => {
          if (err.status == 0) { console.log('please check your internet connection'); }
          else if (err.status == 500) { console.log('oops something went wrong, please try again!!'); }
        },
        () => console.log());
    }
  }

  checkNewMobileAvailablity(event) {
    let data = event.target.value;
    if (data != '') {
      this._httpService.loginAvailabilty(data)
        .subscribe((result) => {
          if (result.login_available == true) {
            this.new_mobile_check = true;
          } else {
            this.new_mobile_check = false;
          }
        },
        (err: any) => {
          if (err.status == 0) { console.log('please check your internet connection'); }
          else if (err.status == 500) { console.log('oops something went wrong, please try again!!'); }
        },
        () => console.log());
    }
  }

  onSubmitOtp() {
    this.loaderClass = "addLoader";
    this.slimLoadingBarService.start();
    let data = this.otpForm.value;
    let otp = data.otp1 + "" + "" + data.otp2 + "" + "" + data.otp3 + "" + "" + "" + data.otp4 + "" + "" + data.otp5 + "" + data.otp6;
    this.fdata.otp = otp;
    this._httpService.registerUser(this.fdata)
      .subscribe((result) => {
        if (result.status == 200) {
          this.loaderClass = "";
          this.slimLoadingBarService.complete();
          this.invalid_otp = false;
          this.error = "";
          if (result.meta.token) {

            //intercom code
            Intercom("boot", {
              app_id: this._config._intercom_id,
              name: this.fdata.first_name + ' ' + this.fdata.last_name,
              email: this.fdata.email,
              phone: this.fdata.username,
              user_hash: result.data.intercom_user_hash,
              user_id: result.data.users_id
            });

            Intercom('update');
            //intercom code

            //mixpanel code
            var todaysDate = new Date();

            mixpanel.identify(result.data.users_id);
            mixpanel.people.set({
              "$first_name": this.fdata.first_name,
              "$last_name": this.fdata.last_name,
              "$created": todaysDate,
              "$email": this.fdata.email
            });
            //mixpanel code

            this.token = result.meta.token;
            let data1 = result;
            let user_permission = result.meta.user_permission;
            let account_details = result.data.account.data[0];
            let company_details = result.data.account.data[0].company.data[0];
            localStorage.setItem('currentUser', JSON.stringify({ username: data.login, token: this.token, data: data1, user_permission: user_permission, account_details: account_details, company_details: company_details }));
            this.closeBtn.nativeElement.click();

            let user_type = this.fdata.business_type;
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

          } else {
            this._router.navigate(['/register']);

          }

        }
      },
      (err: any) => {
        this.loaderClass = "";
        if (err.status == 0) { console.log('please check your internet connection'); }
        else if (err.status == 500) { console.log('oops something went wrong, please try again!!'); }
        else if (err.status == 401) { this.invalid_otp = true; }
        else if (err.status == 422) { this.error = 'Unable to register user'; }
      },
      () => console.log());
  }

  sendOtp(username) {
    this._httpService.registerOtp({ "username": username })
      .subscribe((result) => {
        this.slimLoadingBarService.complete();
      },
      (err: any) => {
        if (err.status == 0) { console.log('please check your internet connection'); }
        else if (err.status == 500) { console.log('oops something went wrong, please try again!!'); }
      },
      () => console.log());
    this.mobile_number = username;
    this.openOtpModal();
    this.slimLoadingBarService.start();

    this.inverval = setInterval(() => {
      if (this.timer_status == 0) {
        this.timer--;
        if (this.timer == 0) {
          this.timer_status = 1
        };
      }
    }, 1000);
  }

  resendOtp() {
    clearInterval(this.inverval);
    this.timer_status = 0;
    this.timer = 30;
    this._httpService.registerOtp({ "username": this.mobile_number })
      .subscribe((result) => {
        //this.slimLoadingBarService.complete();
      },
      (err: any) => {
        if (err.status == 0) { console.log('please check your internet connection'); }
        else if (err.status == 500) { console.log('oops something went wrong, please try again!!'); }
      },
      () => console.log());

    this.inverval = setInterval(() => {
      if (this.timer_status == 0) {
        this.timer--;
        if (this.timer == 0) {
          this.timer_status = 1
        };
      }
    }, 1000);
  }

  onSubmit() {
    this.fdata = this.registrationForm.value;
    let name = this.fdata.first_name.split(' ');
    this.fdata.first_name = name[0];
    this.fdata.last_name = name[1];

    this.sendOtp(this.fdata.username);
  }

  checkLastName(event) {
    if (event.target.value.length != 0) {
      let name = event.target.value.split(' ');
      if (name.length > 1 && name[1].length > 0) {
        this.last_name_check = true;
      } else {
        this.last_name_check = false;
      }
    } else {
      this.last_name_check = true;
    }
  }

  hideOtpForm() {
    this.showOtpForm = false;
    this.showTimer = false;
    clearInterval(this.inverval);
  }

  clearMsg() {
    this.new_mobile_check = true;
  }

  clearMsgForUsername() {
    this.mobile_check = true;
  }

  clearMsgForEmail() {
    this.email_check = true;
  }

  clearMsgForLastName() {
    this.last_name_check = true;
  }

  changeNumberFormSubmit() {
    var data = this.changeNumberForm.value;
    this._httpService.registerOtp({ "username": data.newNumber })
      .subscribe((result) => {
        this.otp1.nativeElement.value = '';
        this.otp2.nativeElement.value = '';
        this.otp3.nativeElement.value = '';
        this.otp4.nativeElement.value = '';
        this.otp5.nativeElement.value = '';
        this.otp6.nativeElement.value = '';
      },
      (err: any) => {
        if (err.status == 0) { console.log('please check your internet connection'); }
        else if (err.status == 500) { console.log('oops something went wrong, please try again!!'); }
      },
      () => console.log());
    this.mobile_number = data.newNumber;
    this.fdata.username = this.mobile_number;
    this.timer = 30;
    this.showOtpForm = true;
    this.showTimer = true;
    this.timer_status = 0;
    this.inverval = setInterval(() => {
      if (this.timer_status == 0) {
        this.timer--;
        if (this.timer == 0) {
          this.timer_status = 1
        };
      }
    }, 1000);
  }

  private openOtpModal(): void {
    this.sendotp.nativeElement.click();
  }


}

