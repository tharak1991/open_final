import { Component, OnInit, ViewChild, ElementRef, HostListener} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PaymentService } from '../../service/payment.service';
import { Router } from '@angular/router';
import { CustomValidators } from 'ng2-validation';
import { DatePipe } from '@angular/common';
declare let mixpanel: any;
declare let Intercom: any;

@Component({
  selector: 'app-transfer_list',
  templateUrl: './transfer_list.component.html',
  providers:[PaymentService,DatePipe]

})
export class TransferListComponent implements OnInit {
  public companies_id;
  public accounts_id;
  public toggle_class="";
  public type=1;
  public classActive1="active";
  public classActive2="";
  public classActive3="";
  
  filteredCustomerSingle:any = [];
  data: any=[];
  frequnecy:any = [];
  attachment_id: any = [];
  attachment_data: any = [];
  
  expense_category:any = [];
  payment_detail:any;

  public range_start ="";
  public range_end ="";

  loader_status=false;
  http_message="";

  filter_toggle="";
  filter:any[]=[];
  previous='';
  next='';
  current_page=0;
  total_pages=0;
  public TableDataLoader = "";
  

  constructor(private datePipe :DatePipe,private _httpService:PaymentService,private router :Router){
    var currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.companies_id = currentUser && currentUser.company_details.companies_id;
    this.accounts_id  = currentUser && currentUser.account_details.accounts_id;

    this.filter.push({label:'All Payments', value:1});
    this.filter.push({label:'Last 2 Weeks', value:2});
    this.filter.push({label:'Last Month', value:3});
    this.filter.push({label:'Last 6 Monhts', value:4});

    let sp ="-";
    var date = new Date(), y = date.getFullYear(), m = date.getMonth();
    var firstDay = new Date(y, m, 1);
    var lastDay = new Date(y, m + 1, 0);
    let last_date = lastDay.getDate();
    m=m+1; //january start with 0

    this.range_start =y+sp+m+sp+1;
    this.range_start = this.range_start+' 00:00:00';

    this.range_end =y+sp+m+sp+last_date;
    this.range_end =this.range_end+' 11:59:59';
  }
  @ViewChild('getPaymentDetail') getPaymentDetail: ElementRef;
  @ViewChild('updatePayments') updatePayments: ElementRef;
  @ViewChild('closePaymentDetail') closePaymentDetail: ElementRef;
  @ViewChild('cancelPaymentModel') cancelPaymentModel: ElementRef;
  @ViewChild('stopRecurrenceModel') stopRecurrenceModel: ElementRef;
  @ViewChild('closeUpdatePayment') closeUpdatePayment: ElementRef;
  @ViewChild('cancelSchedulPayment') cancelSchedulPayment: ElementRef;
  @ViewChild('cancelRecurringPayment') cancelRecurringPayment: ElementRef;

  updatePaymentForm = new FormGroup({
      expense_categories_id: new FormControl('',[Validators.required]),
      frequnecy_id: new FormControl(''),
      purpose: new FormControl('',[Validators.required]),
      tags: new FormControl(''),
      notes: new FormControl(''),
      files_id: new FormControl(''),
      amount: new FormControl(''),
      payment_schedules_id: new FormControl(''),
      payment_date: new FormControl(''),
      start_date: new FormControl(''),
      repeat_for: new FormControl('')
  });

  filter_form = new FormGroup({
    beneficiary_name:new FormControl(''),
    email_phone:new FormControl(''),
    category_name:new FormControl(''),
    email_id:new FormControl(''),
		mobile_number:new FormControl('',Validators.pattern('^[789][0-9]{9}$')),
    start_date: new FormControl(''),
    end_date: new FormControl(''),
    amount: new FormControl(''),
  });

  ngOnInit() {
      this.getPayments(this.type);
      this.getExpenseCategory();
  }


  public submitType:string;
  submitName(type){
    this.submitType=type;
  }

  public beneficiary_name_dwnl = "";
  public crossButton: boolean = false;

  setRecepientName(event) {
    this.beneficiary_name_dwnl = event.target.value;
  }

