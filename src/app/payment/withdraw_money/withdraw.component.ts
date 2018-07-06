import { Component, OnInit, ViewChild, ElementRef , ViewContainerRef, EventEmitter} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PaymentService } from '../../service/payment.service';
import { Router } from '@angular/router';
import { CustomValidators } from 'ng2-validation';
declare let mixpanel: any;
declare let Intercom: any;
@Component({
  selector: 'app-transfer',
  templateUrl: './withdraw.component.html',
  providers:[PaymentService]

})
export class WithdrawMoneyComponent implements OnInit {
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
  public loaderClassSubmitBank="";

  filteredCategory:any[] = [];

  public bank_account_number= new FormControl('', [Validators.required,Validators.pattern("[0-9]{9,18}")]);

  @ViewChild('cate_name') cate_name: ElementRef;

  @ViewChild('addBankpop') addBankpop: ElementRef;
  @ViewChild('confirmPayment') confirmPayment: ElementRef;
  @ViewChild('requestInitiate') requestInitiate: ElementRef;
  @ViewChild('closeConfirm') closeConfirm: ElementRef;
  @ViewChild('closeAddBank') closeAddBank: ElementRef;
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
  }


  withdraw_money = new FormGroup({
      withdraw_bank_accounts_id:new FormControl('',Validators.required),
      beneficiary_name: new FormControl('', [Validators.required]),
      amount: new FormControl('', [Validators.required,Validators.pattern('[0-9]+(\.[0-9][0-9]?)?')]),
      purpose: new FormControl(''),
  });

  addBank = new FormGroup({
      beneficiary_name: new FormControl('',[Validators.required,Validators.pattern('^[a-zA-z ]+$'), Validators.maxLength(50)]),
      mobile_number: new FormControl('', [Validators.required, Validators.pattern('^[789][0-9]{9}$')]),
      bank_account_number: this.bank_account_number,
      confirm_acc_number: new FormControl('',[Validators.required,CustomValidators.equalTo(this.bank_account_number)]),
      ifsc_code: new FormControl('',[Validators.required]),
      bank_name: new FormControl({value: '', disabled: true},[Validators.required]),
      branch_name: new FormControl({value: '', disabled: true},[Validators.required]),
  });


  onSubmitWithdraw(){
    let data = this.withdraw_money.value;
    data.accounts_id=this.accounts_id;
    data.companies_id=this.companies_id;
    data.withdraw_bank_accounts_id=data.beneficiary_name.withdraw_bank_accounts_id;
    this.transfer_detail=data;
    this.confirmPayment.nativeElement.click();
  }

  confirmTransfer(){
    this.loaderClasssubmit="addLoader";
    let data =this.transfer_detail;
    this._httpService.withdrawMoney(data)
		.subscribe((result) => {

      mixpanel.track(
        'withdraw-performed',result.data
      );
      Intercom('trackEvent','withdraw-performed', result.data);

      this.closeConfirm.nativeElement.click();
      this.requestInitiate.nativeElement.click();
      this.loaderClasssubmit="";
      
	    this.hideWarningClass = "clickHide";
		},(err:any)=>{
      this.loaderClasssubmit="";
			this.errorHandle(err);
		}, () => console.log());
    
  }

  makeAnother(){
    this.successLoader('The account will be credited in 4 hours or depending upon the NEFT cycle of the destination bank'); 
    this.withdraw_money.reset();   
    
    setTimeout(() =>{
      this._router.navigate(['/transactions']);
    },3000);

  }

  public balance_error =false;
  check_balance(event){
    if(!isNaN(event.target.value) && event.target.value > Number(this.account_balance)){
      this.balance_error =true;
    }else{
      this.balance_error =false;
    }
  }

  onSubmitaddBank(){
    this.loaderClassSubmitBank="addLoader";
    let data = this.addBank.getRawValue();

    data.accounts_id=this.accounts_id;
    data.companies_id=this.companies_id;
    delete data.confirm_acc_number;
    delete data.email_mobile;

    this._httpService.addBeneficiary(data)
		.subscribe((result) => {
      if(result.status==200){
        this.withdraw_money.patchValue({beneficiary_name:result.data});
        this.withdraw_money.patchValue({withdraw_bank_accounts_id:result.data.withdraw_bank_accounts_id});
        
        this.loaderClassSubmitBank="";
      
        this.addBank.reset();
        this.closeAddBank.nativeElement.click();

        this.successLoader('Bank Added successfully'); 
    
      }
      this.hideWarningClass = "clickHide";
		},(err:any)=>{
      this.loaderClassSubmitBank="";
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

  getBankDetail(event){
    if(event.id=='new'){
      this.withdraw_money.patchValue({beneficiary_name:{'withdraw_bank_accounts_id':'','bank_name':'' }});
      this.withdraw_money.patchValue({withdraw_bank_accounts_id:''});
      this.openBeneficiaryAddModal();

      this.addBank.reset();
      this.addBank.patchValue({ beneficiary_name: event.query });
    }
    else {
      this.beneficiary_data = event;
      this.withdraw_money.patchValue({withdraw_bank_accounts_id:event.withdraw_bank_accounts_id});
      
    }
  }

  
  search(event){
   let query = event.query;
    this.withdraw_money.patchValue({withdraw_bank_accounts_id:''});
    this._httpService.getWithdraws(query).subscribe((result)=>{
      if(result.data.length>0){
        this.filteredCustomerSingle= result.data;
        this.filteredCustomerSingle.splice(0,0,{'id':'new','beneficiary_name':'+ Add Bank Account','query':'','class':'new','bank_account_number':''});
      } else{
        this.filteredCustomerSingle = [{'id':'new','beneficiary_name':'+ Add '+query ,'class':'new','bank_account_number':'','query':query}];
      }
      this.hideWarningClass = "clickHide";
		},(err:any)=>{
			this.errorHandle(err);
		}, () => console.log())
   
  }

  openBeneficiaryAddModal(): void {
    this.addBankpop.nativeElement.click();
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
      this.loaderClassSubmitBank="addLoader";
      this._httpService.getBankDetail(event.target.value)
      .subscribe((result) => {
        this.loaderClassSubmitBank="";
        if(type==1){
          this.addBank.patchValue({ bank_name: result.data.bank });
          this.addBank.patchValue({ branch_name: result.data.branch });
        }else{
          // this.updateBeneficiary.patchValue({ bank_name: result.data.bank });
          // this.updateBeneficiary.patchValue({ branch_name: result.data.branch });
        }
        
      },
      (err: any) => {
        this.loaderClassSubmitBank="";
        if(err.status==0){console.log('please check your internet connection');
        }
        },
      ()=>console.log());
    }else{
        this.addBank.patchValue({ bank_name:''});
        this.addBank.patchValue({ branch_name:'' });
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
