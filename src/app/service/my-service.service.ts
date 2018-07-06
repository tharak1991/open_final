import { Injectable } from '@angular/core';
import { Http, Response, HttpModule, Headers, RequestOptions, BaseRequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import {Observable} from 'rxjs/Rx';
import { BaseService } from './base.service';

import { BUSINESS_CATGORIES } from '../mock/business_category';
import { BUSINESS_TYPE } from '../mock/business_type';
import { ADDRESS_PROOF } from '../mock/address_proof_type';
import { STATE_LIST } from '../mock/state_list';

@Injectable()
export class MyServiceService {
  public token: string;
  public companies_id;
  public accounts_id;
  
  private loggedIn = false;
  constructor(private _http: Http,private http: BaseService) {
      var currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.token = currentUser && currentUser.token;
      this.companies_id = currentUser && currentUser.company_details.companies_id;
      this.accounts_id  = currentUser && currentUser.account_details.accounts_id;
  }

  private _base_url: string = "http://staging.bankopen.co/api/";
  
  private _urlLogin: string   =  "users/login";
  private _urlForgot1: string =  "users/forgot_password/send_code";
  private _urlForgot2: string =  "users/forgot_password/verify_code";
  private _urlForgot3: string =  "users/forgot_password/reset";

    //added by DJ
  private _userAvailability: string =   "users/";
  private _registerOtp: string =   "users/register/otp";
  private _registerUser: string =   "users/register";

  //individual/proprietership url
  private _get_mob_details: string =   "get_mob_details";
  private _business_details: string =   "mob/business_details";
  private _individual_pan: string =   "file/individualpan";
  private _deleteFiles: string =   "files/";
  private _individual_aadhar: string =   "file/aadhaar";
  private _stakeholder_pan: string =   "mob/stakeholder/pan";
  private _stakeholder_address: string =   "mob/stakeholder/aadhaar";
  private _fileUploadOthers: string =   "file/others";
  private _fileGenerate_Aadharotp: string =   "mob/generate_aadhaar_otp";
  private _fileSubmit_Aadharotp: string =   "mob/esign_document";
  private _createBusiness_address: string =   "mob/address_details";
  
  //////////individual/proprietership start ////////////////

  //////////trust////////
  private _business_pan: string =   "file/businesspan";
  private _business_detail_update: string =   "mob/business_details/";

  private  _urlContactDetails: string = "contacts";
  private _urlItem: string = "items";
  private _urlCategoryIncome: string = "categories/income";
  private _urlCategoryExpense: string = "categories/expense";
  private _urlGetBankDetail: string = "ifsc/";
  private _urlTransferPayment: string = "payment";
  
  

  

  // private limited url 
  private _create_director_detail: string =   "mob/directors";
  private _update_business_detail: string =   "mob/business_details";
  private _update_address_detail: string =   "mob/address_details";
  private _verification_aadhar: string =   "verification/aadhar";
  private _update_aadhaar_detail: string =   "mob/stakeholder/aadhaar";
  private _getCompanyList: string =   "roc/get_company_list";
  private _getCompanyDetail: string =   "roc/get_company_details";
  // private limited url 




///////////PVT LTD start/////////////////

  create_director_details(data) {
    return this.http.post(this._create_director_detail, data);
  }

  updateBusinessDetail(data, id) {
    let url = this._update_business_detail + "/" + id;
    return this.http.put(url, data)
    
  }

  updateAddressDetail(data, id) {
    let url = this._update_address_detail + "/" + id;
    return this.http.put(url, data);
  }

  verifyAddhar(id) {
    let url = this._verification_aadhar + "/" + id;
    return this.http.get(url,'');
  }

  updateAadhaarDetails(data, id) {
    let url = this._update_aadhaar_detail + "/" + id;
    return this.http.put(url, data);
  }

  getCompanyList(data) {
   return this.http.post(this._getCompanyList, data);
 }
 getCompanyDetail(data) {
   return this.http.post(this._getCompanyDetail, data);
 }

  ////////////PVT LTD end/////////////////


  /*
    Contact Creation API Call
  */

  //get all customer data in create invoice page

  transferFund(data){
    return this.http.post(this._urlTransferPayment,data);
  }

  GetBankDetail(ifsc_code){
    let urlPara = this._urlGetBankDetail+ifsc_code;
    return this.http.get(urlPara,'');
  }

  getExpenseCategory(){
    let urlPara = this._urlCategoryExpense+"?accounts_id="+this.accounts_id+"&companies_id="+this.companies_id+"&limit=15";
    return this.http.get(urlPara,'');
  }

  //get all customer data in create invoice page
  getCustomers(query){
    let urlPara = this._urlContactDetails+"?accounts_id="+this.accounts_id+"&companies_id="+this.companies_id+"&per_page=15&orderBy=name&search=name:"+query;
    return this.http.get(urlPara,'');
  }

  //add a customer in create invoice

  createContact(data){
    return this.http.post(this._urlContactDetails,data)
  }

  //update a contact in create invoice

  updateContact(data,id){
    let urlPara = this._urlContactDetails+"/"+id;
    return this.http.put(urlPara,data);
  }

  //delete a contact in create invoice
  deleteContact(data){
    let urlPara = this._urlContactDetails+"/"+data;
    return this.http.delete(urlPara);
  }

  /*
    Contact Creation API Call end
  */

  getMobDetails(){
    let url = this._get_mob_details+"?companies_id="+this.companies_id+"&accounts_id="+this.accounts_id;
    return this.http.get(url,'');
  }

  business_details(data){
    return this.http.post(this._business_details,data);
  }

  individualPan(file){
    let formData: FormData = new FormData();
    formData.append('file', file, file.name);
    let url = this._individual_pan+"?companies_id="+this.companies_id+"&accounts_id="+this.accounts_id;
    return this.http.post(url,formData);
  }

  individualPanFormdata(formData){
    let url = this._individual_pan+"?companies_id="+this.companies_id+"&accounts_id="+this.accounts_id;
    return this.http.post(url,formData);
  }

  deleteFiles(id){
    let url = this._deleteFiles+id;
    return this.http.delete(url);
  }

  individualAadhar(file,){
    let formData: FormData = new FormData();
    formData.append('file', file, file.name);
    let url = this._individual_aadhar+"?companies_id="+this.companies_id+"&accounts_id="+this.accounts_id;
    return this.http.post(url,formData);
  }

  individualAadharFormdata(formData,){
    let url = this._individual_aadhar+"?companies_id="+this.companies_id+"&accounts_id="+this.accounts_id;
    return this.http.post(url,formData);
  }

  stakeholderPan(data){
    return this.http.post(this._stakeholder_pan,data);
  }

  stakeholderAadharAddress(data){
    return this.http.post(this._stakeholder_address,data);
  }

  fileUploadOthers(file){
    let formData: FormData = new FormData();
    formData.append('file', file, file.name);
    let url = this._fileUploadOthers+"?companies_id="+this.companies_id+"&accounts_id="+this.accounts_id;
    return this.http.post(url,formData);
  }

  generateAadharotp(data){
    return this.http.post(this._fileGenerate_Aadharotp,data);
  }

  submitAadharotp(data){
    return this.http.post(this._fileSubmit_Aadharotp,data);
  }
  
  createBusinessAddress(data){
    return this.http.post(this._createBusiness_address,data);
  }

///////////individual/proprietership end/////////////////////////

  businessPan(file){
    let formData: FormData = new FormData();
    formData.append('file', file, file.name);
    let url = this._business_pan+"?companies_id="+this.companies_id+"&accounts_id="+this.accounts_id;
    return this.http.post(url,formData);
  
  }

  businessPanFormdata(formData){
    let url = this._business_pan+"?companies_id="+this.companies_id+"&accounts_id="+this.accounts_id;
    return this.http.post(url,formData);
  }

  business_detail_update(data,id){
    let url =this._business_detail_update+id;
    return this.http.put(url,data);
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
                    this.companies_id = response.json() && response.json().data.account.data[0].company.data[0].companies_id;
                    this.accounts_id  = response.json() && response.json().data.account.data[0].accounts_id;
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


}
