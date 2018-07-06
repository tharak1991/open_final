import { OneTimeInvoice, RecurrInvoice } from './invoice.model';
import { Customer } from './customer.model';
import { Category } from './category.model';
import { Bill } from './bill.model';
import { Item } from './item.model';
import { Terms } from './terms.model';

export class Store {
  to: Customer;
  category: Category;
  type: string;

  invoice: OneTimeInvoice | RecurrInvoice;

  items: Item[];

  bill: Bill;
  terms: Terms;

  constructor() {
    this.to = new Customer("", "", "", "", "", "", "", "",{}, {},'',);
    this.category = new Category("",'');
    this.type = "1";
    this.invoice = new OneTimeInvoice("","",'',"", "",'',false);
    this.items = [];
    this.bill = new Bill(0, 0, 0, 0);
    this.terms=new Terms("","");
  }
}
