import { Component, OnInit, ViewChild, ElementRef, HostListener} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
//import { InvoiceService } from '../../service/invoice.service';
import { Router, ActivatedRoute, Params  } from '@angular/router';
import { CustomValidators } from 'ng2-validation';
import { PaymentService } from './../../service/payment.service';
import { DatePipe } from '@angular/common';
declare let mixpanel: any;
declare let Intercom: any;

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.html',
  providers:[PaymentService,DatePipe]

})
export class TransactionsComponent implements OnInit {
    public companies_id;
    public accounts_id;
    public toggle_class="";
    public fname;
    public lname;

    public data:any[]=[];
    public meta_detail:any={};
    account_detail:any=Object;

    public range_start ="";
    public range_end ="";

    public transaction_type =1;
    filter_toggle="";

    account_balance:any;

    previous='';
    next='';
    current_page=0;
    total_pages=0;

    public TableDataLoader = "";
    

    constructor(private datePipe :DatePipe,private _httpService:PaymentService,private _router: ActivatedRoute,private router:Router){
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.companies_id = currentUser && currentUser.company_details.companies_id;
        this.accounts_id  = currentUser && currentUser.account_details.accounts_id;
        this.fname = currentUser && currentUser.data.data.first_name;
        this.lname = currentUser && currentUser.data.data.last_name;
    }

    @ViewChild('closeDownloadPop') closeDownloadPop: ElementRef;
    
    ngOnInit() {
        this.getTransactions();
        this.getAccountDetail();
        this.getAccountBalance();
        
    }

    filter_form = new FormGroup({
        ref_no:new FormControl(''),
        transaction_type:new FormControl(''),
        transaction_date_from: new FormControl(''),
        transaction_date_to: new FormControl(''),
        amount: new FormControl(''),
        amount_greater: new FormControl(''),
        
        
    });

    filter_form_date = new FormGroup({
        transaction_date_type:new FormControl(''),
        transaction_date_from: new FormControl(''),
        transaction_date_to: new FormControl(''),
    });

    public submitType:string;
    submitName(type){
      this.submitType=type;
    }
  
    submitFilter(){
      this.TableDataLoader = "addLoader";

      let data = this.filter_form.value;
  
      if(this.submitType=='1')
      {
        data ={
          "transaction_date_from":'',
          "transaction_date_to":'',
          "transaction_type":"",
          "ref_no":'',
          "amount":data.amount
        }
      }else if(this.submitType=='2'){
        if(this.filter_form.value.transaction_date_from!='' && this.filter_form.value.transaction_date_from!=null){
          this.range_start=this.datePipe.transform(this.filter_form.value.transaction_date_from, 'yyyy-MM-dd')+' 00:00:00';
        }else{
          this.range_start="";
        }
  
        if(this.filter_form.value.transaction_date_to!='' && this.filter_form.value.transaction_date_to!=null){
          this.range_end=this.datePipe.transform(this.filter_form.value.transaction_date_to, 'yyyy-MM-dd')+' 11:59:59';
        }else{
          this.range_end="";
        }
        data ={
          "transaction_date_from":this.range_start,
          "transaction_date_to":this.range_end,
          "transaction_type":this.filter_form.value.transaction_type,
          "ref_no":data.ref_no,
          "amount":data.amount_greater
        }
      }

      this._httpService.gettransactionByFilter(data)
      .subscribe((result)=>{
        this.TableDataLoader = "";
        if(result.status=200){
          this.generat_page(result);
          this.filter_toggle='';
          if(result.data.length>0){
            this.crossButton = true;
          }else{
          this.crossButton = false;
          }
        }
        this.hideWarningClass = "clickHide";
      },(err:any)=>{
        this.crossButton = false;
        
        this.TableDataLoader = "";
        this.filter_toggle='';
        this.errorHandle(err);
      }, () => console.log())
    }

    filter_By_date(){
        let filter_date =this.filter_form_date.value.transaction_date_type;
        
        var d = new Date();
        var new_date = d.setMonth(d.getMonth() - 1);
        var date = new Date(new_date), y = date.getFullYear(), m = date.getMonth();
        var lastDay = new Date(y, m + 1, 0);
        this.range_end =this.datePipe.transform(lastDay, 'yyyy-MM-dd');

        if(filter_date==1){
            var firstDay = new Date(y, m, 1);
            this.range_start =this.datePipe.transform(firstDay, 'yyyy-MM-dd');

        }else if(filter_date==2){
            var new_date = d.setMonth(d.getMonth() -2);
            var date = new Date(new_date), y = date.getFullYear(), m = date.getMonth();
            var firstDay = new Date(y, m, 1);
            this.range_start =this.datePipe.transform(firstDay, 'yyyy-MM-dd');

        }else if(filter_date==3){
            var new_date = d.setMonth(d.getMonth() - 5);
            var date = new Date(new_date), y = date.getFullYear(), m = date.getMonth();
            var firstDay = new Date(y, m, 1);
            this.range_start =this.datePipe.transform(firstDay, 'yyyy-MM-dd');

        }else if(filter_date==4){
            var new_date = d.setFullYear(d.getFullYear() - 1);
            var date = new Date(new_date), y = date.getFullYear(), m = date.getMonth();
            var firstDay = new Date(y, m, 1);
            this.range_start =this.datePipe.transform(firstDay, 'yyyy-MM-dd');
        }

        if(this.filter_form_date.value.transaction_date_from !='' && this.filter_form_date.value.transaction_date_to !=''){
            this.range_start=this.datePipe.transform(this.filter_form_date.value.transaction_date_from, 'yyyy-MM-dd');
            this.range_end=this.datePipe.transform(this.filter_form_date.value.transaction_date_to, 'yyyy-MM-dd');
        }
    
        let data ={
          "transaction_date_from":this.range_start+' 00:00:00',
          "transaction_date_to":this.range_end+' 11:59:59'
        }

        let url  = this._httpService.downloadTransactions(data);
        window.open(url, '_blank').focus();
        this.closeDownloadPop.nativeElement.click();
        this.filter_form_date.reset();
    }
    