  refresh_local_variable_form() {
    this.filter_form.reset();
    this.filter_form.controls.beneficiary_name.setValue(this.beneficiary_name_dwnl);
    this.is_email_mobile = 1;
    this.filter_form.controls.email_phone.setValue(1);
  }

  refresh_local_variable(type) {

    this.filter_form.reset();
    this.crossButton = false;
    this.is_email_mobile = 1;
    this.filter_form.controls.email_phone.setValue(1);

    this.TableDataLoader = "addLoader";
    
    if(type==1){
      this.classActive1="active";
      this.classActive2="";
      this.classActive3="";
    }else if(type==2){
      this.classActive2="active";
      this.classActive1="";
      this.classActive3="";
    }else{
      this.classActive3="active";
      this.classActive1="";
      this.classActive2="";

    }
    this.data=[];
    this.type=type;
    this._httpService.getPayments(type)
		.subscribe((result) => {
        if(result.status==200){
          this.TableDataLoader = "";
          this.beneficiary_name_dwnl="";
          this.generat_page(result);
        }
        this.hideWarningClass = "clickHide";
      },(err:any)=>{
        this.TableDataLoader = "";
        this.errorHandle(err);
      }, () => console.log());
  }


  submitFilter(){
    this.TableDataLoader = "addLoader";
    
    let data = this.filter_form.value;
    let beneficiary_name ='';
    if(this.filter_form.value.beneficiary_name==''){
      beneficiary_name ='';
    }else if(this.filter_form.value.beneficiary_name!=''){
      beneficiary_name = this.filter_form.value.beneficiary_name;
    }
    if(typeof beneficiary_name =='undefined'){
      beneficiary_name = this.filter_form.value.beneficiary_name;
    }


    if(this.submitType=='1')
    {
      data ={
        "recepient_name":beneficiary_name,
        "payment_date_from":'',
        "payment_date_to":'',
        "expense_categories_id":'',
        "amount":'',
        "email_id":'',
        "mobile_number":'',
        "limit":10
      }
    }else if(this.submitType=='2'){
      if(this.filter_form.value.start_date!='' && this.filter_form.value.start_date!=null){
        this.range_start=this.datePipe.transform(this.filter_form.value.start_date, 'yyyy-MM-dd')+' 00:00:00';

      }else{
        this.range_start="";
      }

      if(this.filter_form.value.end_date!='' && this.filter_form.value.end_date!=null){
        this.range_end=this.datePipe.transform(this.filter_form.value.end_date, 'yyyy-MM-dd')+' 11:59:59';
      }else{
        this.range_end="";
      }

      let expense_categories_id='';
      if(this.filter_form.value.category_name!='' && this.filter_form.value.category_name!=null){
        expense_categories_id=this.filter_form.value.category_name.id;
      }else{
        expense_categories_id="";
      }

      data = {
        "payment_date_from":this.range_start,
        "payment_date_to":this.range_end,
        "expense_categories_id":expense_categories_id,
        "amount":this.filter_form.value.amount,
        "email_id":this.filter_form.value.email_id,
        "mobile_number":this.filter_form.value.mobile_number,
        "recepient_name":beneficiary_name,
        "limit":10
      };
    }
    
    this._httpService.getPaymentsByFilter(data)
    .subscribe((result)=>{
      this.TableDataLoader = "";
      this.crossButton = true;
      
      if(result.status=200){
        
        mixpanel.track('payment-listing-search-performed',data);
        Intercom('trackEvent','payment-listing-search-performed',data);

        this.generat_page(result);
        this.filter_toggle='';
      }
      this.hideWarningClass = "clickHide";
    },(err:any)=>{
      this.crossButton = false;
      
      this.TableDataLoader = "";
      this.errorHandle(err);
    }, () => console.log())
  }

