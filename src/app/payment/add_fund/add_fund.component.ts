import { Component, OnInit} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PaymentService } from '../../service/payment.service';
import { Router } from '@angular/router';
import { CustomValidators } from 'ng2-validation';

@Component({
  selector: 'app-addFund',
  templateUrl: './add_fund.component.html',
  providers:[PaymentService]
})
export class AddFundComponent implements OnInit {
  public companies_id;
  public accounts_id;
  public fname;
  public lname;
  
  company_detail:any=Object;
  account_detail:any=Object;
  account_balance:any;

  sumbitLoader="";
  

  constructor(private _httpService:PaymentService){
    var currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.companies_id = currentUser && currentUser.company_details.companies_id;
    this.accounts_id  = currentUser && currentUser.account_details.accounts_id;
    this.fname = currentUser && currentUser.data.data.first_name;
    this.lname = currentUser && currentUser.data.data.last_name;
    
  }

  ngOnInit() {
    this.getAccountBalance();
    this.getAccountDetail();
  }

  getAccountBalance(){
    this._httpService.getAccountBalance()
		.subscribe((result) => {
        this.account_balance=result.data.account_balance;
	  },
		(err: any) => {
			if(err.status==0){console.log('please check your internet connection');}},
		()=>console.log());
  }

  getAccountDetail(){
  this.sumbitLoader="addLoader";
  
    this._httpService.getAccountDetail()
		.subscribe((result) => {
        this.account_detail=result.data;
        this.company_detail=result.data.company.data;
        this.sumbitLoader="";
        //console.log(result.data.company.data);
	  },
		(err: any) => {
      this.sumbitLoader="";
			if(err.status==0){console.log('please check your internet connection');}},
		()=>console.log());
  }


}
