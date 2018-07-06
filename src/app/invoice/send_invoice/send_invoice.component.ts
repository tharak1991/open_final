import { Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { InvoiceService } from '../../service/invoice.service';
import { Router, ActivatedRoute, Params  } from '@angular/router';
import { CustomValidators } from 'ng2-validation';
//import { PaymentService } from './../../service/payment.service';
import {DomSanitizer,SafeResourceUrl} from '@angular/platform-browser'
import { SettingService } from './../../service/settings.service'
declare let mixpanel: any;
declare let Intercom: any;

@Component({
  selector: 'app-send_invoice',
  templateUrl: './send_invoice.component.html',
  providers:[InvoiceService,SettingService],

})
export class SendInvoiceComponent implements OnInit {
    public companies_id;
    public accounts_id;
    public toggle_class="";
    public invoice_id;
    public sub: any;
    public currentUser: any;
    public account_detail: any;

    public data:any={};
    public contact:any={};
    public billing_address:any={};
    public shipping_address:any={};
    public invoice_item:any[]=[];
    public gstin:string;

    file: any[]=[];
    file_arr: any[]=[];
    
    public invoice_pdf:any='';
    public pdf_url;
    

    public invoiceSendLoader="";
    public image_loader="";
    public pageLoader = "addLoader";

    loader_status=false;
    http_message="";

    urlCache = new Map<string, SafeResourceUrl>();
    url  ;
    

    constructor(public sanitizer: DomSanitizer, private _httpService:InvoiceService,private _router: ActivatedRoute,private router:Router,private _httpServiceSetting: SettingService){
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.companies_id = currentUser && currentUser.company_details.companies_id;
        this.accounts_id  = currentUser && currentUser.account_details.accounts_id;
        this.gstin = currentUser && currentUser.company_details.company_gstin;
    }


    ngOnInit() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.getInvoiceDetail();
        this.checkGSTUser();
        
    }

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
			this.router.navigate(['/logout']); 
		}
        this.warning_message = JSON.parse(err._body).message;
		
	}

	hideWarning() {
		this.hideWarningClass = "clickHide";
	}

    sendInvoiceForm= new FormGroup({
        login:new FormControl('',[Validators.required]),
        email_subject: new FormControl('',Validators.required),
		email_body: new FormControl('',Validators.required),
    });

    valid_email=true;
    check_email(event){
        let regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        var emails = event.target.value.split(/[ ,]+/);
        for (var i = 0; i < emails.length; i++) {
             if( emails[i] == "" || ! regex.test(emails[i])){
                 this.valid_email=false;
                 return;
             }else{
                this.valid_email=true;
             }
        }
    }

    onSubmitSendInvoice(){
        let data =this.sendInvoiceForm.value;
        data.invoices_id=this.invoice_id;
        data.accounts_id=this.accounts_id;
        data.companies_id=this.companies_id;
        data.files_id=this.file;
		this.invoiceSendLoader="addLoader";
		
		if(this.sendInvoiceForm.valid){
            this._httpService.sendInvoice(data)
            .subscribe((result) => {
              if (result.status == 200) {
                this.invoiceSendLoader="";
                if(this.type==3){
                    mixpanel.track('recurring-invoice-schedule',data);
                    Intercom('trackEvent','recurring-invoice-schedule',data);
                }
                else{
                    mixpanel.track('one-time-invoice-send',data);
                    Intercom('trackEvent','one-time-invoice-send',data);
                }
                
                this.loader_status=true;
                if(this.type==3){
                    this.http_message="Invoice scheduled successfully";
                }else{
                    this.http_message="Invoice sent successfully";
                }
                setTimeout(() =>{
                    this.loader_status=false;
                    this.router.navigate(['/invoices']);
                
                },5000);


              }
              this.hideWarningClass = "clickHide";
			},(err:any)=>{
				this.errorHandle(err);
			}, () => console.log());
        } else {
			this.invoiceSendLoader="";
                Object.keys(this.sendInvoiceForm.controls).forEach(field => {
                const control = this.sendInvoiceForm.get(field);            
                control.markAsTouched({ onlySelf: true });       
            });
		}
    }

    getInvoiceDetail(){
        this.sub = this._router.params.forEach((params: Params) => {
            let id = params['id'];
            this.invoice_id = params['id'];
            this._httpService.getInvoiceById(id)
             .subscribe(
             (result) => {
                 if(result.status==200){
                    //console.log(result.data);
                    
                    this.getInvoicePdf();
                    this.check_reccuring(result.data);

                    this.data = result.data;
                    this.contact = result.data.contact.data;
                    this.billing_address = result.data.contact.data.billing_address.data;
                    this.shipping_address = result.data.contact.data.shipping_address.data;
                    this.invoice_item = result.data.invoice_item.data;

                    if(typeof result.data.document_proof_files.data.length !="undefined" && result.data.document_proof_files.data.length > 0){
						for(let document_proof of result.data.document_proof_files.data){
							if(typeof document_proof.files.data.length !="undefined" && document_proof.files.data.length > 0){
							this.file.push(document_proof.files.data[0].id);
							this.file_arr.push(document_proof.files.data[0]);
							}
						}
					}
                }
                this.hideWarningClass = "clickHide";
			},(err:any)=>{
				this.errorHandle(err);
			}, () => console.log()
             );

             
        });
    }

    //public profile_setting: any = [];
    public default_message_to_customer="";
    public default_subject="";
    public is_disabled=false;
    public type =1;
    
    
    check_reccuring(data){
        this.type=data.invoice_types_id;
        this._httpServiceSetting.getSettings()
        .subscribe((result) => {
            if (result.status == 200) {
                //this.profile_setting = result.data;
                if(this.type==3){
                    this.default_message_to_customer=result.data.recurring_default_message_to_customer;
                    this.default_subject=result.data.recurring_default_subject;
                    this.is_disabled=true;
                    this.sendInvoiceForm.controls['email_subject'].reset({ value: this.default_subject, disabled: true });
                    this.sendInvoiceForm.controls['email_body'].reset({ value: this.default_message_to_customer, disabled: true });
                    
                }else{
                    this.default_message_to_customer=result.data.default_message_to_customer;
                    this.default_subject=result.data.default_subject;
                    this.sendInvoiceForm.controls['email_subject'].reset({ value: this.default_subject });
                    this.sendInvoiceForm.controls['email_body'].reset({ value: this.default_message_to_customer});
                    this.sendInvoiceForm.controls.email_subject.setValue(this.default_subject);
                    this.sendInvoiceForm.controls.email_body.setValue(this.default_message_to_customer);
                    
                }        
    
            }
            this.hideWarningClass = "clickHide";
        },(err:any)=>{
            this.errorHandle(err);
        }, () => console.log());

    }

    getInvoicePdf(){
        this._httpService.getInvoicePdf(this.invoice_id)
        .subscribe(
        (result) => {
            if(result.status==200){
                this.invoice_pdf=result.file1;
                this.pageLoader="";
                this.url = this.sanitizer.bypassSecurityTrustResourceUrl(this.invoice_pdf);
                this.urlCache.set(this.invoice_id, this.url);
            }
            
            this.hideWarningClass = "clickHide";
        },(err:any)=>{
            this.pageLoader="";
            
            this.errorHandle(err);
        }, () => console.log()
        );
    }

    photoURL() {
        return this.sanitizer.bypassSecurityTrustUrl(this.invoice_pdf);
    }

    print_pdf(file){
        var w = window.open(file); //Required full file path.
        w.print();
    }


    toggleTips(){
        if(this.toggle_class==""){
        this.toggle_class="showTips";
        }else{
        this.toggle_class="";      
        }
    }

	checkGSTUser(){
		this._httpService.GetCompanyGSTIN().subscribe((result)=>{
			if(result.status==200){
				if(result.company_gstin!='' && result.company_gstin!=null){
					this.gstin ="1";
				}else{
					this.gstin ="0";
				}
			}
			this.hideWarningClass = "clickHide";
		},(err:any)=>{
			this.errorHandle(err);
		}, () => console.log())
	}

    onChangeOthers(fileInput: any) {
		if (fileInput.target.files && fileInput.target.files[0]) {
		    this.image_loader="addLoader";
        
            let imgSrc=fileInput.target.files[0];
			this._httpService.fileUploadOthers(imgSrc)
			  .subscribe((result) => {
				if (result.status == 200) {
				  this.file.push(result.data.id);
                  this.file_arr.push(result.data);
				}
                this.hideWarningClass = "clickHide";
			},(err:any)=>{
				this.errorHandle(err);
			}, () => console.log());
            this.image_loader="";
		}
    }
    
	delteOtherFiles(data) {
		if (data) {
		 	this.file.splice(this.file.indexOf(data), 1);
			this.file_arr.splice(this.file_arr.indexOf(data.id), 1);
			this._httpService.deleteFiles(data.id)
			.subscribe((result) => {
			  //console.log(result);
			  this.hideWarningClass = "clickHide";
			},(err:any)=>{
			  this.errorHandle(err);
			}, () => console.log());
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