  filter_By_Month(event){
    this.TableDataLoader = "addLoader";
    
    let filter_date =event.value;
    let sp ="-";
    var date = new Date(), y = date.getFullYear(), m = date.getMonth();

    if (filter_date == 1) {
      var firstDay = new Date(y, m, 1);
      var lastDay = new Date(y, m + 1, 0);
      let last_date = lastDay.getDate();
      m = m + 1; //january start with 0
      this.range_start = y + sp + m + sp + 1;
      this.range_end = y + sp + m + sp + last_date;
    } else if (filter_date == 2) {
      var days = 14; // Days you want to subtract
      var date = new Date();
      var last = new Date(date.getTime() - (days * 24 * 60 * 60 * 1000));
      this.range_start = this.datePipe.transform(last, 'yyyy-MM-dd');
      this.range_end = this.datePipe.transform(date, 'yyyy-MM-dd');
    } else if (filter_date == 3) {
      // var d = new Date();
      // var new_date = d.setMonth(d.getMonth() - 1);
      // var date = new Date(new_date), y = date.getFullYear(), m = date.getMonth();
      // var lastDay = new Date(y, m + 1, 0);
      // var firstDay = new Date(y, m, 1);
      // this.range_start =this.datePipe.transform(firstDay, 'yyyy-MM-dd');
      // this.range_end =this.datePipe.transform(lastDay, 'yyyy-MM-dd');
 
      var days = 30; // Days you want to subtract
      var date = new Date();
      var last = new Date(date.getTime() - (days * 24 * 60 * 60 * 1000));
      this.range_start = this.datePipe.transform(last, 'yyyy-MM-dd');
      this.range_end = this.datePipe.transform(date, 'yyyy-MM-dd');
 
    } else if (filter_date == 4) {
      // var d = new Date();
      // var new_date = d.setMonth(d.getMonth() - 6);
      // var date = new Date(new_date), y = date.getFullYear(), m = date.getMonth();
      // var firstDay = new Date(y, m, 1);
      // this.range_start =this.datePipe.transform(firstDay, 'yyyy-MM-dd');
 
      // var d = new Date();
      // var new_date = d.setMonth(d.getMonth() - 1);
      // var date = new Date(new_date), y = date.getFullYear(), m = date.getMonth();
      // var lastDay = new Date(y, m + 1, 0);
      // this.range_end =this.datePipe.transform(lastDay, 'yyyy-MM-dd');
 
      var days = 180; // Days you want to subtract
      var date = new Date();
      var last = new Date(date.getTime() - (days * 24 * 60 * 60 * 1000));
      this.range_start = this.datePipe.transform(last, 'yyyy-MM-dd');
      this.range_end = this.datePipe.transform(date, 'yyyy-MM-dd');
    }

    let data ={
      "payment_date_from":this.range_start+' 00:00:00',
      "payment_date_to":this.range_end+' 11:59:59',
      "expense_categories_id":'',
      "recepient_name":"",
      "amount":'',
      "email_id":'',
      "mobile_number":'',
      "limit":10
    }

    this._httpService.getPaymentsByFilter(data)
    .subscribe((result)=>{
      if(result.status=200){
        this.TableDataLoader = "";
        this.generat_page(result);
        
      }
      this.hideWarningClass = "clickHide";
    },(err:any)=>{
      this.TableDataLoader = "";
      this.errorHandle(err);
    }, () => console.log())
    
  }

  search(event){
    let query = event.query;
    this._httpService.getCustomers(query).subscribe((result)=>{
      if(result.data.length>0){
        this.filteredCustomerSingle= result.data;
      }
      //  else{
      //   this.filteredCustomerSingle = [{'id':'new','name':'+ Add '+query }];
      // }
      this.hideWarningClass = "clickHide";
    },(err:any)=>{
      this.errorHandle(err);
    }, () => console.log())
  }

  filteredCategorySingle:any[] = [];
   
  searchCategory(event) {
      let query = event.query;
      this._httpService.getExpenseCategorySearch(query).subscribe((result)=>{
      if(result.data.length>0){
        this.filteredCategorySingle = [];
        this.filteredCategorySingle= result.data;
      }
      this.hideWarningClass = "clickHide";
    },(err:any)=>{
      this.errorHandle(err);
    }, () => console.log());
  }

