import { Injectable, ErrorHandler } from '@angular/core';
import { Http, Response, HttpModule, Headers, RequestOptions, BaseRequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Rx';
import { BaseService } from './base.service';

import { BUSINESS_CATGORIES } from '../mock/business_category';
import { BUSINESS_TYPE } from '../mock/business_type';
import { ADDRESS_PROOF } from '../mock/address_proof_type';
import { STATE_LIST } from '../mock/state_list';

@Injectable()
export class OnBoardingService {
  public companies_id;
  public accounts_id;

  private loggedIn = false;
  constructor(private _http: Http, private http: BaseService) {
    var currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.company_details.companies_id) {
      this.companies_id = currentUser && currentUser.company_details.companies_id;
      this.accounts_id = currentUser && currentUser.account_details.accounts_id;
    }

  }

  private _base_url: string = this.http._base_url;


  //individual/proprietership url
  private _get_mob_details: string = "get_mob_details";
  private _business_details: string = "mob/business_details";
  private _individual_pan: string = "file/individualpan";
  private _deleteFiles: string = "files/";
  private _individual_aadhar: string = "file/aadhaar";
  private _stakeholder_pan: string = "mob/stakeholder/pan";
  private _stakeholder_address: string = "mob/stakeholder/aadhaar";
  private _fileUploadOthers: string = "file/others";
  private _fileGenerate_Aadharotp: string = "mob/generate_aadhaar_otp";
  private _fileSubmit_Aadharotp: string = "mob/esign_document";
  private _createBusiness_address: string = "mob/address_details";

  //////////individual/proprietership start ////////////////

  //////////trust////////
  private _business_pan: string = "file/businesspan";
  private _business_detail_update: string = "mob/business_details/";


  // private limited url 
  private _create_director_detail: string = "mob/directors";
  private _update_business_detail: string = "mob/business_details";
  private _update_address_detail: string = "mob/address_details";
  private _verification_aadhar: string = "verification/aadhar";
  private _update_aadhaar_detail: string = "mob/stakeholder/aadhaar";
  private _getCompanyList: string = "roc/get_company_list";
  private _getCompanyDetail: string = "roc/get_company_details";
  // private limited url 
  private _urlManualSigning: string = "mob/manual_signing";


  manualSigning(data) {
    return this.http.post(this._urlManualSigning, data);
  }

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
    return this.http.get(url, '');
  }

  updateAadhaarDetails(data, id) {
    let url = this._update_aadhaar_detail + "/" + id;
    return this.http.put(url, data);
  }

  getCompanyList(data) {
    return this.http.post(this._getCompanyList, data);
  }
  getCompanyDetail(data) {
    return this.http.post(this._getCompanyDetail, data)
      .timeoutWith(20000, Observable.throw(new Error("350")));
  }


  ////////////PVT LTD end/////////////////

  getMobDetails() {
    let url = this._get_mob_details + "?companies_id=" + this.companies_id + "&accounts_id=" + this.accounts_id;
    return this.http.get(url, '');
  }

  business_details(data) {
    return this.http.post(this._business_details, data);
  }

  individualPan(file) {
    let formData: FormData = new FormData();
    formData.append('file', file, file.name);
    let url = this._individual_pan + "?companies_id=" + this.companies_id + "&accounts_id=" + this.accounts_id;
    return this.http.post(url, formData);
  }

  individualPanFormdata(formData) {
    let url = this._individual_pan + "?companies_id=" + this.companies_id + "&accounts_id=" + this.accounts_id;
    return this.http.post(url, formData);
  }

  deleteFiles(id) {
    let url = this._deleteFiles + id;
    return this.http.delete(url);
  }

  individualAadhar(file) {
    let formData: FormData = new FormData();
    formData.append('file', file, file.name);
    let url = this._individual_aadhar + "?companies_id=" + this.companies_id + "&accounts_id=" + this.accounts_id;
    return this.http.post(url, formData);
  }

  individualAadharFormdata(formData) {
    let url = this._individual_aadhar + "?companies_id=" + this.companies_id + "&accounts_id=" + this.accounts_id;
    return this.http.post(url, formData);
  }

  stakeholderPan(data) {
    return this.http.post(this._stakeholder_pan, data);
  }

  updateStakeholderPan(data, id) {
    let url = this._stakeholder_pan + "/" + id;
    return this.http.put(url, data);
  }

  stakeholderAadharAddress(data) {
    return this.http.post(this._stakeholder_address, data);
  }

  fileUploadOthers(file) {
    let formData: FormData = new FormData();
    formData.append('file', file, file.name);
    let url = this._fileUploadOthers + "?companies_id=" + this.companies_id + "&accounts_id=" + this.accounts_id;
    return this.http.post(url, formData);
  }

  generateAadharotp(data) {
    return this.http.post(this._fileGenerate_Aadharotp, data);
  }

  submitAadharotp(data) {
    return this.http.post(this._fileSubmit_Aadharotp, data);
  }

  createBusinessAddress(data) {
    return this.http.post(this._createBusiness_address, data);
  }

  ///////////individual/proprietership end/////////////////////////

  businessPan(file) {
    let formData: FormData = new FormData();
    formData.append('file', file, file.name);
    let url = this._business_pan + "?companies_id=" + this.companies_id + "&accounts_id=" + this.accounts_id;
    return this.http.post(url, formData);

  }

  businessPanFormdata(formData) {
    let url = this._business_pan + "?companies_id=" + this.companies_id + "&accounts_id=" + this.accounts_id;
    return this.http.post(url, formData);
  }

  business_detail_update(data, id) {
    let url = this._business_detail_update + id;
    return this.http.put(url, data);
  }

  ////////trust////////////////////////




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


}


