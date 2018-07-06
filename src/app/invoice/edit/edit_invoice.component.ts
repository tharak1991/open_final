import { Router, ActivatedRoute, Params  } from '@angular/router';
import { element } from 'protractor';
import { CurrencyPipe } from '@angular/common';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { data } from '.././../mock/country';
import { InvoiceService } from '../../service/invoice.service';

import { SelectItem } from 'primeng/primeng';

import { Store } from '../../model/store.model';
import { Customer } from '../../model/customer.model';
import { Category } from '../../model/category.model';

import { OneTimeInvoice, RecurrInvoice } from '../../model/invoice.model';
import { Item } from '../../model/item.model';
import { Terms } from '../../model/terms.model';

import { DatePipe } from '@angular/common';

import { Component, OnInit, ViewChild, ElementRef, ViewContainerRef, EventEmitter } from '@angular/core';
import { CustomValidators, CustomFormsModule } from 'ng2-validation';
import { isNumber } from 'util';

@Component({
  selector: 'app-edit_invoice',
  templateUrl: './edit_invoice.component.html',  
  providers:[InvoiceService,DatePipe],
  styles: [`
  .price::first-letter {
	padding-right: 0.3em;
  }`
  ],
  
})
export class InvoiceEditComponent implements OnInit {

	isClicked:boolean;
	state_list: any[] = [];
	customertypedefault: string = "Organization";
	my_state:String


	taxes:SelectItem[];
	selecetedTaxes:string[]=[];
	itemType: string;



	gst_perc: number;
	file: any[]=[];
	file_arr: any[]=[];
	
	overridevalue: boolean=false;
	
	paymentterms:SelectItem[];
	selectedTerm: string;
	frequnecy:SelectItem[];
	selectedFrequency:string;
	
	sub_total:number=0;
	gst_total=0;
	total=0;
	addtionalcharges=0;
	Adjustments_charges=0;
	public totalgstamount = 0;
	public amountdue = 0;
	store: Store;
	public token: string;
	// public isValid:boolean;

	public companies_id:string;
	public accounts_id: string;
	public users_id: string;
	public invoice_id: string;
	public gstin:string;
	public toggle_class = "";
	public discount_amount:number = 0;
	public discount_perc:number = 0;
	public tags:any[]=[];
	public notes:string;
	public companytax:any[];
	units:SelectItem[];

	clear_tax =0;

	@ViewChild('gstinModal')gstinModal: ElementRef;
	@ViewChild('addCustomer') addCustomer: ElementRef;
	@ViewChild('updateCustomer') updateCustomer: ElementRef;
	@ViewChild('add_charge') add_charge: ElementRef;
	@ViewChild('Adjustments') Adjustments: ElementRef;
	@ViewChild ('taxname') taxname:ElementRef;
	@ViewChild('taxperc') taxperc:ElementRef;
	@ViewChild('invoice_form') invoice_form;
	@ViewChild('closeContactForm') closeContactForm;
	@ViewChild('closeUpdateContactForm') closeUpdateContactForm;
	@ViewChild('closeAddItem') closeAddItem;
	@ViewChild('openNewItemModel') openNewItemModel;
	@ViewChild('openHSNModel') openHSNModel;
	@ViewChild('openSACModel') openSACModel;
	@ViewChild('searchHsn') searchHsn;
	@ViewChild('searchSac') searchSac;
	@ViewChild('closeAddNewItemModel') closeAddNewItemModel;
	@ViewChild('closeSacModel') closeSacModel;
	@ViewChild('closeHsnModel') closeHsnModel;
	@ViewChild('openAddItemModel') openAddItemModel;
	@ViewChild('closeTagNotesModel') closeTagNotesModel;
	
	public contactFormLoader ="";
	public itemFormLoader="";
	public taxFormLoder="";
	public invoiceFormLoader="";


	items: Item[];
	gstrates: SelectItem[];

	public sub: any;

	submit:boolean=false;
	
	constructor(private datePipe :DatePipe,private _httpService:InvoiceService,private router:Router,private _router: ActivatedRoute) 
	{
		var currentUser = JSON.parse(localStorage.getItem('currentUser'));
		this.token = currentUser && currentUser.token;
		this.companies_id = currentUser && currentUser.company_details.companies_id;
		this.accounts_id  = currentUser && currentUser.account_details.accounts_id;
		this.users_id = currentUser && currentUser.data.data.users_id;
		this.gstin = currentUser && currentUser.company_details.company_gstin;

	}

	ngOnInit() {
		this.store = new Store();
		this.getInvoiceDetail();
		this.checkGSTUser();
		//this.getCompanyTaxList();

		this.getUnit();
		this.getGst();
		this.getPaymentTermList();
		this.getFrequencyList();

		this.getState();

		this.CompanyTaxes();
	}

