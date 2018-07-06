export class Customer {
  id: string;
  name: string;
  type: string;
  email: string;
  phone: string;
  pan: string;
  tds: string;
  gstin: string;

  billing_address: any;
  shipping_address: any;

  primary_contact:string;

  constructor(id: string,
              name: string,
              type: string,
              email: string,
              phone: string,
              pan: string,
              tds: string,
              gstin: string,

              billing_address: any,
              shipping_address: any,primary_contact:string) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.email = email;
    this.phone = phone;
    this.pan = pan;
    this.tds = tds;
    this.gstin = gstin;

    this.billing_address = billing_address;
    this.shipping_address = shipping_address;
    this.primary_contact=primary_contact;
  }
}
