import { Component, OnInit, ViewChild, ElementRef, HostListener} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
//import { InvoiceService } from '../../service/invoice.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { CustomValidators } from 'ng2-validation';
import { AccountService } from './../../service/account.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-uncategorised',
  templateUrl: './uncategorised.html',
  providers:[AccountService,DatePipe]

})
export class BookKeepingUncategorisedComponent implements OnInit {
    public companies_id;
    public accounts_id;
    public users_id;
    
    public toggle_class="";

    public data:any[]=[];

    public transaction_type =1;

    public range_start ="";
    public range_end ="";

    previous='';
    next='';
    current_page=0;
    total_pages=0;

    public submitLoader ="";

    public TableDataLoader = "";
    

    constructor(private datePipe :DatePipe,private _httpService:AccountService,private _router: ActivatedRoute,private router:Router){
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.companies_id = currentUser && currentUser.company_details.companies_id;
        this.accounts_id  = currentUser && currentUser.account_details.accounts_id;
        this.users_id = currentUser && currentUser.data.data.users_id;
    }

    @ViewChild('openCategoryModel') openCategoryModel: ElementRef;
    @ViewChild('closeCategoryForm') closeCategoryForm: ElementRef;

    ngOnInit() {
        this._router.queryParams
        .subscribe(params => {
          this.range_start = params.from;
          this.range_end = params.to;

          this.getTransactions();
        });
  
    }

    filter_form = new FormGroup({
      contacts_name:new FormControl(''),
    });

    category_form = new FormGroup({
      category_name:new FormControl('',Validators.required),
      category_id:new FormControl('',Validators.required)      
    });

    public submitType:string;
    submitName(type){
      this.submitType=type;
    }
  
    submitFilter(){
      this.TableDataLoader = "addLoader";
      
      let contacts_name="";
      if(this.filter_form.value.contacts_name!=''){
        contacts_name=this.filter_form.value.contacts_name
      }

      let data ={
        "limit":10,
        "page":1,
        "start_date":this.range_start,
        "end_date":this.range_end,
        "contacts_name":contacts_name
      }

      this._httpService.getBookKeepingUncategorized(data)
      .subscribe(
      (result) => {
        this.TableDataLoader = "";
        
          if(result.status==200){
              this.generat_page(result);
          }
          this.hideWarningClass = "clickHide";
        },(err:any)=>{
          this.TableDataLoader = "";
          
          this.errorHandle(err);
        }, () => console.log()
      );
      
    }

    getTransactions(){
      this.TableDataLoader = "addLoader";
      
      let data ={
        "limit":10,
        "page":1,
        "start_date":this.range_start,
        "end_date":this.range_end,
        "contacts_name":''
      }
        this._httpService.getBookKeepingUncategorized(data)
        .subscribe(
        (result) => {
          this.TableDataLoader = "";
          
            if(result.status==200){
                this.generat_page(result);
            }
            this.hideWarningClass = "clickHide";
          },(err:any)=>{
            this.TableDataLoader = "";
            
            this.errorHandle(err);
          }, () => console.log()
        );
    }

    toggleTips(){
        if(this.toggle_class==""){
        this.toggle_class="showTips";
        }else{
        this.toggle_class="";      
        }
    }

    selectCategory(event){
      if(event.id=='new'){
      this.submitLoader="addLoader";
        let query: string = event.query;
        let data={
        "accounts_id":this.accounts_id,
        "companies_id":this.companies_id,
        "users_id": this.users_id,
        "category_name":query,
        "is_deleted":0
        }
        this._httpService.createExpenseCategory(data)
        .subscribe((result) => {
            if(result.status==200){
              this.category_form.patchValue({ category_name:result.data});
              this.category_form.controls.category_id.setValue(result.data.id);
            }else{
              this.category_form.patchValue({ category_name:{'category_name':''} });
            }
            this.submitLoader="";
            this.hideWarningClass = "clickHide";
          },(err:any)=>{
            this.submitLoader="";
            this.errorHandle(err);
          }, () => console.log());
      }
      else{
        this.category_form.patchValue({ category_name:event});
        this.category_form.controls.category_id.setValue(event.id);
      
      }
    }

