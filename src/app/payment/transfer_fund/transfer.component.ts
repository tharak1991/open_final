import { Component, OnInit, ViewChild, ElementRef , ViewContainerRef, EventEmitter} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PaymentService } from '../../service/payment.service';
import { Router } from '@angular/router';
import { CustomValidators } from 'ng2-validation';
declare let mixpanel: any;
declare let Intercom: any;
@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.component.html',
  providers:[PaymentService]

})
export class TransferFundComponent implements OnInit {
  public companies_id;
  public accounts_id;
  public users_id;
  
  account_balance:any;
  payment_schedules_id ='1';
  bank_list:any;
  error="";

  beneficiary_data: any;
  filteredCustomerSingle:any = [];
  expense_category:any = [];
  attachment_id: any = [];
  file_arr: any = [];
  

  transfer_detail:any;
  
  frequnecy:any = [];
  public toggle_class="";
  public loaderClasssubmit="";
  public loaderClassSubmitBeneficiery="";
  


  filteredCategory:any[] = [];
  

  public beneficiary_account_number= new FormControl('', [Validators.required,Validators.pattern("[A-Za-z0-9]{9,18}")]);

  @ViewChild('cate_name') cate_name: ElementRef;

  @ViewChild('updateBeneficiarypop') updateBeneficiarypop: ElementRef;
  @ViewChild('addBeneficiarypop') addBeneficiarypop: ElementRef;
  @ViewChild('confirmPayment') confirmPayment: ElementRef;
  @ViewChild('requestInitiate') requestInitiate: ElementRef;
  @ViewChild('closeConfirm') closeConfirm: ElementRef;
  @ViewChild('closeTagNotes') closeTagNotes: ElementRef;
  @ViewChild('closeAddBeneficiery') closeAddBeneficiery: ElementRef;
  @ViewChild('closeUpdateBeneficiery') closeUpdateBeneficiery: ElementRef;
  @ViewChild('cancelPayment') cancelPayment: ElementRef;
  @ViewChild('closeRequest') closeRequest: ElementRef;

  constructor(private _httpService:PaymentService, private _router: Router){
    var currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.companies_id = currentUser && currentUser.company_details.companies_id;
    this.accounts_id  = currentUser && currentUser.account_details.accounts_id;
    this.users_id = currentUser && currentUser.data.data.users_id;
    
  }

  ngOnInit() {
    this.getAccountBalance();
    this.getExpenseCategory();
    this.getFrequencyList();
  }


  transferFund = new FormGroup({
      beneficiary_id:new FormControl('',Validators.required),
      category_id:new FormControl('',Validators.required),
      beneficiary_name: new FormControl('', [Validators.required]),
      amount: new FormControl('', [Validators.required,Validators.pattern('[0-9]+(\.[0-9][0-9]?)?')]),
      expense_categories_id: new FormControl('',[Validators.required]),
      purpose: new FormControl(''),
      payment_schedules_id: new FormControl(this.payment_schedules_id,[Validators.required]),
      payment_date: new FormControl(''),
      start_date: new FormControl(''),
      frequencies_id: new FormControl(''),
      repeat_for: new FormControl('')
  });

  addBeneficiary = new FormGroup({
      name: new FormControl('',[Validators.required,Validators.pattern('^[a-zA-z ]+$'), Validators.maxLength(50)]),
      email_mobile: new FormControl('', [Validators.required]),
      beneficiary_account_number: this.beneficiary_account_number,
      confirm_acc_number: new FormControl('',[Validators.required,CustomValidators.equalTo(this.beneficiary_account_number)]),
      ifsc_code: new FormControl('',[Validators.required]),
      bank_name: new FormControl('',[Validators.required]),
      branch_name: new FormControl('',[Validators.required]),
      // bank_name: new FormControl({value: '', disabled: true},[Validators.required]),
      // branch_name: new FormControl({value: '', disabled: true},[Validators.required]),
      currency: new FormControl('INR'),
     pan:new FormControl('',Validators.pattern('^[A-Z]{5}[0-9]{4}[A-Z]{1}$')),
     gstin: new FormControl('',Validators.pattern('^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$')),
     tds: new FormControl('',Validators.pattern('^[0-9]{1,2}$')),
     notes: new FormControl(''),
      email_id: new FormControl(''),
      mobile_number: new FormControl(''),
     other_details: new FormControl(''),
     primary_contact: new FormControl('',[Validators.pattern('^[a-zA-z ]+$'),Validators.maxLength(50)]),
      type_of_contact: new FormControl('Individual'),
     landline_number: new FormControl(''),
      shipping_address1 : new FormGroup({
          address_line: new FormControl(''),
          city: new FormControl(''),
          state: new FormControl(''),
          pincode : new FormControl('',Validators.pattern('^[0-9]{6}$'))
      }),
      billing_address1 : new FormGroup({
          address_line: new FormControl(''),
          city: new FormControl(''),
          state: new FormControl(''),
          pincode : new FormControl('',Validators.pattern('^[0-9]{6}$'))
      })
  });

