import { Component, OnInit, ViewChild, ElementRef, HostListener} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute, Params  } from '@angular/router';
import { AccountService } from './../service/account.service';
import { DatePipe } from '@angular/common';
declare let mixpanel: any;
declare let Intercom: any;

@Component({
  selector: 'app-accounting',
  templateUrl: './accounting.component.html',
  providers:[AccountService,DatePipe]
})
export class AccountingComponent implements OnInit {

  public companies_id;
  public accounts_id;
  public users_id;
  
  public toggle_class="";

  public data:any[]=[];
  public data_total:any={};
  public meta_detail:any={};
  account_detail:any=Object;

  public range_start ="";
  public range_end ="";

  loader_status=false;
  http_message="";
  failed_class="";

  filter_toggle="";

  public TableDataLoader = "";
  public today;
  public month_name:any =[];

  constructor(private datePipe :DatePipe,private _httpService:AccountService,private _router: ActivatedRoute,private router:Router){
      var currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.companies_id = currentUser && currentUser.company_details.companies_id;
      this.accounts_id  = currentUser && currentUser.account_details.accounts_id;
      this.users_id = currentUser && currentUser.data.data.users_id;
      

      let sp ="-";
      var date = new Date(), y = date.getFullYear(), m = date.getMonth();
      var firstDay = new Date(y, m, 1);
      var lastDay = new Date(y, m + 1, 0);
      let last_date = lastDay.getDate();
      m=m+1; //january start with 0

      this.range_start =y+sp+m+sp+1;
      this.range_start = this.range_start+' 00:00:00'

      this.range_end =y+sp+m+sp+last_date;
      this.range_end =this.range_end+' 11:59:59';

  }
  @ViewChild('closeCategoryForm') closeCategoryForm: ElementRef;
  public current_month:any;
  ngOnInit() {
      this.today= new Date();
      this.current_month = this.today.getMonth()+1;
      this.getBookKeeping();
      this.monthking();
  }

  monthking() {
    var theMonths = new Array('January', 'February', 'March', 'April', 'May',
    'June', 'July', 'August', 'September', 'October', 'November', 'December');
    var today = new Date();
    var y = today.getFullYear();
    var aMonth = today.getMonth() + 1;
    var cMonth = today.getMonth();
    var i;
    for (i=0; i<12; i++) {
        if(aMonth > cMonth) {
          var year = y-1;
        }else {
          var year = y;
        }
        this.month_name.push({'name':theMonths[aMonth],'id':aMonth+1, 'year': year});
        aMonth++;
        if (aMonth > 11) {
            aMonth = 0;
        }
    }
  }

  selectMonth(event) {
    // console.log(event.target.selectedOptions[0].id);
    let cur_month = event.target.value;
    var y = event.target.selectedOptions[0].id;
    let sp ="-";
    var date1 = new Date();
  //  y = date1.getFullYear();
    var firstDay1 = new Date(y, cur_month, 1);
    var lastDay1 = new Date(y, cur_month, 0);
    let last_date1 = lastDay1.getDate();

    this.range_start =y+sp+cur_month+sp+1;
    this.range_start = this.range_start+' 00:00:00'

    this.range_end =y+sp+cur_month+sp+last_date1;
    this.range_end =this.range_end+' 11:59:59';

    this.getBookKeeping();

  }

  filter_form = new FormGroup({
    category_name:new FormControl(''),
    start_date: new FormControl(''),
    end_date: new FormControl(''),
  });

  category_form = new FormGroup({
    category_name:new FormControl('',Validators.required),
  });

  getBookKeeping(){
    this.TableDataLoader = "addLoader";
    
    let data = {
      "start_date":this.range_start,
      "end_date":this.range_end,
      "limit":10
    };
    this._httpService.getBookKeeping(data)
    .subscribe(
    (result) => {
        if(result.status==200){
            this.TableDataLoader = "";
          
            this.data = result.data;
        }
        this.hideWarningClass = "clickHide";
      },(err:any)=>{
        this.TableDataLoader = "";
        this.errorHandle(err);
      }, () => console.log()
    );

    this.getIncomeExpenseTotal(data);
  }

  getIncomeExpenseTotal(data){
    this._httpService.getIncomeExpenseTotal(data)
    .subscribe(
    (result) => {
        if(result.status==200){
          this.data_total = result.data;
        }
        this.hideWarningClass = "clickHide";
      },(err:any)=>{
        this.errorHandle(err);
      }, () => console.log()
    );
  }

