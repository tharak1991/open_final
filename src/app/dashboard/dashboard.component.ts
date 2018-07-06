import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { PaymentService } from '../service/payment.service';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
declare let mixpanel: any;
declare let Intercom: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  providers:[PaymentService,DatePipe]
  
})
export class DashboardComponent implements OnInit {

  public toggle_class="";
  public companies_id;
  public accounts_id;
  public fname;
  public lname;
  public brand_name;
  

  account_detail:any=Object;
  dashboard_detail:any=Object;
  public transfer_detail:any=Object;
  
  meta :any=Object;
  
  account_balance:any;

  graph_data: any;
  graph_option: any;
  public label=[];
  public graph_dat1=[];
  public graph_dat2=[];
  public graph_dat3=[];
  

  public upcoming_details=[];
  submitLoader="";
  balanceLoader="";
  dashboardDataLoader="";
  
  type="all";
  
  filter:any[]=[];

  public range_start ="";
  public range_end ="";

  public filter_date=1;

  public today;
  @ViewChild('welcomeModal') welcomeModal: ElementRef;
  @ViewChild('closeBtn') closeBtn: ElementRef;

  constructor(private datePipe :DatePipe,private _httpService:PaymentService,private _router:Router) { 
    var currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.companies_id = currentUser && currentUser.company_details.companies_id;
    this.accounts_id  = currentUser && currentUser.account_details.accounts_id;
    this.fname = currentUser && currentUser.data.data.first_name;
    this.lname = currentUser && currentUser.data.data.last_name;

    this.brand_name = currentUser && currentUser.company_details.brand_name;

    this.filter.push({label:'This Month', value:1});
    this.filter.push({label:'Last 3 Months', value:2});
    this.filter.push({label:'Last 6 Months', value:3});
    this.filter.push({label:'Last 12 Monhts', value:4});
    
    
  }

  ngOnInit() {
    this.today= new Date();
    // let inDate = "12/06/2013";

    // var dateParts = inDate.split(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    // alert(dateParts[3] + "-" + dateParts[1] + "-" + dateParts[2]);
    this.checkIsComeFromOnboarding();
    this.getAccountBalance();
    this.getAccountDetail();
    this.getDashboardData(this.filter_date);
    this.getUpcoming(this.type);

  }

  	//error handler
	public warning_message = "";
	public hideWarningClass = "clickHide";
	public loaderClasssubmit = "addLoader";
	

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

  toggleTips(){
    if(this.toggle_class==""){
      this.toggle_class="showTips";
    }else{
      this.toggle_class="";      
    }
  }

  GetData(event){
    this.getDashboardData(event.value);
  }

