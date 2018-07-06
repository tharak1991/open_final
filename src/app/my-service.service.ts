import { Injectable } from '@angular/core';
import { Http, Response, HttpModule, Headers, RequestOptions, BaseRequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import {Observable} from 'rxjs/Rx';

import { BUSINESS_CATGORIES } from './mock/business_category';
import { BUSINESS_TYPE } from './mock/business_type';
import { ADDRESS_PROOF } from './mock/address_proof_type';
import { STATE_LIST } from './mock/state_list';

@Injectable()
export class MyServiceService {
  public token: string;
  public companies_id;
  public accounts_id;
  
  private loggedIn = false;
  constructor(private _http: Http) {
      var currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.token = currentUser && currentUser.token;
      this.companies_id = currentUser && currentUser.company_details.companies_id;
      this.accounts_id  = currentUser && currentUser.account_details.accounts_id;
  }

  private _base_url: string = "http://staging.bankopen.co/api/";
  
  private _urlLogin: string   = this._base_url + "users/login";
  private _urlForgot1: string = this._base_url + "users/forgot_password/send_code";
  private _urlForgot2: string = this._base_url + "users/forgot_password/verify_code";
  private _urlForgot3: string = this._base_url + "users/forgot_password/reset";

    //added by DJ
  private _userAvailability: string = this._base_url + "users/";
  private _registerOtp: string = this._base_url + "users/register/otp";
  private _registerUser: string = this._base_url + "users/register";

  //individual/proprietership url
  private _get_mob_details: string = this._base_url + "get_mob_details";
  private _business_details: string = this._base_url + "mob/business_details";
  private _individual_pan: string = this._base_url + "file/individualpan";
  private _deleteFiles: string = this._base_url + "files/";
  private _individual_aadhar: string = this._base_url + "file/aadhaar";
  private _stakeholder_pan: string = this._base_url + "mob/stakeholder/pan";
  private _stakeholder_address: string = this._base_url + "mob/stakeholder/aadhaar";
  private _fileUploadOthers: string = this._base_url + "file/others";
  private _fileGenerate_Aadharotp: string = this._base_url + "mob/generate_aadhaar_otp";
  private _fileSubmit_Aadharotp: string = this._base_url + "mob/esign_document";
  private _createBusiness_address: string = this._base_url + "mob/address_details";
  
  //////////individual/proprietership start ////////////////

  //////////trust////////

  private _business_pan: string = this._base_url + "file/businesspan";
  private _business_detail_update: string = this._base_url + "mob/business_details/";
  
  



  getMobDetails(){
    var currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.token = currentUser && currentUser.token;
    this.companies_id = currentUser && currentUser.company_details.companies_id;
    this.accounts_id  = currentUser && currentUser.account_details.accounts_id;

    let headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    let options = new RequestOptions({ headers: headers });
    let url = this._get_mob_details+"?companies_id="+this.companies_id+"&accounts_id="+this.accounts_id;
    return this._http.get(url, options)
    .map((response: Response) => response.json());
  }

  business_details(data){
    let headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    let options = new RequestOptions({ headers: headers });
    return this._http.post(this._business_details,data, options)
    .map((response: Response) => response.json());
  }

  individualPan(file){

    var currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.token = currentUser && currentUser.token;
    this.companies_id = currentUser && currentUser.company_details.companies_id;
    this.accounts_id  = currentUser && currentUser.account_details.accounts_id;

    let formData: FormData = new FormData();
    formData.append('file', file, file.name);
    let headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    let options = new RequestOptions({ headers: headers });
    let url = this._individual_pan+"?companies_id="+this.companies_id+"&accounts_id="+this.accounts_id;
    return this._http.post(url,formData, options)
    .map((response: Response) => response.json());
  }

  individualPanFormdata(formData){

    var currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.token = currentUser && currentUser.token;
    this.companies_id = currentUser && currentUser.company_details.companies_id;
    this.accounts_id  = currentUser && currentUser.account_details.accounts_id;

    let headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    let options = new RequestOptions({ headers: headers });
    let url = this._individual_pan+"?companies_id="+this.companies_id+"&accounts_id="+this.accounts_id;
    return this._http.post(url,formData, options)
    .map((response: Response) => response.json());
  }

  deleteFiles(id){
    let headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    let options = new RequestOptions({ headers: headers });
    let url = this._deleteFiles+id;
    return this._http.delete(url, options)
    .map((response: Response) => response.json());
  }

  individualAadhar(file,){
    var currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.token = currentUser && currentUser.token;
    this.companies_id = currentUser && currentUser.company_details.companies_id;
    this.accounts_id  = currentUser && currentUser.account_details.accounts_id;
    
    let formData: FormData = new FormData();
    formData.append('file', file, file.name);
    let headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    let options = new RequestOptions({ headers: headers });
    let url = this._individual_aadhar+"?companies_id="+this.companies_id+"&accounts_id="+this.accounts_id;
    return this._http.post(url,formData, options)
    .map((response: Response) => response.json());
  }

  individualAadharFormdata(formData,){
    var currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.token = currentUser && currentUser.token;
    this.companies_id = currentUser && currentUser.company_details.companies_id;
    this.accounts_id  = currentUser && currentUser.account_details.accounts_id;

    let headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    let options = new RequestOptions({ headers: headers });
    let url = this._individual_aadhar+"?companies_id="+this.companies_id+"&accounts_id="+this.accounts_id;
    return this._http.post(url,formData, options)
    .map((response: Response) => response.json());
  }

  stakeholderPan(data){
    let headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    let options = new RequestOptions({ headers: headers });
    return this._http.post(this._stakeholder_pan,data, options)
    .map((response: Response) => response.json());
  }

  stakeholderAadharAddress(data){
    let headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    let options = new RequestOptions({ headers: headers });
    return this._http.post(this._stakeholder_address,data, options)
    .map((response: Response) => response.json());
  }

  fileUploadOthers(file){
    var currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.token = currentUser && currentUser.token;
    this.companies_id = currentUser && currentUser.company_details.companies_id;
    this.accounts_id  = currentUser && currentUser.account_details.accounts_id;

    let formData: FormData = new FormData();
    formData.append('file', file, file.name);
    let headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    let options = new RequestOptions({ headers: headers });
    let url = this._fileUploadOthers+"?companies_id="+this.companies_id+"&accounts_id="+this.accounts_id;
    return this._http.post(url,formData, options)
    .map((response: Response) => response.json());
  }

  generateAadharotp(data){
    let headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    let options = new RequestOptions({ headers: headers });
    return this._http.post(this._fileGenerate_Aadharotp,data, options)
    .map((response: Response) => response.json());
  }

  submitAadharotp(data){
    let headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    let options = new RequestOptions({ headers: headers });
    return this._http.post(this._fileSubmit_Aadharotp,data, options)
    .map((response: Response) => response.json());
  }
  
  createBusinessAddress(data){
    let headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    let options = new RequestOptions({ headers: headers });
    return this._http.post(this._createBusiness_address,data, options)
    .map((response: Response) => response.json());
  }

///////////individual/proprietership end/////////////////////////

  businessPan(file){
    var currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.token = currentUser && currentUser.token;
    this.companies_id = currentUser && currentUser.company_details.companies_id;
    this.accounts_id  = currentUser && currentUser.account_details.accounts_id;

    let formData: FormData = new FormData();
    formData.append('file', file, file.name);
    let headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    let options = new RequestOptions({ headers: headers });
    let url = this._business_pan+"?companies_id="+this.companies_id+"&accounts_id="+this.accounts_id;
    return this._http.post(url,formData, options)
    .map((response: Response) => response.json());
  }

  businessPanFormdata(formData){
    var currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.token = currentUser && currentUser.token;
    this.companies_id = currentUser && currentUser.company_details.companies_id;
    this.accounts_id  = currentUser && currentUser.account_details.accounts_id;

    let headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    let options = new RequestOptions({ headers: headers });
    let url = this._business_pan+"?companies_id="+this.companies_id+"&accounts_id="+this.accounts_id;
    return this._http.post(url,formData, options)
    .map((response: Response) => response.json());
  }

  business_detail_update(data,id){
    let headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    let options = new RequestOptions({ headers: headers });
    let url =this._business_detail_update+id;
    return this._http.put(url,data, options)
    .map((response: Response) => response.json());
  }

  ////////trust////////////////////////
  
  loginAvailabilty(data) {
    return this._http.get(this._userAvailability + data)
      .map((res: Response) => res.json());
  }

  registerOtp(data) {
    return this._http.post(this._registerOtp, data)
      .map((res: Response) => res.json());
  }

  registerUser(data) {
    return this._http.post(this._registerUser, data)
      .map((res: Response) => res.json());
  }

  
  //static data for business categories
  getBusinessCategories() {
    return BUSINESS_CATGORIES;
  }
  //static data for business types
  getBusinessTypes() {
    return BUSINESS_TYPE;
  }

  //static data for address proof types
  getAddressProofTypes() {
    return ADDRESS_PROOF;
  }

  //static data for address proof types
  getStateList() {
    return STATE_LIST;
  }


  login(data): Observable<boolean> 
  {
        return this._http.post(this._urlLogin, data)
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
                    // store username and jwt token in local storage to keep user logged in between page refreshes
                    localStorage.setItem('currentUser', JSON.stringify({ username: data.login, token: token,data:data1,user_permission:user_permission,account_details:account_details,company_details:company_details}));
 
                    // return true to indicate successful login
                    return true;
                } else {
                    // return false to indicate failed login
                    return false;
                }
            });
  }
 
  logout(): void {
      // clear token remove user from local storage to log user out
      this.token = null;
      localStorage.removeItem('currentUser');
  }
  forgotPassword1(data) {
    var headers = new Headers();
		headers.append('Content-Type','application/json');
    return this._http.post(this._urlForgot1, data,{
			headers:headers
		})
    .map((res) => {
        if(res.status==201){
          return true;
        }
        return false;
    })
  }

  forgotPassword2(data) {
    let result:any;
    return this._http.post(this._urlForgot2, data)
     .map((res) => {
          if(res.status==200){
            let result ={"status":true,'data':res.json()};
            return result;
          }
          return result;
      })
  }

  forgotPassword3(data) {
    return this._http.post(this._urlForgot3, data)
    .map((res) => {
        if(res.status==201){
          return true;
        }
        return false;
    })
  }

  demoapi(){
     // add authorization header with jwt token
        let headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
        let options = new RequestOptions({ headers: headers });
 
        // get users from api
        return this._http.get('/api/users', options)
            .map((response: Response) => response.json());
  }

  uploadImg(data){
    let formData: FormData = new FormData();
    formData.append('image', data, data.name);
    let headers = new Headers();
    let options = new RequestOptions({ headers: headers });
    return this._http.post('http://localhost/live/home/check_image',formData, options)
    .map((response: Response) => response.json());
  }

  uploadImg2(formData){
    // let formData: FormData = new FormData();
    // formData.append('image', data, data.name);
    let headers = new Headers();
    let options = new RequestOptions({ headers: headers });
    return this._http.post('http://localhost/live/home/check_image',formData, options)
    .map((response: Response) => response.json());
  }

}
