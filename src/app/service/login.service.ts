import { Injectable } from '@angular/core';
import { Http, Response, HttpModule, Headers, RequestOptions, BaseRequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Rx';
import { BaseService } from './base.service';

import { BUSINESS_TYPE } from '../mock/business_type';
//import { CookieService } from 'ngx-cookie';


@Injectable()
export class LoginService {
  public token: string;
  public companies_id;
  public accounts_id;

  private loggedIn = false;
  constructor(private _http: Http, private http: BaseService) {

    // var currentUser = JSON.parse(localStorage.getItem('currentUser'));

    // this.token = currentUser && currentUser.token;

    // this.companies_id = currentUser && currentUser.company_details.companies_id;

    // this.accounts_id = currentUser && currentUser.account_details.accounts_id;


  }

  private _base_url: string = this.http._base_url;

  private _urlLogin: string = "users/login";
  private _urlForgot1: string = "users/forgot_password/send_code";
  private _urlForgot2: string = "users/forgot_password/verify_code";
  private _urlForgot3: string = "users/forgot_password/reset";

  private _userAvailability: string = "users/";
  private _registerOtp: string = "users/register/otp";
  private _registerUser: string = "users/register";


  loginAvailabilty(data) {
    return this._http.get(this._base_url + this._userAvailability + data, '')
      .map((res: Response) => res.json());
  }

  registerOtp(data) {
    return this._http.post(this._base_url + this._registerOtp, data)
      .map((res: Response) => res.json());
  }

  registerUser(data) {
    return this._http.post(this._base_url + this._registerUser, data)
      .map((res: Response) => res.json());
  }

  //static data for business types
  getBusinessTypes() {
    return BUSINESS_TYPE;
  }


  login(data): Observable<any> {
    return this._http.post(this._base_url + this._urlLogin, data)
      .map((response: Response) => {
        // login successful if there's a jwt token in the response
        let token = response.json() && response.json().meta.token;
        let data1 = response.json() && response.json();
        let user_permission = response.json() && response.json().meta.user_permission;
        let account_details = response.json() && response.json().data.account.data[0];
        let company_details = response.json() && response.json().data.account.data[0].company.data[0];
        //console.log(user_permission);

        if (token) {
          // set token property
          this.token = token;
          this.companies_id = response.json() && response.json().data.account.data[0].company.data[0].companies_id;
          this.accounts_id = response.json() && response.json().data.account.data[0].accounts_id;
          // store username and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem('currentUser', JSON.stringify({ username: data.login, token: token, data: data1, user_permission: user_permission, account_details: account_details, company_details: company_details }));
          // this._cookieService.putObject(
          //   'currentUser',
          //   { username: data.login, token: token, data: data1, user_permission: user_permission, account_details: account_details, company_details: company_details },
          //   {
          //     domain:'http://localhost:4200/'
          //   }
          //   );
          // let teee:any;
          //  teee=this._cookieService.getObject('currentUser');
          // console.log(teee.data.data.users_id);
          // return true to indicate successful login
          return data1;
        } else {
          // return false to indicate failed login
          return data1;
        }
      });
  }

  logout(): void {
    // clear token remove user from local storage to log user out
    this.token = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('camStatus');
    localStorage.clear();
  }
  forgotPassword1(data) {
    var headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this._http.post(this._base_url + this._urlForgot1, data, {
      headers: headers
    })
      .map((res) => {
        if (res.status == 201) {
          return true;
        }
        return false;
      })
  }

  forgotPassword2(data) {
    let result: any;
    return this._http.post(this._base_url + this._urlForgot2, data)
      .map((res) => {
        if (res.status == 200) {
          let result = { "status": true, 'data': res.json() };
          return result;
        }
        return result;
      })
  }

  forgotPassword3(data) {
    return this._http.post(this._base_url + this._urlForgot3, data)
      .map((res) => {
        if (res.status == 201) {
          return true;
        }
        return false;
      })
  }

  test(){
    this.http._base_url;
  }


}