	public hideWarningClassGST = "";
	hideWarningGst() {
		this.hideWarningClassGST = "clickHide";
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

	getInvoiceDetail(){
		this.invoiceFormLoader="addLoader";
		this.sub = this._router.params.forEach((params: Params) => {
            this.invoice_id = params['id'];
            this._httpService.getInvoiceById(this.invoice_id )
             .subscribe(
             (result) => {
				if(result.status==200)
				{
					// console.log(result.data);
					this.getInvoicePdf();

					if(result.data.invoice_types_id!=''){
						this.store.type=result.data.invoice_types_id;
					}
	
					let cus_data =result.data.contact.data
					this.store.to = new Customer(cus_data.id, cus_data.name, cus_data.type_of_contact, cus_data.email_id, cus_data.mobile_number || cus_data.landline_number, cus_data.pan, cus_data.tds, cus_data.gstin,cus_data.billing_address.data,cus_data.shipping_address.data,cus_data.primary_contact);
					
					this.invoice_form.controls['customername'].patchValue(cus_data);
					
					if(result.data.income_categories != undefined && result.data.income_categories.data != undefined)
					{
						let cate_data =result.data.income_categories.data;
						this.store.category = new Category(cate_data.id,cate_data.category_name);
						this.invoice_form.controls['category'].patchValue(cate_data);
					}
					
					
					if(this.store.type=='1'){
						this.store.invoice = new OneTimeInvoice(result.data.invoice_sequence_id, "","", "", "","",this.store.invoice.is_override);
		
						this.invoice_form.controls['invoicedate'].patchValue(result.data.start_date);
						this.invoice_form.controls['duedate'].patchValue(result.data.due_date);
					}else if(this.store.type=='3'){
						this.store.invoice = new RecurrInvoice(result.data.invoice_sequence_id, result.data.start_date, 
							result.data.start_date, result.data.frequency.data.frequencies_id, 
							result.data.repeat_for, "","",this.store.invoice.is_override);
						
					}

					
					if(result.data.invoice_user_input_reference_id!=null){
						this.invoice_form.controls['refrenceid'].patchValue(result.data.invoice_user_input_reference_id);
						
					}

					this.addtionalcharges = result.data.additional_charge;
					this.Adjustments_charges = result.data.adjustment_value;
					for(let event of result.data.invoice_item.data){
						let type='';
						if(event.item.data.hsn_sac_type!=null){
							type=event.item.data.hsn_sac_type;
						}else{
							type=event.item.data.custom_item_type;
						}

						var gst_perc=0.00;
						if(event.sgst_perc!='0.00' && event.cgst_perc!='0.00'){
							gst_perc=(+event.sgst_perc)+(+event.cgst_perc);
						}
						if(event.igst_perc!='0.00'){
							gst_perc=(+event.igst_perc);
						}

						let discount_perc:any=0;
						if(event.discount_percentage!='0' && event.discount_percentage!=null && event.discount_percentage!>='100'){
							// discount_perc=(+event.discount_amount *100)/(+event.rate_per_unit);
							discount_perc=event.discount_percentage;
						}

						let units = '';
						if(event.units != null) {
							units = event.units;
						}
						
						this.store.items.push(new Item(event.items_id,
							event.item.data.item_name, 
							event.item.data.item_code,
							event.item.data.hsn_sac_code,
							type,
							event.quantity, 
							event.item.data.description, 
							units, 
							discount_perc, 
							event.discount_amount,
							event.rate_per_unit, 
							gst_perc, 
							event.InvoiceItemTaxes.data,
							0,event.item.data.is_service,false));
					}
						
					this.store.terms.value=result.data.payments_terms_id;
	
					this.notes=result.data.invoice_note;
	
					// if(typeof result.data.invoice_tags.data.length !="undefined" && result.data.invoice_tags.data.length > 0){
					// 	for(let tegss of result.data.invoice_tags.data){
					// 		if(tegss.tags!=null){
					// 			this.tags.push(tegss.tags.data.tag_name);
					// 		}
					// 	}
					// }

					if(typeof result.data.document_proof_files.data.length !="undefined" && result.data.document_proof_files.data.length > 0){
						for(let document_proof of result.data.document_proof_files.data){
							if(typeof document_proof.files.data.length !="undefined" && document_proof.files.data.length > 0){
							this.file.push(document_proof.files.data[0].id);
							this.file_arr.push(document_proof.files.data[0]);
							}
						}
					}

					if(typeof result.data.invoice_taxes.data.length !="undefined" && result.data.invoice_taxes.data.length > 0){
						for(let tax of result.data.invoice_taxes.data){
							if(tax.company_taxes_id!=null){
								this.selectedTax.push({
									"company_taxes_id":tax.company_taxes_id,
									"tax_name":tax.company_tax.data[0].tax_name,
									"tax_desc":null,
									"tax_perc":tax.tax_perc,
									"taxamount":tax.tax_value,
									"is_select":'1'
								});
							}
						}
						setTimeout(() =>{
							this.getCompanyTaxList();
						},1000);
					}
	
					
					setTimeout(() =>{
						this.calculateTotal();
						this.submit=true;
					},2000);
					//this.calculateTotal();

				 }else{
					 this.router.navigate(['/invoices']);
				 }

				this.invoiceFormLoader="";
				//this.getAllItem();
		
				this.hideWarningClass = "clickHide";
			},(err:any)=>{
				this.errorHandle(err);
			}, () => console.log()
             );
		});
	}

	checkGSTUser(){
		this._httpService.GetCompanyGSTIN().subscribe((result)=>{
			if(result.status==200){
				if(result.company_gstin!='' && result.company_gstin!=null){
					this.gstin ="1";//need to change
				}else{
					this.gstin ="0";
				}
			}
			this.hideWarningClass = "clickHide";
		},(err:any)=>{
			this.errorHandle(err);
		}, () => console.log())
	}

	invoiceChanged() {
		if (!this.store.invoice) {
			if (this.store.type == "1") {
				//this.generateSequnceID();
			this.store.invoice = new OneTimeInvoice(this.invoice_id, "","", "", "","",this.store.invoice.is_override);
			} 
			else if (this.store.type == "3") {
			//	this.generateSequnceID();
				this.store.invoice = new RecurrInvoice(this.invoice_id, "", "", "", "", "","",this.store.invoice.is_override);
			} else {
				window.alert("Please Refresh the page");
			}
		}
	}

	filteredCustomerSingle:any = [];


	search(event){
		let query = event.query;
		this._httpService.getCustomers(query).subscribe((result)=>{
			if(result.data.length>0){
			//this.filteredCustomerSingle.push({'name':'+ Add new contact','id':'new','query':'','class':'new','email_id':''});
			this.filteredCustomerSingle= result.data;

			this.filteredCustomerSingle.splice(0,0,{'name':'+ Add new contact','id':'new','query':'','class':'new','email_id':''});
			
			} else{
			this.filteredCustomerSingle = [{'name':'+ Add '+query,'id':'new','query':query,'class':'new','email_id':''}];
			}
			this.hideWarningClass = "clickHide";
		},(err:any)=>{
			this.errorHandle(err);
		}, () => console.log())

		this.store.to = new Customer('','', '','','', '','', '',{},{},'');
		//this.invoice_form.controls['customername'].patchValue({});
		
		this.calculateTotal();
	}

	getCustomerDetail(event){
	    if(event.id=='new'){
			this.addCustomer.nativeElement.click();
			this.invoice_form.controls['customername'].patchValue({});
			this.addCustomerForm.reset();
			this.addCustomerForm.controls.type_of_contact.setValue('Organization');
			this.addCustomerForm.controls.is_same.setValue(true);
			this.addCustomerForm.patchValue({ name: event.query });
		
	    } else {
		   if(event.email_id == null || event.email_id==''){
				let billing_address ={};
				let shipping_address ={};
				
				if(event.hasOwnProperty('billing_address')){
					billing_address =event.billing_address.data
				}
				if(event.hasOwnProperty('shipping_address')){
					shipping_address =event.shipping_address.data
				}
				this.store.to = new Customer(event.id, event.name, event.type_of_contact, event.email_id, event.mobile_number || event.landline_number, event.pan, event.tds, event.gstin,billing_address,shipping_address,event.primary_contact);
			
				this.updatecontact();
		   }else{
			this.store.to = new Customer(event.id, event.name, event.type_of_contact, event.email_id, event.mobile_number || event.landline_number, event.pan, event.tds, event.gstin,event.billing_address.data,event.shipping_address.data,event.primary_contact);
			this.calculateTotal();
		   }
		   this.getTaxType(event.id);
		}
		
	}
   
	updatecontact(){
		this.updateCustomer.nativeElement.click();
	}
  	filteredCategorySingle:any[] = [];

	searchCategory(event) {
		this.invoice_form.controls['category_id'].patchValue('');			
		let query = event.query;
		this._httpService.getIncomeCategory(query).subscribe((result)=>{
		if(result.data.length>0){
			this.filteredCategorySingle=[];
			this.filteredCategorySingle= result.data;

			let query_exist = false;
			for(let cate of result.data){
				if(cate.category_name == query){
					query_exist = true;
					//this.filteredCategorySingle.push({'category_name':'+ Add new category'});
					return;
				}
			}
			if(query.length>0 && !query_exist){
				this.filteredCategorySingle.push({'category_name':'+ Add '+query});
			}else if(query_exist){
				//this.filteredCategorySingle.push({'category_name':'+ Add new category'});
			}
		} else{
			if(query.length>0){
				this.filteredCategorySingle=[];
				this.filteredCategorySingle.push({'category_name':'+ Add '+query});
			}
		}
		this.hideWarningClass = "clickHide";
		},(err:any)=>{
			this.errorHandle(err);
		}, () => console.log());

		//console.log(this.filteredCategorySingle);
		
	}

  	filteredItemSingle:any = [];

	searchItem(event){
		let query = event.query;
		this._httpService.getAllItem(query).subscribe((result)=>{
			if(result.data.length>0){
				this.filteredItemSingle = result.data;

				let query_exist = false;
				for(let item of result.data){
					if(item.item_name == query){
						query_exist = true;
						return;
					}
				}

				if(result.data.length>0 && !query_exist){
					this.filteredItemSingle.splice(0,0,{'id':'new','item_name':'+ Add '+query,'query':query,'class':'new'});
				} else{
					this.filteredItemSingle = [{'id':'new','item_name':'+ Add '+query,'query':query,'class':'new'}];
				}

			}else{
				let itt= {
					"item_name":'+ add '+query,
					"id":"new",
					"query":query,
					'class':'new'
				}
				this.filteredItemSingle = [itt];				
			}
			this.hideWarningClass = "clickHide";
		},(err:any)=>{
			this.errorHandle(err);
		}, () => console.log())
	}

	getCategoryDetail(event){
		let substring = '+ Add '
		let query: string = event.category_name;
		if(query.includes(substring))
		{
			query=query.slice(6);
			let data={
			"accounts_id":this.accounts_id,
			"companies_id":this.companies_id,
			"users_id": this.users_id,
			"category_name":query,
			"is_deleted":0
			}

			this.invoice_form.controls['category'].patchValue(data);

			this._httpService.createIncomeCategory(data)
			.subscribe((result) => {
			this.filteredCategorySingle = [{'category_name': query}];
			this.store.category = new Category(result.data.id,query);

			//this.invoice_form.patchValue({ 'category':data });
			this.invoice_form.controls['category'].patchValue(result.data);
			this.invoice_form.controls['category_id'].patchValue(result.data.id);
			this.hideWarningClass = "clickHide";
			},(err:any)=>{
				this.errorHandle(err);
			}, () => console.log());
		}else{
			this.invoice_form.controls['category_id'].patchValue(event.id);			
		}
	}

	// THIS FUNCTION IS DIFFERENT IN INVOICES
	updateStoreItems(evt,item,i) {
		if (evt) {
			item.qty = "1";
			this.store.items.push(item);
		} else {
			var index = this.store.items.findIndex(function(o){
			return o.id === item.id;
			})
			if (index !== -1) { this.store.items.splice(index, 1) };
		}
		this.calculateTotal();
	}

	trackByFn(index, item) {
		return index; // or item.id
	}

	removeItem(item,i) {
		this.store.items.splice(this.store.items.indexOf(item), 1);
		this.calculateTotal();
	}
  
	addItemDetail(event){
		if(event.id=='new'){
		  this.openNewItem();
		  if(this.gstin=='1'){
			  this.itemForm.reset();
			  this.itemForm.patchValue({ name: event.query });
			  this.itemForm.controls.type.setValue('0');
		  }else{
			  this.itemFormNonGst.reset();
			  this.itemFormNonGst.patchValue({ item_name: event.query });
		  }

		}
		else{
		let type='';
		if(event.hsn_sac_type!=null){
		  type=event.hsn_sac_type;
		}else{
		  type=event.custom_item_type;
		}
	  this.store.items.push(new Item(event.id,
		  event.item_name, 
		  event.item_code,
		  event.hsn_sac_code,
		  type,
		  '1', 
		  event.description, 
		  event.units, 
		  '0', 
		  '0', 
		  event.price, 
		  event.gst_perc, 
		  event.company_tax,
		  0,event.is_service,false));  

		  this.calculateTotal();
	  }
	  this.invoice_form.controls['item_search'].patchValue({});
  	}

	item_search :any;
	
	getAllItem(){
		let  query='';
		this._httpService.getAllItem(query).
		subscribe((result)=>{
			//console.log(result.data);
			this.items=[];
			
			let data:any[]= result.data;
			data.forEach(element => {
				let addtex=[];
				element.company_tax.data.forEach(t1 => {

					addtex.push(
						{
						"company_taxes_id":t1.company_taxes_id,
						"tax_perc":t1.company_taxes_id,
						"tax_value":t1.company_taxes_id
						}
					);
				});

				let type;
				if(element.hsn_sac_type!=null){
				  type=element.hsn_sac_type;
				}else{
				  type=element.custom_item_type;
				}

				let is_selected = false;
				if(this.store.items.length > 0){
					for(let check_item of this.store.items){
						if(check_item.id==element.id){
							is_selected=true;
						}
					}
				}

				let subtotal=0;
				subtotal = Number(+element.price);
				if (this.items) {
					this.items.push(new Item(element.id,element.item_name,element.item_code,element.hsn_sac_code,type,'1',element.description, "","0","0",element.price,element.gst_perc,addtex,subtotal,element.is_service,is_selected));
				} else {
					this.items = [
					new Item(element.id,element.item_name,element.item_code,element.hsn_sac_code,type,'1',element.description, "" ,"0","0",element.price,element.gst_perc,addtex,subtotal,element.is_service,is_selected)
					];
				}
			});
		});
	}

	updateItemList(evt: any): void {
		let total = 0;
		if (this.items) {
		this.items.push(new Item(evt.id,evt.name,'', evt.code,evt.type, evt.qty, evt.desc, evt.unit, evt.dsc, evt.dsc_amount, evt.rate, evt.gst, evt.company_tax,total,evt.is_service,false));
		} else {
		this.items = [new Item(evt.id,evt.name, '',evt.code,evt.type, evt.qty, evt.desc, evt.unit, evt.dsc, evt.dsc_amount, evt.rate, evt.gst, evt.company_tax,total,evt.is_service,false)];
		}
	}

	getTaxType(contacts_id){
		this._httpService.getTaxType(contacts_id).subscribe((result)=>{
			if(result.data.tax_type.indexOf('igst')==0){
				this.my_state='igst';
			}else{
				this.my_state='cgst';
			}
		   this.hideWarningClass = "clickHide";
		},(err:any)=>{
			this.errorHandle(err);
		}, () => console.log());
	}


    getCompanyTaxList(){
		this.companytax =[];
		this._httpService.getCompanyTaxes()
		.subscribe((result)=>{
		        result.data.forEach(element => {
				let is_select = '';
					for(let sel_tax of this.selectedTax){
						if(sel_tax.company_taxes_id==element.company_taxes_id){
							is_select='1';
						}
					}
					element['is_select']= is_select;	
					this.companytax.push(element);
					
				});
		   this.hideWarningClass = "clickHide";
		},(err:any)=>{
			this.errorHandle(err);
		}, () => console.log());
	}

	addTax(){
		this.taxFormLoder="addLoader";
		var tax_name = this.taxname.nativeElement.value;
		var tax_perc = this.taxperc.nativeElement.value;
		if(tax_name && tax_perc){
			
			let data = {
			"accounts_id":this.accounts_id,
			"companies_id":this.companies_id,
			"tax_name":tax_name,
			"tax_desc":"",
			"tax_perc":tax_perc,
			"is_active":1
			}
			this._httpService.addCompanyTax(data)
			.subscribe((result)=>{
				this.taxFormLoder="";
		
				this.companytax.push(result.data);
				this.hideWarningClass = "clickHide";
			},(err:any)=>{
				this.errorHandle(err);
			}, () => console.log());
			this.taxname.nativeElement.value = '';
			this.taxperc.nativeElement.value = '';
			this.clear_tax =0;
		}else{
			this.taxFormLoder="";
			this.clear_tax =0;
		}
	}

	updateTax(data,event){
		if(data.tax_perc != event.target.value && ((event.keyCode >= 48 && event.keyCode <= 57) || (event.keyCode >= 96 && event.keyCode <= 105))){
			//this.taxFormLoder="addLoader";
			let data1 = {
				"accounts_id":this.accounts_id,
				"companies_id":this.companies_id,
				"tax_name":data.tax_name,
				"tax_desc":"",
				"tax_perc":event.target.value,
				"is_active":1
				}

				this.selectedTax.splice(this.selectedTax.indexOf(data),1);

				let index = this.companytax.indexOf(data);
				this.companytax[index].tax_perc=event.target.value;
				this.selectedTax.push(this.companytax[index]);

				setTimeout(() =>{
					this.calculateTotal();
				},1000);

				this._httpService.updateCompanyTax(data1,data.company_taxes_id)
				.subscribe((result)=>{
					this.taxFormLoder="";
					this.hideWarningClass = "clickHide";
				},(err:any)=>{
					this.errorHandle(err);
				}, () => console.log());
				
		}
		//this.selectedTax=[];

	}

	removeNonGsrtTax(tax){
		this.selectedTax.splice(this.selectedTax.indexOf(tax),1);
		this.getCompanyTaxList();
		this.calculateTotal();
	}

	selectedTax:any[]=[];
	selectedtax(tax,event){
		if(event){
			this.selectedTax.push(tax);
		} else {
			let index = this.selectedTax.findIndex(i => i.company_taxes_id === tax.company_taxes_id);
		
		    //this.selectedTax.splice(this.selectedTax.indexOf(tax),1);
		    this.selectedTax.splice(index,1);
		   
		}	
	}

	updateQuantity(item,event,i){
		if(event.target.value!='' || event.target.value!=null){
			this.store.items[i].qty=event.target.value;
			this.calculateTotal();
		}
	}

	updateTotal(){
		this.calculateTotal();
	}
 
	calculateTotal(){
		this.sub_total = 0;
		this.gst_total=0;
		this.total=0;
		var add_charges:number=0;
		var Adjustments:number=0;

		add_charges= this.addtionalcharges;
		Adjustments= this.Adjustments_charges;
		
		if(this.gstin=='1'){
			this.discount_amount = 0;
			this.discount_perc = 0;
			
			for(let item of this.store.items) {
				let disc_amount =((+item.rate* +item.qty)*(+item.dsc))/100;
				let total1 = (+item.rate* +item.qty)-(disc_amount);
				let gst_amount = ((+item.rate*+item.qty)-(disc_amount))*+item.gst/100;
				this.sub_total =this.sub_total+total1;
				this.gst_total =this.gst_total+gst_amount;
				let index =this.store.items.indexOf(item);
				item.subtotal=total1;
				item.dsc_amount=disc_amount.toFixed(2);
				this.store.items[index]=item;

				this.discount_perc = (this.discount_perc) + (+item.dsc);
				this.discount_amount = (this.discount_amount) + (+disc_amount);				
			}
			if(add_charges!=0 || add_charges!=null){
				this.total=this.sub_total+this.gst_total+(+add_charges);
				// this.discount_perc = (this.discount_amount/this.sub_total)*100;
				this.gst_perc = (this.gst_total/this.total)*100
			}else{
				this.total=this.sub_total+this.gst_total;
				// this.discount_perc = (this.discount_amount/this.sub_total)*100;
				this.gst_perc = (this.gst_total/this.total)*100
			}
		}else{
			this.discount_amount = 0;
			this.discount_perc = 0;
			
			for(let item of this.store.items) {
				let disc_amount =((+item.rate* +item.qty)*(+item.dsc))/100;
				let total1 = (+item.rate* +item.qty)-(disc_amount);
				let gst_amount = 0;
				this.sub_total =this.sub_total+total1;
				this.gst_total =this.gst_total+gst_amount;
				let index =this.store.items.indexOf(item);
				item.subtotal=total1;
				item.dsc_amount=disc_amount.toFixed(2);
				this.store.items[index]=item;

				this.discount_perc = (this.discount_perc) + (+item.dsc);
				this.discount_amount = (this.discount_amount) + (+disc_amount);
				
			}
			if(add_charges!=0 || add_charges!=null){
				this.total=this.sub_total+this.gst_total+(+add_charges);
			}else{
				this.total=this.sub_total+this.gst_total;
			}
             let addtionaltax = 0;
			if(this.selectedTax.length>0){
				this.selectedTax.forEach(element => {
					let taxamount = (this.total*(+element.tax_perc)/100);
					let index = this.selectedTax.indexOf(element);
					element.taxamount = taxamount;
					this.selectedTax[index] = element;
				 addtionaltax = addtionaltax+(+element.tax_perc);
				});
				 let addtionaltaxamount=(this.total*addtionaltax/100);
				 this.total=this.total+addtionaltaxamount;
			}
		}

		if(Adjustments!=0 || Adjustments!=null){
			this.total=this.total+(+Adjustments);
		}

		setTimeout(() =>{
			this.check_adj();
		},2000);
	}

	public image_loader="";
	onChangeOthers(fileInput: any) {
		if (fileInput.target.files && fileInput.target.files[0]) {
		this.image_loader="addLoader";
		  for (let imgSrc of fileInput.target.files) {
			this._httpService.fileUploadOthers(imgSrc)
			  .subscribe((result) => {
				if (result.status == 200) {
					this.file.push(result.data.id);
					this.file_arr.push(result.data);
		  			this.image_loader="";
		  
				}
				this.hideWarningClass = "clickHide";
				
			  },(err:any)=>{
		  		this.image_loader="";
		  
				this.errorHandle(err);
			}, () => console.log());
		  }
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

	addNotesForm= new FormGroup({
		tags: new FormControl(''),
		notes: new FormControl('')
	});

	addNotesandTags(){
		this.addNotesForm.value.tags.forEach(element => {
			this.tags.push(element);
		});
		this.notes= this.addNotesForm.value.notes;
		this.closeTagNotesModel.nativeElement.click();
	}

	updateItem(item,event,field){
		let data;
		if(field==1){
			data = {
				"item_name":event.target.value
			}
		}else if(field==2){
			data = {
				"hsn_sac_type":event.target.value
			}
		}else if(field==3){
			data = {
				"price":event.target.value
			}
		}else if(field==4){
			data = {
				"gst_perc":event.value
			}
		}
		
		this._httpService.updateItem(item.id,data).subscribe((result)=>{
			if(result){
				if(result.status==200){
					//console.log(result);
					// this.hideWarningClass = "clickHide";
					// this.successLoader('Contact updated successfully.');
			
				}
			}
			}
		);
	}

	check_category(){
		if(this.store.category.id==''){
			this.invoice_form.controls['category'].patchValue('');	
			this.invoice_form.controls['category_id'].patchValue('');			
		}
	}

	change_payment_term(event){
		this.payment_error='';

		var today = new Date();
		let nextweek;
		if(event.value==1){
			nextweek = new Date(today.getFullYear(), today.getMonth(), today.getDate()+7);
		}else if(event.value==2){
			nextweek = new Date(today.getFullYear(), today.getMonth(), today.getDate()+15);
		}else if(event.value==3){
			nextweek = new Date(today.getFullYear(), today.getMonth(), today.getDate()+30);
		}else if(event.value==4){
			nextweek = new Date(today.getFullYear(), today.getMonth(), today.getDate()+45);
		}else if(event.value==5){
			nextweek = new Date(today.getFullYear(), today.getMonth(), today.getDate()+60);
		}else if(event.value==6){
			nextweek = new Date(today.getFullYear(), today.getMonth(), today.getDate()+90);
		}else if(event.value==7){
			nextweek = new Date(today.getFullYear(), today.getMonth(), today.getDate());
		}

		this.invoice_form.controls['duedate'].patchValue(nextweek);
	}
	payment_error:string='';
	public taxess =[];
	onSubmitUpdateInvoice(data){
		if(this.total < 0) {
			window.scrollTo(0, 0);
			return true; 
		}
		window.scrollTo(0, 0);
		this.invoiceFormLoader="addLoader";
		
		if(this.invoice_form.valid && this.store.items.length!=0){
			let itemdata:any[]=[];
			
			this.store.items.forEach(element => {

				let sgst_amount= '0';
				let cgst_amount = '0';
				let igst_amount = '0';

				let sgst_perc= 0;
				let cgst_perc = 0;
				let igst_perc = 0;


				if(this.gstin=='1'){
					if(element.gst !== 0 && element.gst !== null && this.store.to){
						let all_amount = (element.subtotal*(element.gst/2))/100
						if(this.my_state!='igst'){
							sgst_perc = element.gst/2;
							cgst_perc = element.gst/2;
							sgst_amount= all_amount.toFixed(2);
							cgst_amount = all_amount.toFixed(2);
						}else{
							// cgst_perc = element.gst/2;
							igst_perc = element.gst;
							// cgst_amount = all_amount;
							igst_amount = ((element.subtotal*(element.gst))/100).toFixed(2);
						}
					}
				}

				let obj ={
					"items_id":element.id,
					"quantity":element.qty,
					"sgst_amount":sgst_amount,
					"cgst_amount":cgst_amount,
					"igst_amount":igst_amount,
					"sgst_perc":sgst_perc,
					"cgst_perc":cgst_perc,
					"igst_perc":igst_perc,
					"discount_amount":element.dsc_amount,
					"rate_per_unit":element.rate,
					"discount_percentage":element.dsc,
					"units":element.unit,
					"net_amount":element.subtotal,
					"additional_taxes":element.addTax
				}
				itemdata.push(obj);		
			});
			let gst_value=this.gst_total
			let udata ={}
			let override_status=0;
			
			//user is gst complaint
			if(this.gstin=="1"){
				//one time invoice
				if(this.store.type=='1'){
					if(data.override){
						override_status=1;
					}
					udata = {
						"invoice_types_id":1,
						"is_override":override_status,
						"invoice_sequence_id":this.store.invoice.id,
						"income_categories_id":data.category.id,
						"invoice_user_input_reference_id":data.refrenceid,
						"contacts_id":data.customername.id,
						"accounts_id":this.accounts_id,
						"companies_id":this.companies_id,
						"gst_perc":this.gst_perc.toFixed(2),
						"gst_value":gst_value.toFixed(2),
						"discount_perc":this.discount_perc,
						"discount_amount":this.discount_amount,
						"net_total":this.sub_total,
						"payments_terms_id":data.paymentterms,
						"invoice_note":this.addNotesForm.value.notes,
						"start_date":this.datePipe.transform(data.invoicedate, 'yyyy-MM-dd'),
						"end_date":this.datePipe.transform(data.invoicedate, 'yyyy-MM-dd'),
						"due_date":this.datePipe.transform(data.duedate, 'yyyy-MM-dd'),
						"adjustment_value":this.Adjustments_charges,
						"additional_charge":this.addtionalcharges,
						"items":itemdata,
						"is_draft":0,
						"net_total_after_taxes":this.total.toFixed(2),
						// "allow_partial_payment":"1",
						"total_amount_due":this.total.toFixed(2),
						// "invoice_statuses_id":"1",
						"tags":this.tags,
						"files_id":this.file
					}
					
				}// recurring invoice
				else{
					if(data.override){
						override_status=1;
					}
					udata = {
						"invoice_types_id":"3",
						"is_override":override_status,
						"invoice_sequence_id":this.store.invoice.id,
						"income_categories_id":data.category.id,
						"invoice_user_input_reference_id":data.refrenceid,
						"contacts_id":data.customername.id,
						"accounts_id":this.accounts_id,
						"companies_id":this.companies_id,
						"gst_perc":this.gst_perc.toFixed(2),
						"gst_value":gst_value.toFixed(2),
						"discount_perc":this.discount_perc,
						"discount_amount":this.discount_amount,
						"net_total":this.sub_total,
						"payments_terms_id":data.paymentterms,
						"invoice_note":this.addNotesForm.value.notes,
						"frequencies_id":data.frequency,
						"repeat_for":data.paymentterms,
						"start_date":this.datePipe.transform(data.startdate, 'yyyy-MM-dd'),
						"end_date":this.datePipe.transform(data.enddate, 'yyyy-MM-dd'),
						"due_date":this.datePipe.transform(data.duedate, 'yyyy-MM-dd'),
						"is_recurring":"1",
						"adjustment_value":this.Adjustments_charges,
						"additional_charge":this.addtionalcharges,
						"items":itemdata,
						"is_draft":0,
						"net_total_after_taxes":this.total.toFixed(2),						
						// "allow_partial_payment":"1",
						"total_amount_due":this.total.toFixed(2),
						// "invoice_statuses_id":"1",
						"tags":this.tags,
						"files_id":this.file
					}
					
				}
			}//usernot gst complaint
			else{

				if(this.selectedTax.length > 0){
					this.selectedTax.forEach(tax => {
						this.taxess.push({
							"company_taxes_id":tax.company_taxes_id,
							"tax_perc":tax.tax_perc,
							"tax_value":tax.taxamount
						});
					})
				}

				//one time invoice
				if(this.store.type=='1'){
					//if override
					if(data.override){
						override_status=1;
					}
					
					udata = {  
						"invoice_types_id":1,
						"is_override":override_status,
						"invoice_sequence_id":this.store.invoice.id,
						"income_categories_id":data.category.id,
						"invoice_user_input_reference_id":data.refrenceid,
						"contacts_id":data.customername.id,
						"accounts_id":this.accounts_id,
						"companies_id":this.companies_id,
						"gst_perc":"0",
						"gst_value":"0",
						"discount_perc":this.discount_perc,
						"discount_amount":this.discount_amount,
						"net_total":this.sub_total,
						"payments_terms_id":data.paymentterms,
						"invoice_note":this.addNotesForm.value.notes,
						"start_date":this.datePipe.transform(data.invoicedate, 'yyyy-MM-dd'),
						"end_date":this.datePipe.transform(data.invoicedate, 'yyyy-MM-dd'),
						"due_date":this.datePipe.transform(data.duedate, 'yyyy-MM-dd'),
						"adjustment_value":this.Adjustments_charges,
						"additional_charge":this.addtionalcharges,
						"items":itemdata,
						"is_draft":0,
						"net_total_after_taxes":this.total.toFixed(2),						
						// "allow_partial_payment":"1",
						"total_amount_due":this.total.toFixed(2),
						// "invoice_statuses_id":"1",
						"tags":this.tags,
						"files_id":this.file,
						"taxes":this.taxess
					}
				}//recurring invoice
				else{
					//override
					if(data.override){
						override_status=1;
					}
					udata = {
						"invoice_types_id":data.invoiceType,
						"is_override":override_status,
						"invoice_sequence_id":this.store.invoice.id,
						"income_categories_id":data.category.id,
						"invoice_user_input_reference_id":data.refrenceid,
						"contacts_id":data.customername.id,
						"accounts_id":this.accounts_id,
						"companies_id":this.companies_id,
						"gst_perc":"0",
						"gst_value":"0",
						"discount_perc":this.discount_perc,
						"discount_amount":this.discount_amount,
						"net_total":this.sub_total,
						"payments_terms_id":"",
						"invoice_note":this.addNotesForm.value.notes,
						"frequencies_id":data.frequency,
						"repeat_for":data.paymentterms,
						"start_date":this.datePipe.transform(data.startdate, 'yyyy-MM-dd'),
						"end_date":this.datePipe.transform(data.enddate, 'yyyy-MM-dd'),
						"due_date":this.datePipe.transform(data.duedate, 'yyyy-MM-dd'),
						"is_recurring":"1",
						"adjustment_value":this.Adjustments_charges,
						"additional_charge":this.addtionalcharges,
						"items":itemdata,
						"is_draft":0,
						"net_total_after_taxes":this.total.toFixed(2),						
						// "allow_partial_payment":"1",
						"total_amount_due":this.total.toFixed(2),
						// "invoice_statuses_id":"1",
						"tags":this.tags,
						"files_id":this.file,
						"taxes":this.taxess
					}
				}
			}
			// console.log(udata);
			
			this._httpService.updateInvoice(udata,this.invoice_id)
			.subscribe(result=>{
				if(result.status==200){
					// console.log(result);
					
					if(this.save_type=='1'){
						this.router.navigate(['/invoices']);
					}else{
						this.router.navigate(['/send-invoice/',result.data.id]);
					}
				
				}
				this.hideWarningClass = "clickHide";
			},(err:any)=>{
				this.errorHandle(err);
			}, () => console.log())
		}else{
			// console.log('some error');
			window.scrollTo(0, 0);
			this.invoiceFormLoader="";
			Object.keys(this.invoice_form.controls).map(key => {
				const errors = this.invoice_form.controls[key].errors;
				if (errors === null) { return null; }
				if (errors.required) {
					if(key=='paymentterms'){
						this.payment_error="This field is required";
					}
					//  return `${key} is required`;
				} else {
					return `${key} has an unknown error`;
				}
			});
		}
	}

	public adj_amt_valid = true;
    check_adj(){
		if(this.Adjustments_charges < 0) {
			let adj_amount = Math.abs(this.Adjustments_charges);
			
			let amn = this.sub_total + (+this.addtionalcharges);
			// console.log(amn);
			if(adj_amount > amn){
				this.adj_amt_valid = false;
			}else{
				this.adj_amt_valid = true;
			}
		}else{
			this.adj_amt_valid = true;
		}

	}
	dis_next(event) {
		if (!isNaN(event.target.value) && event.target.value.length > 0) {
			if (event.target.value < 100 && event.target.value >= 0) {
				this.submit =true;
			} else {
				this.submit =false;
			}
		}else if(event.target.value.length == 0) {
			if(event.target.value.indexOf('e')){
				this.submit = false;
			}else{
				this.submit = true;
			}
		} else {
			this.submit = false;
		}
	}
	rate_next(event) {
		if (!isNaN(event.target.value) && event.target.value.length > 0) {
			this.submit = true;
		}
		else {
			this.submit = false;
		}
	}

	qty_next(event) {
		if (!isNaN(event.target.value) && event.target.value.length > 0) {
			if (event.target.value > 0) {
				this.submit =true;
			} else {
				this.submit =false;
			}
		}
		else {
			this.submit = false;
		}
	}
	///contact specific function
	addCustomerForm = new FormGroup({
		name: new FormControl('',[Validators.required,Validators.pattern('^[a-zA-z ]+$'), Validators.maxLength(50)]),
		type_of_contact: new FormControl(''),
		primary_contact: new FormControl('',[Validators.pattern('^[a-zA-z ]+$'),Validators.maxLength(50)]),
		email_id:new FormControl('',[Validators.required, CustomValidators.email]),
		mobile_number:new FormControl('',Validators.pattern('^[789][0-9]{9}$')),
		pan:new FormControl('',Validators.pattern('^[A-Z]{5}[0-9]{4}[A-Z]{1}$')),
		tds: new FormControl('',Validators.pattern('^[0-9]{1,2}$')),
		is_same:new FormControl(true),
		gstin: new FormControl('',Validators.pattern('^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$')),
		billing_address: new FormGroup({
		  address_line: new FormControl('',[Validators.required]),
		  city: new FormControl('',[Validators.required]),
		  state: new FormControl('',[Validators.required]),
		  pincode : new FormControl('',[Validators.required,Validators.pattern('^[0-9]{6}$')])
		}),
		shipping_address:new FormGroup({
		  address_line: new FormControl(''),
		  city: new FormControl(''),
		  state: new FormControl(''),
		  pincode : new FormControl('',Validators.pattern('^[0-9]{6}$'))
		})
	});

	
	updateCustomerForm = new FormGroup({
		name: new FormControl('',[Validators.required,Validators.pattern('^[a-zA-z ]+$'), Validators.maxLength(50)]),
		type_of_contact: new FormControl(''),
		primary_contact: new FormControl('',[Validators.pattern('^[a-zA-z ]+$'),Validators.maxLength(50)]),
		email_id:new FormControl('',[Validators.required, CustomValidators.email]),
		mobile_number:new FormControl('',Validators.pattern('^[789][0-9]{9}$')),
		pan:new FormControl('',Validators.pattern('^[A-Z]{5}[0-9]{4}[A-Z]{1}$')),
		tds: new FormControl('',Validators.pattern('^[0-9]{1,2}$')),
		is_same:new FormControl(true),
		gstin: new FormControl('',Validators.pattern('^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$')),
		shipping_address: new FormGroup({
		  address_line: new FormControl(''),
		  city: new FormControl(''),
		  state: new FormControl(''),
		  pincode : new FormControl('',Validators.pattern('^[0-9]{6}$'))
		}),
		billing_address: new FormGroup({
			address_line: new FormControl('',[Validators.required]),
			city: new FormControl('',[Validators.required]),
			state: new FormControl('',[Validators.required]),
			pincode : new FormControl('',[Validators.required,Validators.pattern('^[0-9]{6}$')])
		  }),
	});
	
	addCustomerFormSubmit(){
		this.contactFormLoader="addLoader";
		if (this.addCustomerForm.valid) {

		  let billing_address:any [];
		  let shipping_address: any [];
		  let udata={};
		  if(this.addCustomerForm.value.is_same == true){
			billing_address=this.addCustomerForm.value.billing_address;
			shipping_address = this.addCustomerForm.value.billing_address;
		  } 
		  else
		  {
			billing_address=this.addCustomerForm.value.billing_address;
			shipping_address = this.addCustomerForm.value.shipping_address;
		  }
		  
		  let pan='';
		  if(this.addCustomerForm.value.pan !=null){
			pan = this.addCustomerForm.value.pan.toUpperCase();
		  }	

		  udata={
			"accounts_id":this.accounts_id,
			"companies_id":this.companies_id,
			"name":this.addCustomerForm.value.name,
			"primary_contact":this.addCustomerForm.value.primary_contact,
			"type_of_contact":this.addCustomerForm.value.type_of_contact,
			"email_id":this.addCustomerForm.value.email_id,
			"mobile_number":this.addCustomerForm.value.mobile_number,
			"shipping_address":[shipping_address],
			"billing_address":[billing_address],
			"currency":"INR",
			"pan":pan,
			"gstin":this.addCustomerForm.value.gstin,
			"tds":this.addCustomerForm.value.tds
		  };
		  
		  this._httpService.createContact(udata)
		  .subscribe(result=>{
		  if(result){
			if(result.status==200){
				//console.log(result);
				
				let con_data =result.data;
				this.invoice_form.controls['customername'].patchValue(result.data);
				this.store.to = new Customer(con_data.id, con_data.name, con_data.type_of_contact, con_data.email_id, con_data.mobile_number || con_data.landline_number, con_data.pan, con_data.tds, con_data.gstin, con_data.billing_address.data,con_data.shipping_address.data,con_data.primary_contact);
				//this.invoice_form.patchValue({'customername':con_data});
				this.getTaxType(con_data.id);
				this.calculateTotal();
			
				this.closeContactForm.nativeElement.click();
				this.contactFormLoader="";
		
				this.hideWarningClass = "clickHide";
				this.successLoader('Contact added successfully.');
			}
		  }
		  },(err:any)=>{
			this.errorHandle(err);
		}, () => console.log());
	  
		} else {
			this.contactFormLoader="";
		  	//console.log('failed contact add');
		  	Object.keys(this.addCustomerForm.controls).forEach(field => {
				let control = this.addCustomerForm.get(field);    
				control.markAsTouched({ onlySelf: true });  
				//console.log(control);
			});
			
		}
	}

	updateCustomerFormSubmit(){
		this.contactFormLoader="addLoader";
		if (this.updateCustomerForm.valid) {
			
			let billing_address:any [];
			let shipping_address: any [];
			let udata={};
			if(this.updateCustomerForm.value.is_same == true){
			billing_address=this.updateCustomerForm.value.billing_address;
			shipping_address = this.updateCustomerForm.value.billing_address;
			} 
			else
			{
			billing_address=this.updateCustomerForm.value.billing_address;
			shipping_address = this.updateCustomerForm.value.shipping_address;
			}

			let pan='';
			if(this.updateCustomerForm.value.pan != null){
			  pan = this.updateCustomerForm.value.pan.toUpperCase();
			}	
		
			udata={
			"accounts_id":this.accounts_id,
			"companies_id":this.companies_id,
			"name":this.updateCustomerForm.value.name,
			"primary_contact":this.updateCustomerForm.value.primary_contact,
			"type_of_contact":this.updateCustomerForm.value.type_of_contact,
			"email_id":this.updateCustomerForm.value.email_id,
			"mobile_number":this.updateCustomerForm.value.mobile_number,
			"landline_number":"",
			"shipping_address":[shipping_address],
			"billing_address":[billing_address],
			"currency":"INR",
			"pan":pan,
			"gstin":this.updateCustomerForm.value.gstin,
			"tds":this.updateCustomerForm.value.tds,
			"notes":"",
			"beneficiary_account_number":"",
			"ifsc_code":"",
			"bank_name":"",
			"other_details":""
			};
			
			this._httpService.updateContact(this.store.to.id,udata)
			.subscribe(result=>{
				if(result){
					if(result.status==200){
						let con_data =result.data;
						this.invoice_form.controls['customername'].patchValue(result.data);
						this.store.to = new Customer(con_data.id, con_data.name, con_data.type_of_contact, con_data.email_id, con_data.mobile_number || con_data.landline_number, con_data.pan, con_data.tds, con_data.gstin, con_data.billing_address.data,con_data.shipping_address.data,con_data.primary_contact);
						//this.invoice_form.patchValue({'customername':con_data});
			
						this.calculateTotal();
			
						this.closeUpdateContactForm.nativeElement.click();
						this.contactFormLoader="";
						this.hideWarningClass = "clickHide";

						this.successLoader('Contact updated successfully.');
				
					}
				}
			},(err:any)=>{
				this.errorHandle(err);
			}, () => console.log());
		
		} else {
			this.contactFormLoader="";
				//console.log('failed contact add');
				Object.keys(this.updateCustomerForm.controls).forEach(field => {
				const control = this.updateCustomerForm.get(field);            
				control.markAsTouched({ onlySelf: true });       
			});
		}
	}



	// add new item

	itemForm = new FormGroup({
		name: new FormControl("",[Validators.required]),
		type: new FormControl("0",[Validators.required]),
		hsn_sac_code: new FormControl('',[Validators.required]),
		hsn_sac_type: new FormControl('',[Validators.required]),
		item_code: new FormControl(''),
		desc: new FormControl(''),
		rate: new FormControl('',[Validators.required]),
		gst: new FormControl("0"),
		addTax: new FormControl(),
		selecetedTaxes:new FormControl()
	});

	itemFormNonGst = new FormGroup({
		item_name: new FormControl("",[Validators.required]),
		custom_item_type: new FormControl('',[Validators.required]),
		item_code: new FormControl(''),
		description: new FormControl(''),
		price: new FormControl('',[Validators.required]),
	});
	
	openNewItem(){
		this.closeAddItem.nativeElement.click();
		this.openNewItemModel.nativeElement.click();
		
	}
	addItem() {
		this.itemFormLoader="addLoader";
		if (this.itemForm.valid) {
			let hsn_sac_code;
			if(this.itemForm.value.type==1){
				hsn_sac_code =this.itemForm.value.hsn_sac_code.sac_code;
			}else{
				hsn_sac_code =this.itemForm.value.hsn_sac_code.HSN;				
			}

			if(hsn_sac_code=='' || hsn_sac_code==null){
				hsn_sac_code =this.itemForm.value.hsn_sac_code;
			}

			let add_tex=[];
			if(this.itemForm.value.selecetedTaxes != null){

				add_tex=this.itemForm.value.selecetedTaxes;
			}
			let data = {
			"accounts_id":this.accounts_id,
			"companies_id":this.companies_id,
			"item_name":this.itemForm.value.name,
			"item_code":this.itemForm.value.item_code,
			"hsn_sac_code":hsn_sac_code,
			"hsn_sac_type":this.itemForm.value.hsn_sac_type,
			"custom_item_type":"",
			"description":this.itemForm.value.desc,
			"price":this.itemForm.value.rate,
			"units":"",
			"gst_perc":this.itemForm.value.gst,
			"is_active":"1",
			"is_service":this.itemForm.value.type,
			"additional_taxes":add_tex
			}
			this._httpService.createItem(data).subscribe((result)=>{
				 this.itemFormLoader="";
				 let event= result.data;
				 let type='';
				 if(event.hsn_sac_type!=null){
				   type=event.hsn_sac_type;
				 }else{
				   type=event.custom_item_type;
				 }
					this.store.items.push(new Item(event.id,
							event.item_name, 
							event.item_code,
							event.hsn_sac_code,
							type,
							'1', 
							event.description, 
							event.units, 
							'0', 
							'0', 
							event.price, 
							event.gst_perc, 
							event.company_tax,
							0,event.is_service,false));  
					
					this.calculateTotal();

					this.itemForm.reset();
					this.closeAddNewItemModel.nativeElement.click();

					this.hideWarningClass = "clickHide";

					this.successLoader('Item added successfully.');
					

			},(err:any)=>{
				this.errorHandle(err);
			}, () => console.log());
			
		}else {
			this.itemFormLoader="";
		  	Object.keys(this.itemForm.controls).forEach(field => {
			const control = this.itemForm.get(field);            
			control.markAsTouched({ onlySelf: true });       
		  });
		}
		
	}

	addItemNonGst() {
		this.itemFormLoader="addLoader";
		if (this.itemFormNonGst.valid) {
			let data = {
			"accounts_id":this.accounts_id,
			"companies_id":this.companies_id,
			"item_name":this.itemFormNonGst.value.item_name,
			"item_code":this.itemFormNonGst.value.item_code,
			"custom_item_type":this.itemFormNonGst.value.custom_item_type,
			"description":this.itemFormNonGst.value.description,
			"price":this.itemFormNonGst.value.price,
			"is_active":"1",
			"is_service":'0',
			"additional_taxes":[]
			}
			this._httpService.createItem(data).subscribe((result)=>{
				this.itemFormLoader="";
				let event= result.data;
				let type='';
				if(event.hsn_sac_type!=null){
				  type=event.hsn_sac_type;
				}else{
				  type=event.custom_item_type;
				}
				   this.store.items.push(new Item(event.id,
					event.item_name, 
					event.item_code,
					event.hsn_sac_code,
					type,
					'1', 
					event.description, 
					event.units, 
					'0', 
					'0', 
					event.price, 
					event.gst_perc, 
					event.company_tax,
					0,event.is_service,false));  
				
					this.calculateTotal();
				
					this.itemFormNonGst.reset();
					this.closeAddNewItemModel.nativeElement.click();
				
				this.hideWarningClass = "clickHide";
				this.successLoader('Item added successfully.');
			},(err:any)=>{
				this.errorHandle(err);
			}, () => console.log());
		
		}else {
			this.itemFormLoader="";
		  	Object.keys(this.itemFormNonGst.controls).forEach(field => {
			const control = this.itemFormNonGst.get(field);            
			control.markAsTouched({ onlySelf: true });       
		  });
		}
		
	}

	tax_arr:any[]=[];
	CompanyTaxes(){
		this._httpService.getCompanyTaxes()
		.subscribe((result)=>{
			for(let tax of result.data){
				this.tax_arr.push({value:tax.company_taxes_id,label:tax.tax_name});
			}
			this.taxes=result.data;
			this.hideWarningClass = "clickHide";
		},(err:any)=>{
			this.errorHandle(err);
		}, () => console.log());
	}
	hsncode:any =[]
	saccode:any = [];
	hsncodes:any=[];
	saccodes:any=[];
	
	searchsHsnCode(event){
		let query = event.query;
		this._httpService.getHSNCode(query)
		.subscribe((result)=>{
		if(result.data.length>0){
			this.hsncode = result.data;
		}
		this.hideWarningClass = "clickHide";
		},(err:any)=>{
			this.errorHandle(err);
		}, () => console.log());
	}

	searchSacCode(event){
		let query = event.query;
		this._httpService.getSACCode(query)
		.subscribe((result)=>{
		if(result.data.length>0){
			this.saccode = result.data;
		}
		this.hideWarningClass = "clickHide";
		},(err:any)=>{
			this.errorHandle(err);
		}, () => console.log());
	}

	public SAC_HSN_loader="";
	public SAC_message="";
	public HSN_message="";
	searchsHsnCodeByDesc(){
		this.SAC_HSN_loader="addLoader";
		this.hsncodes=[];
		let query = this.searchHsn.nativeElement.value;
		this._httpService.getHSNCodeByDesc(query)
		.subscribe((result)=>{
		if(result.data.length>0){
			this.hsncodes = result.data;
		}else{
			this.HSN_message="No Data Found.";
		}
		this.SAC_HSN_loader="";
		this.hideWarningClass = "clickHide";
		},(err:any)=>{
			this.SAC_HSN_loader="";
			
			this.errorHandle(err);
		}, () => console.log());
	}

	searchSacCodeByDesc(){
		this.SAC_HSN_loader="addLoader";
		this.saccodes=[];
		let query = this.searchSac.nativeElement.value;
		this._httpService.getSACCodeByDesc(query)
		.subscribe((result)=>{
		if(result.data.length>0){
			this.saccodes = result.data;
		}else{
			this.SAC_message="No Data Found.";
		}
		this.SAC_HSN_loader="";
		this.hideWarningClass = "clickHide";
		},(err:any)=>{
			this.SAC_HSN_loader="";
			this.errorHandle(err);
		}, () => console.log());
	}

	listHSNCode(){
		this.closeAddNewItemModel.nativeElement.click();
		this.openHSNModel.nativeElement.click();
		// this._httpService.getAllHSNCode()
		// .subscribe((result)=>{
		// if(result.data.length>0){
		// 	this.hsncodes=result.data;
		// }
		// else{
		// 	console.log("No data found");
		// }
		// });
	}

	listSACCode(){
		this.closeAddNewItemModel.nativeElement.click();
		this.openSACModel.nativeElement.click();
		// this._httpService.getAllSACCode()
		// .subscribe((result)=>{
		// if(result.data.length>0){
		// 	this.saccodes = result.data;
		// }
		// else{
		// 	console.log('No data Found');
		// }
		// });
	}

	sac_hsn_detail:any;
	selectSacDetail(event){
		this.sac_hsn_detail=event;
	}

	submitCode(type){
		if(type==1){
			this.getHsnCodeDetails(this.sac_hsn_detail);
			this.closeHsnModel.nativeElement.click();
		}else{
			this.getSacCodeDetails(this.sac_hsn_detail);
			this.closeSacModel.nativeElement.click();
			
		}
		//this.openNewItemModel.nativeElement.click();
	}

	getHsnCodeDetails(event){
		if(event){
			//this.itemForm.patchValue({name:event.description});
			//this.itemForm.patchValue({desc:event.description});
			this.itemForm.patchValue({gst:event.Rate+'.00'});
			//this.itemForm.patchValue({hsn_sac_type:event.Chapter});
			this.itemForm.patchValue({hsn_sac_code:event.HSN});
		}
		
	}

	getSacCodeDetails(event){
		if(event){
			//this.itemForm.patchValue({desc:event.sac_description});
			this.itemForm.patchValue({gst:event.rate+'.00'});
			this.itemForm.patchValue({hsn_sac_code:event.SAC});
		}
		
	}


	OpenNewItemModel(){
		this.openNewItemModel.nativeElement.click();
	}

	opengstmodal():void
	{
		this.gstinModal.nativeElement.click();  
	}
	
	addCode(){
		this.opengstmodal();
	}

	public invoice_pdf:any='';
    public pdf_url;
	getInvoicePdf(){
        this._httpService.getInvoicePdf(this.invoice_id)
        .subscribe(
        (result) => {
            if(result.status==200){
                this.invoice_pdf=result.file1;
                //this.pdf_url = this.sanitizer.bypassSecurityTrustResourceUrl(this.invoice_pdf);
            }
            
			this.hideWarningClass = "clickHide";
		},(err:any)=>{
			this.errorHandle(err);
		}, () => console.log()
        );
	}
	print_pdf(file){
        var w = window.open(file); //Required full file path.
        w.print();
	}

	toggleTips() {
		if (this.toggle_class == "") {
		this.toggle_class = "showTips";
		} else {
		this.toggle_class = "";
		}
	}
	getUnit(){
		this.units=this._httpService.getUnitList();
	}

	getGst(){
		this.gstrates=this._httpService.getGstList();
	}

	getPaymentTermList(){
		this.paymentterms=this._httpService.getPaymentTermList();
	}

	getFrequencyList(){
		this.frequnecy=this._httpService.getFrequencyList();
	}

	public save_type='1';
	saveType(type){
		this.save_type=type;
	}

	getState(){
		this.state_list=this._httpService.getStateList();
	}

	hideShippingForm(){
		this.isClicked = !this.isClicked;
	}

	is_future_date=true;
	todaysDate = new Date();
	
	check_invoice_start_date(event){
		var inputDate = new Date(event);
		
		// Get today's date
		//var todaysDate = new Date();
		
		// call setHours to take the time out of the comparison
		if(inputDate.setHours(0,0,0,0) == this.todaysDate.setHours(0,0,0,0)) {
			// Date equals today's date
			this.is_future_date=false;
		}else{
			this.is_future_date=true;			
		}
	}
 }