    getTransactions(){
        this.TableDataLoader = "addLoader";
        let sp ="-";
        var date = new Date(), y = date.getFullYear(), m = date.getMonth();
        var firstDay = new Date(y, m, 1);
        var lastDay = new Date(y, m + 1, 0);
        let last_date = lastDay.getDate();
        m=m+1; //january start with 0
        // this.range_start =y+sp+m+sp+1;
        // this.range_end =y+sp+m+sp+last_date;
        this.range_start ='';
        this.range_end ='';
        this._httpService.getTransactions(this.range_start,this.range_end)
        .subscribe(
        (result) => {
            this.TableDataLoader = "";
            if(result.status==200){
              this.generat_page(result);
             //   this.meta_detail=result.meta;
               // console.log(result);
                
            }
            this.hideWarningClass = "clickHide";
          },(err:any)=>{
            this.TableDataLoader = "";
            this.errorHandle(err);
          }, () => console.log()
        );
    }

    getAccountDetail(){
        this._httpService.getAccountDetail()
            .subscribe((result) => {
            this.account_detail=result.data;
            this.hideWarningClass = "clickHide";
          },(err:any)=>{
            this.errorHandle(err);
          }, () => console.log());
    }

    getAccountBalance(){
      this._httpService.getAccountBalance()
      .subscribe((result) => {
          this.account_balance=result.data.account_balance;
          this.hideWarningClass = "clickHide";
        },(err:any)=>{
          this.errorHandle(err);
        }, () => console.log());
    }

    toggleTips(){
        if(this.toggle_class==""){
        this.toggle_class="showTips";
        }else{
        this.toggle_class="";      
        }
    }

    toggleFilter(){
        if(this.filter_toggle==''){
          this.filter_toggle='boxDisplayBlock';
        }else{
          this.filter_toggle='';
        }
    }

    prevent =true;
    preventFn(){
      this.prevent =false;
    }
  
    clickedInside($event: Event){
      if(this.prevent){
        $event.preventDefault();
        $event.stopPropagation();  // <- that will stop propagation on lower layers
        //console.log("CLICKED INSIDE, MENU WON'T HIDE");
      }else{
        //this.prevent =true;
      }
    }
    
    @HostListener('document:click', ['$event']) clickedOutside($event){
      //console.log("CLICKED OUTSIDE");
      if(this.prevent){
        this.filter_toggle='';
      }
    }

    mysort(event){
      // console.log(window.event)
      // console.log(window.event.bubbles);
      if (typeof window.event.bubbles != 'undefined' && window.event.bubbles == true) {
      this.TableDataLoader = "addLoader";

      let sortedBy="";
      if(event.order==1){
        sortedBy='desc';
      }else{
        sortedBy='asc';        
      }

      let fil_data = this.filter_form.value;

      let amount="";
      if(this.submitType=='1')
      {
          amount=fil_data.amount;
      }else if(this.submitType=='2'){
        if(this.filter_form.value.transaction_date_from!='' && this.filter_form.value.transaction_date_from!=null){
          this.range_start=this.datePipe.transform(this.filter_form.value.transaction_date_from, 'yyyy-MM-dd')+' 00:00:00';
        }else{
          this.range_start="";
        }
  
        if(this.filter_form.value.transaction_date_to!='' && this.filter_form.value.transaction_date_to!=null){
          this.range_end=this.datePipe.transform(this.filter_form.value.transaction_date_to, 'yyyy-MM-dd')+' 11:59:59';
        }else{
          this.range_end="";
        }
        amount=fil_data.amount_greater;
      }

      let data ={
        "transaction_date_from":this.range_start,
        "transaction_date_to":this.range_end,
        "transaction_type":this.filter_form.value.transaction_type,
        "ref_no":fil_data.ref_no,
        "amount":amount,
        "limit":10,
        "page":1,
        "orderBy":event.field,
        "sortedBy":sortedBy
      }
        this._httpService.sortOpenAccountStatement(data)
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
    }

    change_page(url){
      this.TableDataLoader = "addLoader";
      
      this._httpService.GetPage(url)
      .subscribe((result) => {
          if(result.status==200){
            this.TableDataLoader = "";
      
            this.generat_page(result);
          }
          this.hideWarningClass = "clickHide";
        },(err:any)=>{
          this.TableDataLoader = "";
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
  
  public beneficiary_name_dwnl = "";
  public crossButton: boolean = false;

  setRecepientName(event) {
    this.crossButton = false;
    this.beneficiary_name_dwnl = event.target.value;
  }

  refresh_local_variable_form() {
    this.filter_form.reset();
    this.filter_form.controls.amount.setValue(this.beneficiary_name_dwnl);
  }

  refresh_local_variable(){
    this.crossButton = false;
    this.beneficiary_name_dwnl="";
    this.filter_form.controls.amount.setValue('');
    this.getTransactions();
  }
  hrefClick(data){
    mixpanel.track(
      data,
      {"menu": "click"}
    );
    Intercom('trackEvent', data);
  }
}