  paymentDetail(data,model_type){
    this.payment_detail={};
    let tag_arr=[];
    if(typeof data.tags.data.length !="undefined" && data.tags.data.length > 0){
      data.tags.data.forEach(function(element) {
          tag_arr.push(element.tag_name);
      })
    }
    data.tag_arr=tag_arr;
    this.payment_detail=data;
    //console.log(this.payment_detail);
    //data.expense_categories=null;

    if(typeof data.document_proof_files.data.length !="undefined" && data.document_proof_files.data.length > 0)
    {
      this.attachment_id=[];
      this.attachment_data=[];

      for(let file of data.document_proof_files.data){
        this.attachment_id.push(file.files.data[0].id);
        this.attachment_data.push(file.files.data[0]);
      }
    }



    if(model_type==1){
      this.getPaymentDetail.nativeElement.click();
    }else if(model_type==2){
      this.updatePayments.nativeElement.click();
    }else if(model_type==3){
      this.cancelPaymentModel.nativeElement.click();
    }else if(model_type==4){
      this.stopRecurrenceModel.nativeElement.click();
    }

  }

  public update_loader ="";
  onSubmitUpdatePayment(){
    this.update_loader="addLoader";
    let data = this.updatePaymentForm.value;
    data.accounts_id=this.accounts_id;
    data.companies_id=this.companies_id;
    data.contacts_id=this.payment_detail.contact.data.id;

    data.payment_schedules_id=this.payment_detail.payment_schedules_id;

    if(this.type==1){
        data.payment_date=this.payment_detail.start_date;
        data.amount=this.payment_detail.amount;
    }

    data.files_id=this.attachment_id;
    if(data.start_date == '' || data.start_date == null) {
      delete data.start_date;
    }
    // console.log(data);
    // console.log(this.payment_detail.id);

    this._httpService.updatePayments(this.payment_detail.id,data)
		.subscribe((result) => {
      if(result.status==200) {
        this.update_loader="";
        this.getPayments(this.type);

        this.closeUpdatePayment.nativeElement.click();
        this.loader_status=true;
        this.http_message="Payment updated successfully";
        setTimeout(() =>{
          this.loader_status=false;
        },5000);
      }
        
      this.hideWarningClass = "clickHide";
    },(err:any)=>{
      this.update_loader="";
      this.closeUpdatePayment.nativeElement.click();
      
      this.errorHandle(err);
    }, () => console.log());
    
    
  }