    filteredCategorySingle:any[] = [];
    searchCategory(event) {
      this.category_form.controls.category_id.setValue('');
      let query = event.query;
      this._httpService.getCategory(query).subscribe((result)=>{
        this.filteredCategorySingle= result.data;
        let query_exist = false;
        for(let cate of result.data){
          if(cate.category_name == query){
            query_exist = true;
            return;
          }
        }
        
        if(result.data.length>0 && !query_exist){
          if(query.length > 0){
            this.filteredCategorySingle.splice(0,0,{'id':'new','category_name':'+ Add '+query,'query':query,'class':'new'});
          }
        } else{
        this.filteredCategorySingle = [{'id':'new','category_name':'+ Add '+query,'query':query,'class':'new'}];
        }
        this.hideWarningClass = "clickHide";
      },(err:any)=>{
        this.errorHandle(err);
      }, () => console.log());
    }

    updateCategory(){
      this.submitLoader="addLoader";
      let data ={
        "categories_id":this.category_form.value.category_name.id,
        "category_name":this.category_form.value.category_name.category_name,
        "book_keeping_id":this.transaction_detail.book_keeping_id
      }
      this._httpService.updateBookKeepingCategory(data)
      .subscribe(
      (result) => {
          if(result.status==201){
            this.closeCategoryForm.nativeElement.click();
            this.category_form.reset();
              this.successLoader('Category Link Successfully.');
              this.getTransactions();
          }
          this.submitLoader="";
      
          this.hideWarningClass = "clickHide";
        },(err:any)=>{
          this.submitLoader="";
          this.errorHandle(err);
        }, () => console.log()
      );
    }

    transaction_detail:any;
    transactionDetail(data){
      this.transaction_detail=data;
      this.openCategoryModel.nativeElement.click();
    }

    download() {
      let data = {
        "start_date":this.range_start,
        "end_date":this.range_end,
        "limit":10
      };
      let url  = this._httpService.downloadUncategorized(data);
        
      window.open(url, '_blank').focus();
      
    }

    mysort(event){
      // console.log(window.event)
      // console.log(window.event.bubbles);
      if (typeof window.event.bubbles != 'undefined' && window.event.bubbles == true) {
      let sortedBy="";
      if(event.order==1){
        sortedBy='desc';
      }else{
        sortedBy='asc';        
      }

      let contacts_name="";
      if(this.filter_form.value.contacts_name!=''){
          contacts_name=this.filter_form.value.contacts_name;
      }

      let data ={
        "contacts_name":contacts_name,
        "limit":10,
        "page":1,
        "start_date":this.range_start,
        "end_date":this.range_end,
        "orderBy":event.field,
        "sortedBy":sortedBy
      }
        this._httpService.sortUncategorized(data)
        .subscribe(
        (result) => {
            if(result.status==200){
              this.generat_page(result);
            }
            this.hideWarningClass = "clickHide";
          },(err:any)=>{
            this.errorHandle(err);
          }, () => console.log()
        );
      }
    }

    change_page(url){
      this._httpService.GetPage(url)
      .subscribe((result) => {
          if(result.status==200){
            this.generat_page(result);
          }
          this.hideWarningClass = "clickHide";
        },(err:any)=>{
          this.errorHandle(err);
        }, () => console.log());
    }
  
    generat_page(result){
      this.data=result.data;
      this.current_page=result.meta.pagination.current_page;
      this.total_pages=result.meta.pagination.total_pages;
      
      if(result.meta.pagination.links.hasOwnProperty('previous')){
        this.previous=result.meta.pagination.links.previous;
        
      }else{
        this.previous='';
        
      }
      if(result.meta.pagination.links.hasOwnProperty('next')){
        this.next=result.meta.pagination.links.next;
      }else{
        this.next='';
      }
    }

      //error handler
    public warning_message = "";
    public hideWarningClass = "clickHide";
    //public loaderClasssubmit = "addLoader";
    

    errorHandle(err){
      //this.loaderClasssubmit = "";
      this.hideWarningClass = "";
      if (err.status == 0) { 
      this.warning_message = "Please check your internet connection" 
        return;
      }
          else if (err.status == 500) { 
        //this.warning_message = 'server error'; 
      }
          else if (err.status == 422) { 
        //this.warning_message = 'some validation error'; 
      }
      else if (err.status == 401) { 
        this.router.navigate(['/logout']); 
      }
          this.warning_message = JSON.parse(err._body).message;
      
    }

    hideWarning() {
      this.hideWarningClass = "clickHide";
    }
    //error handler
    

    loader_status=false;
    http_message="";

    successLoader(message){
      this.loader_status=true;
          this.http_message=message;
          setTimeout(() =>{
            this.loader_status=false;
          },5000);
    }



}
