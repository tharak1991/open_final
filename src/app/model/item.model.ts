export class Item{
  id:string;
  name:string;
  code: string;
  hsn_sac: string;
  type: string;
  qty: string;
  desc: string;
  unit: string;
  dsc: any;
  dsc_amount: any;
  rate: string;
  gst: number;
  addTax: any[];
  subtotal:any;
  is_service:string;
  is_select:boolean;
  constructor(
              id:string,
              name: string,
              code: string,
              hsn_sac: string,
              type: string,
              qty: string,
              desc: string,
              unit: string,
              dsc: any,
              dsc_amount: any,
              rate: string,
              gst: number,
              addTax: any[],
            subtotal: any,is_service:string,is_select:boolean) {
    this.id = id;          
    this.name = name;
    this.code = code;
    this.hsn_sac = hsn_sac;
    this.type = type;
    this.qty = qty;
    this.desc = desc;
    this.unit = unit;
    this.dsc = dsc;
    this.dsc_amount = dsc_amount;
    this.rate = rate;
    this.gst = gst;
    this.addTax = addTax;
    this.subtotal = subtotal;
    this.is_service=is_service;
    this.is_select=is_select;
  }
}
