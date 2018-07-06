import { Component, OnInit} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PaymentService } from '../service/payment.service';
import { Router } from '@angular/router';
import { CustomValidators } from 'ng2-validation';

@Component({
  selector: 'app-addFund',
  templateUrl: './payment.component.html',
  providers:[PaymentService]
})
export class PaymentComponent implements OnInit {
  public companies_id;
  public accounts_id;
  public toggle_class="";

  
  public dashboard_detail:any=Object;
  public transfer_detail:any=Object;

  graph_data: any;
  graph_option: any;
  
  public label=[];
  public graph_dat1=[];
  public graph_dat2=[];

  public upcoming_details=[];
  submitLoader="";
  type="all";
  filter:any[]=[];
  
  dashboardDataLoader="";

  public range_start ="";
  public range_end ="";

  public filter_date=1;

    constructor(private _httpService:PaymentService){
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.companies_id = currentUser && currentUser.company_details.companies_id;
        this.accounts_id  = currentUser && currentUser.account_details.accounts_id;

        this.filter.push({label:'This month', value:1});
        this.filter.push({label:'Last 3 months', value:2});
        this.filter.push({label:'Last 6 months', value:3});
        this.filter.push({label:'Last 12 monhts', value:4});
    }

    ngOnInit() {
        this.getDashboardData(this.filter_date);
        this.getUpcoming(this.type);
        
    }

    GetData(event){
        this.getDashboardData(event.value);
    }

    toggleTips(){
        if(this.toggle_class==""){
        this.toggle_class="showTips";
        }else{
        this.toggle_class="";      
        }
    }

    getDashboardData(filter_date){
        this.dashboardDataLoader="addLoader";
        let sp ="-";
        var date = new Date(), y = date.getFullYear(), m = date.getMonth();
    
        if(filter_date==1){
          var firstDay = new Date(y, m, 1);
          var lastDay = new Date(y, m + 1, 0);
          let last_date = lastDay.getDate();
          m=m+1; //january start with 0
          this.range_start =y+sp+m+sp+1;
          this.range_end =y+sp+m+sp+last_date;
        }else if(filter_date==2){
          var firstDay = new Date(y, m, 1);
          var lastDay = new Date(y, m -2, 0);
          let last_date = lastDay.getDate();
          m =m-2;
          this.range_start =y+sp+m+sp+1;
          this.range_end =y+sp+m+sp+last_date;
        }else if(filter_date==3){
          var firstDay = new Date(y, m, 1);
          var lastDay = new Date(y, m -5, 0);
          let last_date = lastDay.getDate();
          m =m-5;
          this.range_start =y+sp+m+sp+1;
          this.range_end =y+sp+m+sp+last_date;
        }else if(filter_date==4){
          var firstDay = new Date(y, m, 1);
          var lastDay = new Date(y-1, m +1, 0);
          let last_date = lastDay.getDate();
          m=m+1;
          y =y-1;
          this.range_start =y+sp+m+sp+1;
          this.range_end =y+sp+m+sp+last_date;
        }
        this._httpService.getDashboardData(this.range_start,this.range_end)
            .subscribe((result) => {
            this.dashboard_detail=result.data;
            this.transfer_detail=result.data.transfer_data.data; 
            
            if(result.data.graph_data.data){
              
                for(let item of result.data.graph_data.data) {
                    this.label.push(item.month);
                    this.graph_dat1.push(item.total_amount_raised);
                    this.graph_dat2.push(item.transfer_completed);
                }
    
                
                this.graph_data = {
                    xLabels: this.label,
                    //xLabels: ["Feb", "Mar", "Apr", "May", "Jun", "Jul"],                            
                    datasets: [
                        {
                            label: 'Invoices',
                            backgroundColor: '#4a90e2',
                            borderColor: '#4a90e2',
                            data: this.graph_dat1
                            //data: [0,40,30,50,40,60]
                        },
                        {
                            label: 'Transfer',
                            backgroundColor: '#ea6d78',
                            borderColor: '#ea6d78',
                            data: this.graph_dat2
                            //data: [60,40,50,30,40,30]
                            
                        }
                    ]
                }
                this.graph_option = {
                  scales: {
                    xAxes: [{
                      categoryPercentage: 0.3,
                      barPercentage: 0.8                             
                    }],
                    yAxes: [{
                      //type: 'category',
                      position: 'left',
                      ticks: {
                                beginAtZero:true,
                                userCallback: function(tick) {
                                    return "₹ " + Math.round(tick.toString()) + " k";
                                    
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
          },
        (err: any) => {
          this.dashboardDataLoader="";
          if(err.status==0){console.log('please check your internet connection');}},
          ()=>console.log());
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
          },
            (err: any) => {
          this.submitLoader='';    
                if(err.status==0){console.log('please check your internet connection');}},
            ()=>console.log());
    }
}