  getAccountBalance(){
    this.balanceLoader="addLoader";
    this._httpService.getAccountBalance()
		.subscribe((result) => {
        this.account_balance=result.data.account_balance;
        this.balanceLoader="";
        this.hideWarningClass = "clickHide";
		
		},(err:any)=>{
			this.errorHandle(err);
		}, () => console.log());
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

  getDashboardData(filter_date){
    this.dashboardDataLoader="addLoader";
    var d = new Date();
    var new_date = d.setMonth(d.getMonth() - 1);
    var date = new Date(new_date), y = date.getFullYear(), m = date.getMonth();
    var lastDay = new Date(y, m + 2, 0);
    this.range_end =this.datePipe.transform(lastDay, 'yyyy-MM-dd');

    if(filter_date==1){
      var d = new Date();
      var date = new Date(d), y = date.getFullYear(), m = date.getMonth();
      var lastDay = new Date(y, m + 1, 0);
      this.range_end =this.datePipe.transform(lastDay, 'yyyy-MM-dd');

      var date = new Date(d), y = date.getFullYear(), m = date.getMonth();
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
    
    this._httpService.getDashboard(this.range_start,this.range_end)
        .subscribe((result) => {
          this.meta=result.meta;
          this.dashboard_detail=result.data;
          this.transfer_detail=result.data.book_keeping_data.data; 
          
          if(result.data.cash_flow_data.data){
            
              this.label=[];
              this.graph_dat1=[];
              this.graph_dat2=[];
              this.graph_dat3=[];
              
              for(let item of result.data.cash_flow_data.data) {
                  this.label.push(item.month);
                  this.graph_dat1.push(item.inflow);
                  this.graph_dat2.push(item.outflow);
                 // this.graph_dat3.push(item.cashflow);
                  
              }
              
              this.graph_data = {
                  xLabels: this.label,
                  //xLabels: ["Feb", "Mar", "Apr", "May", "Jun", "Jul"],                            
                  datasets: [
                      {
                          type: "bar",
                          label: 'Inflow',
                          backgroundColor: '#4a90e2',
                          borderColor: '#4a90e2',
                          data: this.graph_dat1
                        // data: [0,40,30,50,40,60]
                      },
                      {
                          type: "bar",
                          label: 'Outflow',
                          backgroundColor: '#ea6d78',
                          borderColor: '#ea6d78',
                          data: this.graph_dat2
                        // data: [60,40,50,30,40,30]
                          
                      }
                  ]
              }
              this.graph_option = {
                scales: {
                  xAxes: [{
                    position: 'left',
                    categoryPercentage: 0.3,
                    barPercentage: 0.8,
                    offset: false,
                    
                    // grid line settings
                    gridLines: {
                      offsetGridLines: false
                    }
                  }],
                  yAxes: [{
                    //type: 'category',
                    position: 'left',
                    ticks: {
                      beginAtZero:true,
                      max:this.meta.graph_max_value,
                      callback: function(value, index, values) {
                        //return value.toLocaleString("en-US",{style:"currency", currency:"INR"});
                        if(parseInt(value) >= 1000){
                            
                          // value =value/1000;
                          // return value.toLocaleString("en-US",{style:"currency", currency:"INR"}) + " k";

                          if ( value ) {
                          let abs = Math.abs( value );
                            if ( abs >= Math.pow( 10, 12 ) ) {
                            // trillion
                            value = ( value / Math.pow( 10, 12 ) ).toFixed( 1 ) + " T";
                            } else if ( abs < Math.pow( 10, 12 ) && abs >= Math.pow( 10, 9 ) ) {
                            // billion
                            value = ( value / Math.pow( 10, 9 ) ).toFixed( 1 ) + " B";
                            } else if ( abs < Math.pow( 10, 9 ) && abs >= Math.pow( 10, 6 ) ) {
                            // million
                            value = ( value / Math.pow( 10, 6 ) ).toFixed( 0 ) + " M";
                            } else if ( abs < Math.pow( 10, 6 ) && abs >= Math.pow( 10, 3 ) ) {
                            // thousand
                            value = ( value / Math.pow( 10, 3 ) ).toFixed( 0 );
                            value ="₹ "+parseInt(value)+ " K";
                            
                          //  value =parseInt(value).toLocaleString("en-US",{style:"currency", currency:"INR"}) + " K";
                            }
                            return value;
                          }

                        } else {
                          return parseInt(value);
                          
                        //  return parseInt(value).toLocaleString("en-US",{style:"currency", currency:"INR"});
                        }
                      }
                    },
                    display: true                  
                }]                
                },    
                legend: {
                  position: 'bottom'                         
                }          
            }

            this.dashboardDataLoader="";
          }  
          this.hideWarningClass = "clickHide";
        
        },(err:any)=>{
          this.errorHandle(err);
        }, () => console.log());
  }

  getUpcoming(type){
    this.upcoming_details=[];
    this.submitLoader='addLoader';    
    this._httpService.getUpcoming(type)
		.subscribe((result) => {
      if(result.status==200){
        this.upcoming_details=result.data;
        this.submitLoader='';    
      }
      this.hideWarningClass = "clickHide";
      
      },(err:any)=>{
        this.errorHandle(err);
      }, () => console.log());
  }

  checkIsComeFromOnboarding() {
    if (localStorage.getItem('isWelcomeOnboard') == 'true') {
      this.welcomeModal.nativeElement.click();
      localStorage.removeItem('isWelcomeOnboard');
    }
  }
 
  takemeToDashbaord() {
    this.closeBtn.nativeElement.click();
  }
}