  updateBeneficiary = new FormGroup({
      name: new FormControl('',[Validators.required,Validators.pattern('^[a-zA-z ]+$'), Validators.maxLength(50)]),
      email_mobile: new FormControl('', [Validators.required]),
      beneficiary_account_number: this.beneficiary_account_number,
      confirm_acc_number: new FormControl('',[Validators.required,CustomValidators.equalTo(this.beneficiary_account_number)]),
      ifsc_code: new FormControl('',[Validators.required]),
      bank_name: new FormControl('',[Validators.required]),
      branch_name: new FormControl('',[Validators.required]),
      currency: new FormControl('INR'),
      email_id: new FormControl(''),
      mobile_number: new FormControl(''),
      type_of_contact: new FormControl('Individual')
  });

  tagTotes = new FormGroup({
      tags: new FormControl(''),
      note: new FormControl('')
  });

  onSubmitTagTotes(){
    let data = this.tagTotes.value;
    this.closeTagNotes.nativeElement.click();
    
  }

  public balance_error =false;
  check_balance(event){
    if(!isNaN(event.target.value) && event.target.value > Number(this.account_balance)){
      this.balance_error =true;
    }else{
      this.balance_error =false;
    }
    //console.log(this.balance_error);
  }

  onSubmitTransfer(){
    
    let data = this.transferFund.value;
    data.accounts_id=this.accounts_id;
    data.companies_id=this.companies_id;

    data.contacts_id=data.beneficiary_name.id;

    data.tags=this.tagTotes.value.tags;
    data.notes=this.tagTotes.value.note;
    
    data.files_id=this.attachment_id;
    
     this.transfer_detail=data;
     this.transfer_detail.expense_categories_id=data.expense_categories_id.id;
     this.confirmPayment.nativeElement.click();
  }

  confirmTransfer(){
    this.loaderClasssubmit="addLoader";
    let data =this.transfer_detail;
    this._httpService.transferFund(data)
		.subscribe((result) => {
      
      mixpanel.track('payment-successfully-done',data);
      Intercom('trackEvent','payment-successfully-done',data);

      this.closeConfirm.nativeElement.click();
      this.requestInitiate.nativeElement.click();
      this.loaderClasssubmit="";
      
      this.hideWarningClass = "clickHide";
      },(err:any)=>{
        this.errorHandle(err);
      }, () => console.log());
    
  }

  makeAnother(){
      this.closeRequest.nativeElement.click();    
      this.cancelPayment.nativeElement.click();   
      //this.successLoader('The account will be credited in 4 hours or depending upon the NEFT cycle of the destination bank'); 
      setTimeout(() =>{
        this._router.navigate(['/payments']);
      },3000);
  }

