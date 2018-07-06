import { Injectable } from '@angular/core';
import { Http, Response, HttpModule, Headers, RequestOptions, BaseRequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import {Observable} from 'rxjs/Rx';
import { BaseService } from './base.service';


@Injectable()
export class AccountService {
  public token: string;
  public companies_id;
  public accounts_id;
  
  constructor(private _http: Http,private http: BaseService) {
      var currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.token = currentUser && currentUser.token;
      this.companies_id = currentUser && currentUser.company_details.companies_id;
      this.accounts_id  = currentUser && currentUser.account_details.accounts_id;
  }

  private _urlBookKeeping: string = "bookkeeping";
  private _urlgetIncomeExpenseTotal: string = "get_cashflow_values";
  private _urlCategoryIncome: string = "categories/income";
  private _urlDownload: string = "download_bookkeeping_list";
  private _urlCategoryExpense: string = "categories/expense";
  
  createExpenseCategory(data){
    return this.http.post(this._urlCategoryExpense,data)
  }

  updateBookKeepingCategory(data){
    let urlPara = this._urlBookKeeping+'/'+data.book_keeping_id;
    return this.http.put(urlPara,data);
  }

  getBookKeepingUncategorized(data){

    let urlPara = this._urlBookKeeping+'/transactions?accounts_id='+this.accounts_id+'&companies_id='+this.companies_id+'&limit='+data.limit+'&page='+data.page+'&search=categories_id:-1&searchJoin=and';
    if(data.contacts_name!=''){
      urlPara = this._urlBookKeeping+'/transactions?accounts_id='+this.accounts_id+'&companies_id='+this.companies_id+'&limit='+data.limit+'&page='+data.page+'&search=categories_id:-1;contacts_name:'+data.contacts_name+'&searchJoin=and';
    }
    if(data.start_date!='' && data.end_date!='' && data.start_date!=null && data.end_date!=null){
      urlPara =urlPara+'&start_date='+data.start_date+'&end_date='+data.end_date;
    }
    return this.http.get(urlPara,'');
  }
  getBookKeeping(data){
    let urlPara = this._urlBookKeeping+'?accounts_id='+this.accounts_id+'&companies_id='+this.companies_id+'&start_date='+data.start_date+'&end_date='+data.end_date+'&sortedBy=asc&orderBy=categories_id&limit='+data.limit;
    return this.http.get(urlPara,'');
  }

  getBookKeepingByFilter(data){
    let start_date="";
    let end_date="";
    let urlPara = this._urlBookKeeping+'?accounts_id='+this.accounts_id+'&companies_id='+this.companies_id+'&sortedBy=category_name&limit='+data.limit;
    
    if(data.start_date!='' && data.end_date!='' && data.start_date!=null && data.end_date!=null){
      urlPara =urlPara + '&start_date='+data.start_date+'&end_date='+data.end_date;
    }
    if(data.category_name!='' && data.category_name!='undefined' && data.category_name!=null){
      urlPara =urlPara +'&search=category_name:'+data.category_name;
    }
    return this.http.get(urlPara,'');
  }

  getIncomeExpenseTotal(data){
    let urlPara = this._urlgetIncomeExpenseTotal+'?accounts_id='+this.accounts_id+'&companies_id='+this.companies_id+'&start_date='+data.start_date+'&end_date='+data.end_date;
    return this.http.get(urlPara,'');
  }

  createCategory(data){
    return this.http.post(this._urlCategoryIncome,data)
  }

  //getIncome category
  getCategory(query){
    let urlPara = this._urlCategoryIncome+"?accounts_id="+this.accounts_id+"&companies_id="+this.companies_id+"&per_page=15&orderBy=category_name&search=category_name:"+query;
    return this.http.get(urlPara,'')
  }

  getAllCategory(){
    let urlPara = this._urlCategoryIncome+"?accounts_id="+this.accounts_id+"&companies_id="+this.companies_id+"&per_page=15&orderBy=category_name";
    return this.http.get(urlPara,'')
  }

  download(data){
    return this.http._base_url+this._urlDownload+'?accounts_id='+this.accounts_id+'&companies_id='+this.companies_id+'&start_date='+data.start_date+'&end_date='+data.end_date+"&sortedBy=category_name&limit=5";
  }

  downloadUncategorized(data){
    return this.http._base_url+this._urlBookKeeping+'/transactions/download?accounts_id='+this.accounts_id+'&companies_id='+this.companies_id+'&start_date='+data.start_date+'&end_date='+data.end_date+"&search=categories_id:-1&searchJoin=and&limit="+data.limit;
  }

  sortUncategorized(data){
    let urlPara = this._urlBookKeeping+"/transactions?accounts_id="+this.accounts_id+"&companies_id="+this.companies_id+"&start_date="+data.start_date+"&end_date="+data.end_date+"&searchJoin=and&orderBy="+data.orderBy+"&sortedBy="+data.sortedBy;
   
    if(data.contacts_name!='' && data.contacts_name!=null){
      urlPara = urlPara+'&search=categories_id:-1;contacts_name:'+data.contacts_name;
    }else{
      urlPara = urlPara+'&search=categories_id:-1';
    }
    
    return this.http.get(urlPara,'')
  }

  GetPage(url){
    var currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.token = currentUser && currentUser.token;
    let headers = new Headers({'Authorization':'Bearer'+this.token});
    let options = new RequestOptions({headers:headers});
    return this._http.get(url,options)
    .map((response:Response)=>response.json());
    
  }

}
