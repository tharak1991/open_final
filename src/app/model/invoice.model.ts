export class OneTimeInvoice {
  id: string;
  date: string;
  terms: string;
  due: string;
  ref: string;
  invoiceto : string;

  is_override : boolean;
  


  constructor(id: string, date: string, terms:string, due: string, ref: string,invoiceto : string,is_override : boolean) {
    this.id = id;
    this.date = date;
    this.terms = terms;
    this.due = due;
    this.ref = ref;
    this.invoiceto = invoiceto;
    this.is_override = is_override;
    
  }
}

export class RecurrInvoice {
  id: string;
  date: string;
  start: string;
  freq: string;
  months_term: string;
  ref: string;
  invoiceto : string;
  is_override : boolean;
  
  constructor(id: string, date: string, start: string, freq: string, months_term: string, ref: string,invoiceto : string,is_override : boolean) {
    this.id = id;
    this.date = date;
    this.start = start;
    this.freq = freq;
    this.months_term = months_term;
    this.ref = ref;
    this.invoiceto = invoiceto;    
    this.is_override = is_override;
    
  }
}

export class User {
  allocated_amt_tagged: any = []; // required
 }