  onSubmitAddBeneficiary(){
    this.loaderClassSubmitBeneficiery="addLoader";
    let data = this.addBeneficiary.getRawValue();

    data.accounts_id=this.accounts_id;
    data.companies_id=this.companies_id;
    data.billing_address=[data.billing_address1];
    data.shipping_address=[data.shipping_address1];
    data.type_of_contact='Individual';
    data.currency='INR';
    
    if (data.email_mobile.indexOf('@') !== -1) {
      data.email_id=data.email_mobile;

    }else{
      data.mobile_number=data.email_mobile;
    }
    delete data.confirm_acc_number;
    delete data.email_mobile;
    delete data.billing_address1;
    delete data.shipping_address1;

    this._httpService.createContact(data)
		.subscribe((result) => {
      this.transferFund.patchValue({beneficiary_name:result.data});
      this.transferFund.patchValue({beneficiary_id:result.data.id});
      
      this.loaderClassSubmitBeneficiery="";
    
      this.closeAddBeneficiery.nativeElement.click();

      this.successLoader('Beneficiery added successfully'); 

	    this.hideWarningClass = "clickHide";
		},(err:any)=>{
      this.loaderClassSubmitBeneficiery="";
      this.closeAddBeneficiery.nativeElement.click();
			this.errorHandle(err);
		}, () => console.log());
    
  }