  public sumbit_type;
  submit_name(type){
    this.sumbit_type=type;
  }
  getBookKeepingByFilter(){
    this.TableDataLoader = "addLoader";
    
    if(this.filter_form.value.start_date!='' && this.filter_form.value.start_date!=null){
      this.range_start=this.datePipe.transform(this.filter_form.value.start_date, 'yyyy-MM-dd')+' 00:00:00';
    }

    if(this.filter_form.value.end_date!='' && this.filter_form.value.end_date!=null){
      this.range_end=this.datePipe.transform(this.filter_form.value.end_date, 'yyyy-MM-dd')+' 11:59:59';
    }

    let category_name ='';
    if(this.filter_form.value.category_name==''){
      category_name ='';
    }else if(this.filter_form.value.category_name!=''){
      category_name = this.filter_form.value.category_name;
    }
    if(typeof category_name =='undefined'){
      category_name = this.filter_form.value.category_name;
    }

    let data:any;
    if(this.sumbit_type!='1'){
      data = {

        "category_name":'',
        "start_date":this.range_start,
        "end_date":this.range_end,
        "limit":5
      };
    }else{
      data = {
        "start_date":this.range_start,
        "end_date":this.range_end,
        "category_name":category_name,
        "limit":5
      };
    }

    this._httpService.getBookKeepingByFilter(data)
    .subscribe(
    (result) => {
        if(result.status==200){
          this.TableDataLoader = "";
            if(result.data.length>0){
              this.crossButton = true;
            }else{
            this.crossButton = false;
            }
            this.data = result.data;

            mixpanel.track('bookkeeping-search-performed',data);
            Intercom('trackEvent','bookkeeping-search-performed',data);


        }
        this.hideWarningClass = "clickHide";
      },(err:any)=>{
        this.crossButton = false;
        this.TableDataLoader = "";
        
        this.errorHandle(err);
      }, () => console.log()
      );
    //console.log(data);
    this.prevent =true;
    this.getIncomeExpenseTotal(data);
  }

  public beneficiary_name_dwnl = "";
  public crossButton: boolean = false;

  setRecepientName(event) {
    this.beneficiary_name_dwnl = event.target.value;
  }

  refresh_local_variable_form() {
    this.filter_form.reset();
    this.filter_form.controls.category_name.setValue(this.beneficiary_name_dwnl);
  }

  refresh_local_variable(){
    this.crossButton = false;
    this.beneficiary_name_dwnl="";
    this.getBookKeeping();
  }


  public category_loader="";
  createCategory(){
    this.category_loader="addLoader";
    let data={
      "accounts_id":this.accounts_id,
      "companies_id":this.companies_id,
      "users_id": this.users_id,
      "category_name":this.category_form.value.category_name,
      "is_deleted":0
      }
      this._httpService.createCategory(data)
      .subscribe((result) => {
          this.category_loader="";
    
          if(result.status==200){
            this.loader_status=true;
            this.http_message="Category added successfully";
            setTimeout(() =>{
              this.loader_status=false;
            },5000);
            
            mixpanel.track(
              'bookkeeping-add-category-performed',result.data
            );
            Intercom('trackEvent','bookkeeping-add-category-performed', result.data);

          }else{
            this.loader_status=true;
            this.failed_class="toastFailed";
            this.http_message="Category not successfully";
            setTimeout(() =>{
              this.loader_status=false;
            },5000);

          }
          this.closeCategoryForm.nativeElement.click();
          this.hideWarningClass = "clickHide";
        },(err:any)=>{
          this.category_loader="";
          this.closeCategoryForm.nativeElement.click();
          
          this.errorHandle(err);
        }, () => console.log());
        this.category_form.reset();
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
    this.filter_toggle='';
  }

  filteredCategorySingle:any[] = [];
  
  searchCategory(event) {
      let query = event.query;
      this._httpService.getCategory(query).subscribe((result)=>{
      if(result.data.length>0){
        this.filteredCategorySingle = [];
        this.filteredCategorySingle= result.data;
      }
      this.hideWarningClass = "clickHide";
    },(err:any)=>{
      this.errorHandle(err);
    }, () => console.log());
  }

  download() {
    let data = {
      "start_date":this.range_start,
      "end_date":this.range_end,
      "limit":5
    };
    let url  = this._httpService.download(data);
      
    window.open(url, '_blank').focus();
    
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
  toggleTips(){
    if(this.toggle_class==""){
    this.toggle_class="showTips";
    }else{
    this.toggle_class="";      
    }
  }
  hrefClick(data){
    mixpanel.track(
      data,
      {"menu": "click"}
    );
    Intercom('trackEvent', data);
  }

  
}
