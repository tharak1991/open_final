import { Component, OnInit, ElementRef, ViewChild, Renderer } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { LoginService } from '../service/login.service';
import { CustomValidators } from 'ng2-validation';
import { SlimLoadingBarService } from 'ng2-slim-loading-bar';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	providers: [LoginService]
})
export class LoginComponent implements OnInit {

	constructor(private _renderer: Renderer, private _router: Router, private route: ActivatedRoute, private _httpService: LoginService, private slimLoadingBarService: SlimLoadingBarService) { }
	public login;
	public verification_code;
	public forgot_step = 1;
	public error;
	public error1;
	public error2;
	public error3;

	public submitLoaderClass = "";

	public password = new FormControl('', [Validators.required, Validators.pattern('^(?=.*?[a-zA-Z])(?=.*?[0-9]).{8,}$')]);


	@ViewChild('otp1') otp1: ElementRef;
	@ViewChild('otp2') otp2: ElementRef;
	@ViewChild('otp3') otp3: ElementRef;
	@ViewChild('otp4') otp4: ElementRef;
	@ViewChild('otp5') otp5: ElementRef;
	@ViewChild('otp6') otp6: ElementRef;
	@ViewChild('sub') sub: ElementRef;

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


	}

	loginForm = new FormGroup({
		login: new FormControl('', [Validators.required, Validators.pattern('(^[789][0-9]{9}$)|(^[a-zA-Z0-9_\.\+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-\.]+$)')]),
		password: new FormControl('', [Validators.required])
	});

	ForgotForm1 = new FormGroup({
		login: new FormControl('', [Validators.required, Validators.pattern('(^[789][0-9]{9}$)|(^[a-zA-Z0-9_\.\+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-\.]+$)')])
	});

	ForgotForm2 = new FormGroup({
		otp1: new FormControl('', [Validators.required, Validators.maxLength(1)]),
		otp2: new FormControl('', [Validators.required, Validators.maxLength(1)]),
		otp3: new FormControl('', [Validators.required, Validators.maxLength(1)]),
		otp4: new FormControl('', [Validators.required, Validators.maxLength(1)]),
		otp5: new FormControl('', [Validators.required, Validators.maxLength(1)]),
		otp6: new FormControl('', [Validators.required, Validators.maxLength(1)]),
	});

	ForgotForm3 = new FormGroup({
		password: this.password,
		c_password: new FormControl('', [Validators.required, CustomValidators.equalTo(this.password)])
	});


	onSubmit() {
		this.submitLoaderClass = "addLoader";
		let udata = this.loginForm.value;
		this._httpService.login(udata)
			.subscribe((result) => {
				this.submitLoaderClass = "";

				if (result.status == 200) {
					if (typeof result.data.account.data[0].company.data[0].mob_master == 'undefined') {
						this._router.navigate(['/onboard-individual']);
					} else {
						let user_type = result.data.account.data[0].company.data[0].mob_master.data.mob_business_types_id;
						let user_current = result.data.account.data[0].company.data[0].mob_master.data.current_step;
						let user_current_sub = result.data.account.data[0].company.data[0].mob_master.data.current_sub_step;
						if (user_current == 4 && user_current_sub == 2) {
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
					}
				} else {
					this._router.navigate(['/login']);
				}

				this.hideWarningClass = "clickHide";
			},
			(err: any) => {
				this.submitLoaderClass = "";
				this.errorHandle(err);
				// if (err.status == 0) { console.log('please check your internet connection'); }
				// else if (err.status == 500) { console.log('oops something went wrong, please try again!!'); }
				if (err.status == 401) { this.error = 'Username and password does not match'; }
				else if (err.status == 422) { this.error = 'This account is not registered with us'; }
			},

			() => console.log());
	}

	public submitLoaderClass1="";
	onSubmitForgot1() {
		this.submitLoaderClass1 = "addLoader";
		
		this.slimLoadingBarService.start();
		let data = this.ForgotForm1.value;
		this.login = this.ForgotForm1.value.login;
		this._httpService.forgotPassword1(data)
			.subscribe((result) => {
				if (result == true) {
					this.forgot_step = 2;
					this.error1 = "";
					this.slimLoadingBarService.complete();
					this.submitLoaderClass1 = "";
					
				}
				this.hideWarningClass = "clickHide";
			},
			(err: any) => {
				this.submitLoaderClass1 = "";
				this.errorHandle(err);
				if (err.status == 500) { console.log('oops something went wrong, please try again!!'); }
				else if (err.status == 422) {
					this.error1 = 'This account is not registered with us';
					this.slimLoadingBarService.complete();
				}
			},
			() => console.log());
	}


	onSubmitForgot2() {
		this.submitLoaderClass1 = "addLoader";
		
		this.slimLoadingBarService.start();
		let data = this.ForgotForm2.value;
		let otp = data.otp1 + "" + "" + data.otp2 + "" + "" + data.otp3 + "" + "" + "" + data.otp4 + "" + "" + data.otp5 + "" + data.otp6;
		let data1 = { "login": this.login, "otp": otp };
		this._httpService.forgotPassword2(data1)
			.subscribe((result) => {
				if (result.status == true) {
					this.forgot_step = 3;
					this.error2 = "";
					this.verification_code = result.data.data.verification_code;
					this.slimLoadingBarService.complete();
					this.submitLoaderClass1 = "";
		

				}
				this.hideWarningClass = "clickHide";
			},
			(err: any) => {
				this.submitLoaderClass1 = "";
				this.errorHandle(err);
				if (err.status == 401) {
					this.error2 = 'Otp does not match';
					this.slimLoadingBarService.complete();
				}
			},
			() => console.log());
	}

	onSubmitForgot3() {
		this.submitLoaderClass1 = "addLoader";
		
		this.slimLoadingBarService.start();
		let data = this.ForgotForm3.value;
		let data1 = { "login": this.login, "new_password": this.ForgotForm3.value.password, "verification_code": this.verification_code };
		this._httpService.forgotPassword3(data1)
			.subscribe((result) => {
				if (result == true) {
					this.forgot_step = 4;
					this.error3 = "";
					this.slimLoadingBarService.complete();
					this.submitLoaderClass1 = "";
		
				}
				this.hideWarningClass = "clickHide";
			},
			(err: any) => {
				this.submitLoaderClass1 = "";
				this.errorHandle(err);
				if (err.status == 401) {
					this.error3 = "something went wrong";
					this.slimLoadingBarService.complete();
				}
			},
			() => console.log());
	}
	next(el, event) {
		if ((event.keyCode >= 48 && event.keyCode <= 57) || (event.keyCode >= 96 && event.keyCode <= 105))
			if(event.target.value.length>0)
			this._renderer.invokeElementMethod(el, 'focus', []);
		this.error = "";
	}
	check_login() {
		this.error = "";
		this.error1 = "";
	}

	//error handler
	public warning_message = "";
	public hideWarningClass = "clickHide";
	public loaderClasssubmit = "addLoader";
	errorHandle(err){
		this.loaderClasssubmit = "";
		this.hideWarningClass = "";
		if (err.status == 0) { 
			this.warning_message = "Please check your internet connection" 
			return;
		}
		this.warning_message = JSON.parse(err._body).message;
		
	}

	hideWarning() {
		this.hideWarningClass = "clickHide";
	}
	//error handler

}