  onSubmitUpdateBeneficiary(){
    this.loaderClassSubmitBeneficiery="addLoader";
    
    let data = this.updateBeneficiary.getRawValue();

    data.accounts_id=this.accounts_id;
    data.companies_id=this.companies_id;
   // data.billing_address=[data.billing_address1];
   // data.shipping_address=[data.shipping_address1];
    
    if (data.email_mobile.indexOf('@') !== -1) {
      data.email_id=data.email_mobile;
      delete data.mobile_number;
    }else{
      data.mobile_number=data.email_mobile;
      delete data.email_id;
    }
    delete data.confirm_acc_number;
    delete data.email_mobile;
    delete data.billing_address1;
    delete data.shipping_address1;
    
    this._httpService.updateContact(data,this.beneficiary_data.id)
		.subscribe((result) => {
      this.loaderClassSubmitBeneficiery="";
      this.closeUpdateBeneficiery.nativeElement.click();
      this.transferFund.patchValue({beneficiary_id:this.beneficiary_data.id});
      this.successLoader('Beneficiery updated successfully'); 
	    this.hideWarningClass = "clickHide";
		},(err:any)=>{
      this.loaderClassSubmitBeneficiery="";
      this.closeUpdateBeneficiery.nativeElement.click();
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

  getBeneficiaryDetail(event){
    if(event.id=='new'){
      this.transferFund.patchValue({beneficiary_name:{}});
      
      this.addBeneficiary.reset();
      this.addBeneficiary.patchValue({'name':event.query});
      this.openBeneficiaryAddModal();
    }
    else if(event.beneficiary_account_number == '' || event.beneficiary_account_number == null){
      this.beneficiary_data = event;
      //console.log(this.beneficiary_data);
      this.openBeneficiaryModal();
    } else {
      this.beneficiary_data = event;
      this.transferFund.patchValue({beneficiary_id:event.id});
      
    }
  }

  selectCategory(event){
    if(event.id=='new'){
      let query: string = event.query;
      let data={
      "accounts_id":this.accounts_id,
      "companies_id":this.companies_id,
      "users_id": this.users_id,
      "category_name":query,
      "is_deleted":0
      }
      this.transferFund.patchValue({ expense_categories_id:data });
      
      this._httpService.createExpenseCategory(data)
      .subscribe((result) => {
          if(result.status==200){
            //this.transferFund.patchValue({ expense_categories_id:data });
            this.transferFund.patchValue({ category_id:result.data.id });
      
          }else{
            this.transferFund.patchValue({ expense_categories_id:{'category_name':''} });
          }
      },
      (err: any) => {
        if(err.status==0){console.log('please check your internet connection');}
        },
      ()=>console.log());
    
    }else{
      this.transferFund.patchValue({ category_id:event.id });
    }
  }
  
  search(event){
   let query = event.query;
   this._httpService.getCustomers(query).subscribe((result)=>{
     if(result.data.length>0){
       this.filteredCustomerSingle= result.data;
       this.filteredCustomerSingle.splice(0,0,{'id':'new','name':'+ Add Beneficiary','query':'','class':'new','beneficiary_account_number':''});
       
     } else{
       this.filteredCustomerSingle = [{'id':'new','name':'+ Add '+query,'query':query,'class':'new','beneficiary_account_number':'' }];
     }
     this.hideWarningClass = "clickHide";
		},(err:any)=>{
			this.errorHandle(err);
		}, () => console.log())
  }
  
  searchCategory(event) {
    this.transferFund.controls.category_id.setValue('');
    let query = event.query;
    this._httpService.getExpenseCategorySearch(query).subscribe((result)=>{
     
      this.filteredCategory= result.data;
      
      let query_exist = false;
			for(let cate of result.data){
				if(cate.category_name == query){
					query_exist = true;
					//this.filteredCategorySingle.push({'category_name':'+ Add new category'});
					return;
				}
      }
      
      if(result.data.length>0 && !query_exist){
        this.filteredCategory.splice(0,0,{'id':'new','category_name':'+ Add '+query,'query':query,'class':'new'});
        //this.filteredCategory.push({'id':'new','category_name':'+ Add '+query,'query':query,'class':'new'});
      } else{
      this.filteredCategory = [{'id':'new','category_name':'+ Add '+query,'query':query,'class':'new'}];
      }
      this.hideWarningClass = "clickHide";
		},(err:any)=>{
			this.errorHandle(err);
		}, () => console.log());
  }

  image_loader ='';
  //other image upload from system
  onChangeOthers(fileInput: any) {
    if (fileInput.target.files && fileInput.target.files[0]) {
      this.image_loader='addLoader';
      let imgSrc = fileInput.target.files[0];
      this._httpService.fileUploadOthers(imgSrc)
        .subscribe((result) => {
          if (result.status == 200) {
            this.image_loader='';
    
            this.attachment_id.push(result.data.id);
            this.file_arr.push(result.data);
          }
          this.hideWarningClass = "clickHide";
        },(err:any)=>{
          this.image_loader='';
    
          this.errorHandle(err);
        }, () => console.log());
    }
    
  }

  openBeneficiaryModal(): void {
    this.updateBeneficiarypop.nativeElement.click();
  }

  openBeneficiaryAddModal(): void {
    this.addBeneficiarypop.nativeElement.click();
  }

  getExpenseCategory(){
    this._httpService.getExpenseCategory()
		.subscribe((result) => {
      this.expense_category.push({label: 'select', value: ''}); 
      result.data.forEach(element => {
       this.expense_category.push({label: element.category_name, value: element.id});        
      });
      this.hideWarningClass = "clickHide";
		},(err:any)=>{
			//this.errorHandle(err);
		}, () => console.log());
  }

  check_transfer(data:any){
    this.payment_schedules_id=data;
  }

  toggleTips(){
    if(this.toggle_class==""){
      this.toggle_class="showTips";
    }else{
      this.toggle_class="";      
    }
  }

  searchBank(type,event){
    if((event.target.value.length==11))
    {
      this.loaderClassSubmitBeneficiery="addLoader";
      this._httpService.getBankDetail(event.target.value)
      .subscribe((result) => {
        this.loaderClassSubmitBeneficiery="";
        if(type==1){
          this.addBeneficiary.patchValue({ bank_name: result.data.bank });
          this.addBeneficiary.patchValue({ branch_name: result.data.branch });
        }else{
          this.updateBeneficiary.patchValue({ bank_name: result.data.bank });
          this.updateBeneficiary.patchValue({ branch_name: result.data.branch });
        }
        
        this.hideWarningClass = "clickHide";
      },(err:any)=>{
        this.errorHandle(err);
      }, () => console.log());
    }else{
        this.addBeneficiary.patchValue({ bank_name:''});
        this.addBeneficiary.patchValue({ branch_name:'' });
        this.updateBeneficiary.patchValue({ bank_name:''});
        this.updateBeneficiary.patchValue({ branch_name:'' });
    }
  }

  getFrequencyList(){
		this.frequnecy=this._httpService.getFrequencyList();
  }
  
    
  delteOtherFiles(data) {
    if (data) {
      this.file_arr.splice(this.file_arr.indexOf(data), 1);
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
  	//error handler
	public warning_message = "";
	public hideWarningClass = "clickHide";
	//public loaderClasssubmit = "addLoader";
	

	errorHandle(err){
		this.loaderClasssubmit = "";
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
			this._router.navigate(['/logout']); 
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
