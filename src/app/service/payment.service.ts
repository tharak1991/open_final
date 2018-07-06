import { Injectable } from '@angular/core';
import { Http, Response, HttpModule, Headers, RequestOptions, BaseRequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import {Observable} from 'rxjs/Rx';
import { BaseService } from './base.service';
import { FREQUENCY_LIST } from '../mock/frequency';

@Injectable()
export class PaymentService {
  public token: string;
  public companies_id;
  public accounts_id;
  
  constructor(private _http: Http,private http: BaseService) {
      var currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.token = currentUser && currentUser.token;
      this.companies_id = currentUser && currentUser.company_details.companies_id;
      this.accounts_id  = currentUser && currentUser.account_details.accounts_id;
  }

  private _fileUploadOthers: string =   "file/others";
  private  _urlContactDetails: string = "contacts";
  private _urlItem: string = "items";
  private _urlCategoryIncome: string = "categories/income";
  private _urlCategoryExpense: string = "categories/expense";
  private _urlGetBankDetail: string = "ifsc/";
  private _urlPayment: string = "payment";
  private _urlgetAccountBalance: string = "open_account_balance";
  private _urlgetAccountDetail: string = "open_accounts";
  private _urlgetTransactions: string = "open_account/statement";
  
  private _urlgetPaymentDashboard: string = "payment_dashboard";

  private _urlWithdraw: string = "withdraw";

  private _urlpaymentSearch: string = "payments/form_search";
  private _urlDownload: string = "payment/list/download";
  private _urlDownloadTransactions: string = "open_account/list/download";

  private _urlTransactionSearch: string = "open_account/form_search";
  
  private _urlgetDashboard: string = "dashboard";
  private _deleteFiles: string = "files/";

  getWithdraws(query){
    let urlPara = this._urlWithdraw+'/get_beneficiary?accounts_id='+this.accounts_id+'&companies_id='+this.companies_id+"&per_page=15&search=beneficiary_name:"+query;
    return this.http.get(urlPara,'');
  }

  withdrawMoney(data){
    return this.http.post(this._urlWithdraw,data);
  }

  addBeneficiary(data){
    return this.http.post(this._urlWithdraw+'/add_beneficiary',data)
  }
  
  getTransactions(range_start,range_end){
    let urlPara = this._urlgetTransactions+'?accounts_id='+this.accounts_id+'&companies_id='+this.companies_id+"&per_page=10&orderBy=open_banking_nodal_statements_id&sortedBy=desc";
    return this.http.get(urlPara,'');
  }

  getAccountDetail(){
    let urlPara = this._urlgetAccountDetail+'?accounts_id='+this.accounts_id+'&companies_id='+this.companies_id;
    return this.http.get(urlPara,'');
  }

  getAccountBalance(){
    let urlPara = this._urlgetAccountBalance+'?accounts_id='+this.accounts_id+'&companies_id='+this.companies_id;
    return this.http.get(urlPara,'');
  }

  getPaymentDetail(id){
    let urlPara = this._urlGetBankDetail+'/'+id;
    return this.http.get(urlPara,'');
  }

  getPayments(payment_type){
    let urlPara = this._urlPayment+'?accounts_id='+this.accounts_id+'&companies_id='+this.companies_id+'&per_page=10&orderBy=internal_transaction_ref_id&sortedBy=desc&search=payment_schedules_id:'+payment_type;
    return this.http.get(urlPara,'');
  }

  getPaymentsByFilter(data){
    let urlPara = this._urlpaymentSearch+'?accounts_id='+this.accounts_id+'&companies_id='+this.companies_id+'&per_page=10&orderBy=internal_transaction_ref_id&sortedBy=desc&search=payment_schedules_id:1';
    if(data.payment_date_from!='' && data.payment_date_to!=''){
      urlPara = urlPara+'&payment_date_from='+data.payment_date_from+'&payment_date_to='+data.payment_date_to;
    }
    if(data.amount){
      urlPara = urlPara+'&amount='+data.amount;
    }
    
    let x=0;
    if(data.mobile_number!='' && data.recepient_name!='' && data.mobile_number!=null && data.recepient_name!=null){
      x=x+1;
      urlPara = urlPara+'&search=recepient_name:'+data.recepient_name+';mobile_number:'+data.mobile_number;
    }
    else if(data.email_id!='' && data.recepient_name!='' && data.email_id!=null && data.recepient_name!=null){
      x=x+1;
      urlPara = urlPara+'&search=recepient_name:'+data.recepient_name+';email_id:'+data.email_id;
    }
    else if(data.mobile_number!='' && data.mobile_number!=null){
      x=x+1;
      urlPara = urlPara+'&search=mobile_number:'+data.mobile_number;
    }
    else  if(data.email_id!='' && data.email_id!=null){
      x=x+1;
      urlPara = urlPara+'&search=email_id:'+data.email_id;
    }
    else if(data.recepient_name!='' && data.recepient_name!=null){
      x=x+1;
      urlPara = urlPara+'&search=recepient_name:'+data.recepient_name;
    }
    
    if(data.expense_categories_id!='' && data.expense_categories_id!=null && x != 0){
      urlPara = urlPara+';expense_categories_id:'+data.expense_categories_id;
    }
    else if(data.expense_categories_id!='' && data.expense_categories_id!=null){
      urlPara = urlPara+'&search=expense_categories_id:'+data.expense_categories_id;
    }
    urlPara = urlPara+'&searchJoin=and';
    return this.http.get(urlPara,'');
  }

  updatePayments(id,data){
    let urlPara = this._urlPayment+'/'+id
    return this.http.put(urlPara,data);
  }

  transferFund(data){
    return this.http.post(this._urlPayment,data);
  }

  getBankDetail(ifsc_code){
    let urlPara = this._urlGetBankDetail+ifsc_code;
    return this.http.get(urlPara,'');
  }

  GetBankDetail(ifsc_code){
    let urlPara = this._urlGetBankDetail+ifsc_code;
    return this.http.get(urlPara,'');
  }

  getExpenseCategory(){
    let urlPara = this._urlCategoryExpense+"?accounts_id="+this.accounts_id+"&companies_id="+this.companies_id+"&limit=15";
    return this.http.get(urlPara,'');
  }

  getExpenseCategorySearch(query){
    let urlPara = this._urlCategoryExpense+"?accounts_id="+this.accounts_id+"&companies_id="+this.companies_id+"&limit=15&orderBy=category_name&search=category_name:"+query;
    return this.http.get(urlPara,'');
  }

  createExpenseCategory(data){
    return this.http.post(this._urlCategoryExpense,data)
  }

  //get all beneficiery 
  getCustomers(query){
    let urlPara = this._urlContactDetails+"?accounts_id="+this.accounts_id+"&companies_id="+this.companies_id+"&per_page=15&orderBy=name&search=name:"+query;
    return this.http.get(urlPara,'');
  }

  //add a beneficiery 

  createContact(data){
    return this.http.post(this._urlContactDetails,data)
  }

  //update a beneficiery 

  updateContact(data,id){
    let urlPara = this._urlContactDetails+"/"+id;
    return this.http.put(urlPara,data);
  }

  //delete a beneficiery 
  deleteContact(data){
    let urlPara = this._urlContactDetails+"/"+data;
    return this.http.delete(urlPara);
  }

  fileUploadOthers(file) {
    let formData: FormData = new FormData();
    formData.append('file', file, file.name);
    let url = this._fileUploadOthers + "?companies_id=" + this.companies_id + "&accounts_id=" + this.accounts_id;
    return this.http.post(url, formData);
  }

  getFrequencyList() {
    return FREQUENCY_LIST;
  }


  getDashboard(range_start,range_end){
    let urlPara = this._urlgetDashboard+"?accounts_id="+this.accounts_id+"&companies_id="+this.companies_id+"&range_start="+range_start+"&range_end="+range_end;
    return this.http.get(urlPara,'');
  }



  getDashboardData(range_start,range_end){
    let urlPara = this._urlgetPaymentDashboard+"?accounts_id="+this.accounts_id+"&companies_id="+this.companies_id+"&range_start="+range_start+"&range_end="+range_end;
    return this.http.get(urlPara,'');
  }

  getUpcoming(type){
    let urlPara = this._urlgetDashboard+"/transaction_feed?accounts_id="+this.accounts_id+"&companies_id="+this.companies_id+"&type="+type;
    return this.http.get(urlPara,'');
  }

  download(){
    return this.http._base_url+this._urlDownload+'?accounts_id='+this.accounts_id+'&companies_id='+this.companies_id;
  }
  downloadTransactions(data){
    return this.http._base_url+this._urlDownloadTransactions+'?accounts_id='+this.accounts_id+'&companies_id='+this.companies_id+'&range_start='+data.transaction_date_from+'&range_end='+data.transaction_date_to;
  }

  gettransactionByFilter(data){
    let urlPara = this._urlTransactionSearch+'?accounts_id='+this.accounts_id+'&companies_id='+this.companies_id+'&limit=10&orderBy=ref_no&sortedBy=desc';
    if(data.transaction_date_from!='' && data.transaction_date_to!='' && data.transaction_date_from!=null && data.transaction_date_to!=null){
      urlPara = urlPara+'&range_start='+data.transaction_date_from+'&range_end='+data.transaction_date_to;
    }
    
    let x=0;
    if(data.ref_no!='' && data.ref_no!=null){
      x=x+1;
      urlPara = urlPara+'&search=ref_no:'+data.ref_no;
    }
    if(data.amount!='' && data.amount!=null && x == 0){
      x=x+1;
      urlPara = urlPara+'&search=amount:'+data.amount;
    }else if(data.amount!='' && data.amount!=null && x != 0){
      urlPara = urlPara+';amount:'+data.amount;
    }
    if(data.transaction_type!='' && data.transaction_type!=null && x == 0){
      x=x+1;
      urlPara = urlPara+'&search=transaction_type:'+data.transaction_type;
    }else if(data.transaction_type!='' && data.transaction_type!=null && x != 0){
      urlPara = urlPara+';transaction_type:'+data.transaction_type;
    }

    urlPara = urlPara+'&searchJoin=and';
    return this.http.get(urlPara,'');
  }

  sortOpenAccountStatement(data){
    let urlPara = this._urlgetTransactions+"?accounts_id="+this.accounts_id+"&companies_id="+this.companies_id+"&orderBy="+data.orderBy+"&sortedBy="+data.sortedBy+"&per_page=10";
    
    if(data.transaction_date_from!='' && data.transaction_date_to!='' && data.transaction_date_from!=null && data.transaction_date_to!=null){
      urlPara = urlPara+'&range_start='+data.transaction_date_from+'&range_end='+data.transaction_date_to;
    }
    
    let x=0;
    if(data.ref_no!='' && data.ref_no!=null){
      x=x+1;
      urlPara = urlPara+'&search=ref_no:'+data.ref_no;
    }
    if(data.amount!='' && data.amount!=null && x == 0){
      x=x+1;
      urlPara = urlPara+'&search=amount:'+data.amount;
    }else if(data.amount!='' && data.amount!=null && x != 0){
      urlPara = urlPara+';amount:'+data.amount;
    }
    if(data.transaction_type!='' && data.transaction_type!=null && x == 0){
      x=x+1;
      urlPara = urlPara+'&search=transaction_type:'+data.transaction_type;
    }else if(data.transaction_type!='' && data.transaction_type!=null && x != 0){
      urlPara = urlPara+';transaction_type:'+data.transaction_type;
    }

    urlPara = urlPara+'&searchJoin=and';
    
    return this.http.get(urlPara,'')
  }
  deleteFiles(id) {
    let url = this._deleteFiles + id;
    return this.http.delete(url);
  }
  GetPage(url){
    var currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.token = currentUser && currentUser.token;
    let headers = new Headers({'Authorization':'Bearer'+this.token});
    let options = new RequestOptions({headers:headers});
    return this._http.get(url,options)
    .map((response:Response)=>response.json());
    
  }

  sortPayment(data){
    let urlPara = this._urlPayment+"?accounts_id="+this.accounts_id+"&companies_id="+this.companies_id+"&orderBy="+data.orderBy+"&sortedBy="+data.sortedBy+"&per_page=10";
    
    if(data.payment_date_from!='' && data.payment_date_to!=''){
      urlPara = urlPara+'&payment_date_from='+data.payment_date_from+'&payment_date_to='+data.payment_date_to;
    }
    if(data.amount){
      urlPara = urlPara+'&amount='+data.amount;
    }
    
    let x=0;
    if(data.mobile_number!='' && data.recepient_name!='' && data.mobile_number!=null && data.recepient_name!=null){
      x=x+1;
      urlPara = urlPara+'&search=recepient_name:'+data.recepient_name+';mobile_number:'+data.mobile_number;
    }
    else if(data.email_id!='' && data.recepient_name!='' && data.email_id!=null && data.recepient_name!=null){
      x=x+1;
      urlPara = urlPara+'&search=recepient_name:'+data.recepient_name+';email_id:'+data.email_id;
    }
    else if(data.mobile_number!='' && data.mobile_number!=null){
      x=x+1;
      urlPara = urlPara+'&search=mobile_number:'+data.mobile_number;
    }
    else  if(data.email_id!='' && data.email_id!=null){
      x=x+1;
      urlPara = urlPara+'&search=email_id:'+data.email_id;
    }
    else if(data.recepient_name!='' && data.recepient_name!=null){
      x=x+1;
      urlPara = urlPara+'&search=recepient_name:'+data.recepient_name;
    }
    
    if(data.expense_categories_id!='' && data.expense_categories_id!=null && x != 0){
      urlPara = urlPara+';expense_categories_id:'+data.expense_categories_id;
    }
    else if(data.expense_categories_id!='' && data.expense_categories_id!=null){
      urlPara = urlPara+'&search=expense_categories_id:'+data.expense_categories_id;
    }
    urlPara = urlPara+'&searchJoin=and';

    return this.http.get(urlPara,'')
  }
}