  getPayments(type){
    this.TableDataLoader = "addLoader";
    
    if(type==1){
      this.classActive1="active";
      this.classActive2="";
      this.classActive3="";
    }else if(type==2){
      this.classActive2="active";
      this.classActive1="";
      this.classActive3="";
    }else{
      this.classActive3="active";
      this.classActive1="";
      this.classActive2="";

    }
    this.data=[];
    this.type=type;
    this._httpService.getPayments(type)
		.subscribe((result) => {
        if(result.status==200){
          this.TableDataLoader = "";
          //console.log(result);
          this.generat_page(result);
        }
        this.hideWarningClass = "clickHide";
      },(err:any)=>{
        this.TableDataLoader = "";
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

  updatePayment(){
    this.closePaymentDetail.nativeElement.click();
    this.updatePayments.nativeElement.click();
    
  }

  getExpenseCategory(){
    this._httpService.getExpenseCategory()
		.subscribe((result) => {
      result.data.forEach(element => {
       this.expense_category.push({label: element.category_name, value: element.id});        
      });
      this.hideWarningClass = "clickHide";
    },(err:any)=>{
      this.errorHandle(err);
    }, () => console.log());
  }

  cancelPayment(){
    let data:any={};
    data.accounts_id=this.accounts_id;
    data.companies_id=this.companies_id;
    data.contacts_id=this.payment_detail.contact.data.id;
    data.is_cancel=1;

    this._httpService.updatePayments(this.payment_detail.id,data)
		.subscribe((result) => {
      if(result.status==200){
        if(this.type==2){
          this.cancelSchedulPayment.nativeElement.click();
        }else{
          this.cancelRecurringPayment.nativeElement.click();
        }
        
        this.loader_status=true;
        this.http_message="Payment cancel successfully";
        setTimeout(() =>{
          this.loader_status=false;
        },5000);
      }
        
      this.hideWarningClass = "clickHide";
    },(err:any)=>{
      if(this.type==2){
        this.cancelSchedulPayment.nativeElement.click();
      }else{
        this.cancelRecurringPayment.nativeElement.click();
      }
      this.errorHandle(err);
    }, () => console.log());
  }

  //other image upload from system
  onChangeOthers(fileInput: any) {
    if (fileInput.target.files && fileInput.target.files[0]) {
      let imgSrc = fileInput.target.files[0];
      this._httpService.fileUploadOthers(imgSrc)
        .subscribe((result) => {
          
          if (result.status == 200) {
            this.attachment_id.push(result.data.id);
            this.attachment_data.push(result.data);
          }
          this.hideWarningClass = "clickHide";
        },(err:any)=>{
          this.errorHandle(err);
        }, () => console.log());
    }
  }

  toggleFilter(){
    
    if(this.filter_toggle==''){
      this.filter_toggle='boxDisplayBlock';
    }else{
      this.filter_toggle='';
    }
  }

  is_email_mobile=1;
  check_email_mobile(event){
    this.is_email_mobile=event;
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

  download() {
    let url  = this._httpService.download();
    window.open(url, '_blank').focus();
  }

  getFrequencyList(){
		this.frequnecy=this._httpService.getFrequencyList();
  }
  
  delteOtherFiles(data) {
    if (data) {
      this.attachment_data.splice(this.attachment_data.indexOf(data), 1);
      this.attachment_id.splice(this.attachment_id.indexOf(data.id), 1);
      
      this._httpService.deleteFiles(data.id)
        .subscribe((result) => {
          //console.log(result);
          this.hideWarningClass = "clickHide";
        },(err:any)=>{
          this.errorHandle(err);
        }, () => console.log());
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
  
  mysort(event){

    // console.log(window.event)
    // console.log(window.event.bubbles);
    if (typeof window.event.bubbles != 'undefined' && window.event.bubbles == true) {
    //console.log('pavan');
    this.TableDataLoader = "addLoader";
    
    let sortedBy="";
    if(event.order==1){
      sortedBy='desc';
    }else{
      sortedBy='asc';        
    }

    
    let beneficiary_name ='';
    if(this.filter_form.value.beneficiary_name==''){
      beneficiary_name ='';
    }else if(this.filter_form.value.beneficiary_name!=''){
      beneficiary_name = this.filter_form.value.beneficiary_name;
    }
    if(typeof beneficiary_name =='undefined'){
      beneficiary_name = this.filter_form.value.beneficiary_name;
    }

    if(this.filter_form.value.start_date!='' && this.filter_form.value.start_date!=null){
      this.range_start=this.datePipe.transform(this.filter_form.value.start_date, 'yyyy-MM-dd')+' 00:00:00';

    }else{
      this.range_start="";
    }

    if(this.filter_form.value.end_date!='' && this.filter_form.value.end_date!=null){
      this.range_end=this.datePipe.transform(this.filter_form.value.end_date, 'yyyy-MM-dd')+' 11:59:59';
    }else{
      this.range_end="";
    }

    let expense_categories_id='';
    if(this.filter_form.value.category_name!='' && this.filter_form.value.category_name!=null){
      expense_categories_id=this.filter_form.value.category_name.id;
    }else{
      expense_categories_id="";
    }

    let data ={
      "payment_date_from":this.range_start,
      "payment_date_to":this.range_end,
      "expense_categories_id":expense_categories_id,
      "amount":this.filter_form.value.amount,
      "email_id":this.filter_form.value.email_id,
      "mobile_number":this.filter_form.value.mobile_number,
      "recepient_name":beneficiary_name,
      "limit":10,
      "page":1,
      "orderBy":event.field,
      "sortedBy":sortedBy
    }
      this._httpService.sortPayment(data)
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
  hrefClick(data){
    mixpanel.track(
      data,
      {"menu": "click"}
    );
    Intercom('trackEvent', data);
    
  }
}
