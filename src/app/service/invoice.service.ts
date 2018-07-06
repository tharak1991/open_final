import { Injectable } from '@angular/core';
import { ResponseContentType, Http, Response, HttpModule, Headers, RequestOptions, BaseRequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Rx';
import { BaseService } from './base.service';
import { STATE_LIST } from '../mock/state_list';
import { UNIT_LIST } from '../mock/unit_list';
import { GST_LIST } from '../mock/gst_list';
import { PAYMENT_TERM_LIST } from '../mock/payment_term_list';
import { FREQUENCY_LIST } from '../mock/frequency';

@Injectable()
export class InvoiceService {
  public token: string;
  public companies_id;
  public accounts_id;

  private _urlContactDetails = 'contacts';
  private _urlItem = 'items';
  private _urlCategoryIncome = 'categories/income';
  private _urlInvoiceSequence = 'invoices/sequence_id';
  private _urlInvoice = 'invoices';
  private _urlCompanyTax = 'company_taxes';
  private _urlHSNCode = 'hsn';
  private _urlSACCode = 'sac';
  private _fileUploadOthers = 'file/others';

  // for only temporary use, provided by aji
  private _urlExternalpayment = 'external_payment';
  private _urlMarkpayment = 'mark_payment';

  private _urlGetCompanyGSTIN = 'mob/get_company_gstin';

  private _urlCategoryExpense = 'categories/expense';
  private _urlinvoiceSearch = 'invoice/form_search';
  private _urlDownload = 'invoice/list/download';

  private _deleteFiles = 'files/';
  private _urlgetTaxType = 'invoice/tax_types';

  private _urlSearchReceivable = 'invoice/form_search';

  constructor(private _http: Http, private http: BaseService) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.token = currentUser && currentUser.token;
    this.companies_id = currentUser && currentUser.company_details.companies_id;
    this.accounts_id = currentUser && currentUser.account_details.accounts_id;
  }

  quickCollectRequest(data) {
    return this.http.post('quick_collect', data)
  }


  getQuickCollectsByContact(contacts_id) {
    const urlPara = this._urlInvoice + '?accounts_id=' + this.accounts_id + '&companies_id=' + this.companies_id +
      '&per_page=10&orderBy=invoices_id&sortedBy=desc&invoice_types_id=1:3:4&search=contacts_id:'
      + contacts_id + '&contacts_id=' + contacts_id;
    return this.http.get(urlPara, '')
  }

  getReceivablesByFilter(data) {
    let urlPara = this._urlinvoiceSearch + '?invoice_types_id=4&accounts_id=' + this.accounts_id + '&companies_id=' + this.companies_id;

    if (data.range_start !== '' && data.range_end !== '' && data.range_start !== null && data.range_end !== null) {
      urlPara = urlPara + '&range_start=' + data.range_start + '&range_end=' + data.range_end;
    }

    let x = 0;

    if (data.recepient_name !== '' && data.recepient_name != null) {
      if (x !== 0) {
        urlPara = urlPara + ';recepient_name:' + data.recepient_name;
      } else {
        x = x + 1;
        urlPara = urlPara + '&search=recepient_name:' + data.recepient_name;
      }
    }
    if (data.amount_by === '1') {
      if (data.total_billed_greater && data.total_billed_greater !== null) {
        urlPara = urlPara + '&total_billed_greater=' + data.total_billed_greater;
      }
      if (data.total_billed_lesser && data.total_billed_lesser !== null) {
        urlPara = urlPara + '&total_billed_lesser=' + data.total_billed_lesser;
      }
      if (data.total_billed_equal && data.total_billed_equal !== null) {
        urlPara = urlPara + '&total_billed_equal=' + data.total_billed_equal;
      }
    } else if (data.amount_by === '2') {

      if (data.outstanding_greater && data.outstanding_greater !== null) {
        urlPara = urlPara + '&outstanding_greater=' + data.outstanding_greater;
      }
      if (data.outstanding_less && data.outstanding_less !== null) {
        urlPara = urlPara + '&outstanding_less=' + data.outstanding_less;
      }
      if (data.outstanding_equal && data.outstanding_equal !== null) {
        urlPara = urlPara + '&outstanding_equal=' + data.outstanding_equal;
      }
    }

    if (data.dso_greater && data.dso_greater !== null) {
      urlPara = urlPara + '&dso_greater=' + data.dso_greater;
    }
    if (data.dso_lesser && data.dso_lesser !== null) {
      urlPara = urlPara + '&dso_lesser=' + data.dso_lesser;
    }
    if (data.dso_equal && data.dso_equal !== null) {
      urlPara = urlPara + '&dso_equal=' + data.dso_equal;
    }

    urlPara = urlPara + '&searchJoin=and';
    return this.http.get(urlPara, '');
  }

  getQuickCollectsByFilter(data) {
    let urlPara = this._urlinvoiceSearch + '?invoice_types_id=4&accounts_id=' + this.accounts_id + '&companies_id=' + this.companies_id;

    if (data.due_date_from !== '' && data.due_date_to !== '' && data.due_date_from !== null && data.due_date_to !== null) {
      urlPara = urlPara + '&due_date_from=' + data.due_date_from + '&due_date_to=' + data.due_date_to;
    }

    let x = 0;
    if (data.invoices_sequence_id !== '' && data.invoices_sequence_id !== null) {
      x = x + 1;
      urlPara = urlPara + '&search=invoices_sequence_id:' + data.invoices_sequence_id;
    } else if (data.receive_id !== '' && data.receive_id !== null) {
      x = x + 1;
      urlPara = urlPara + '&search=receive_id:' + data.receive_id;
    }
    if (data.recepient_name !== '' && data.recepient_name != null) {
      if (x !== 0) {
        urlPara = urlPara + ';recepient_name:' + data.recepient_name;
      } else {
        x = x + 1;
        urlPara = urlPara + '&search=recepient_name:' + data.recepient_name;
      }
    }
    if (data.invoice_statuses_id !== '' && x !== 0 && data.invoice_statuses_id !== null) {
      urlPara = urlPara + ';invoice_statuses_id:' + data.invoice_statuses_id;
    } else if (data.invoice_statuses_id !== '' && data.invoice_statuses_id !== null) {
      urlPara = urlPara + '&search=invoice_statuses_id:' + data.invoice_statuses_id;
    }

    if (data.amount_by === '1') {
      if (data.total_billed_greater && data.total_billed_greater !== null) {
        urlPara = urlPara + '&total_billed_greater=' + data.total_billed_greater;
      }
      if (data.total_billed_lesser && data.total_billed_lesser !== null) {
        urlPara = urlPara + '&total_billed_lesser=' + data.total_billed_lesser;
      }
      if (data.total_billed_equal && data.total_billed_equal !== null) {
        urlPara = urlPara + '&total_billed_equal=' + data.total_billed_equal;
      }
    } else if (data.amount_by === '2') {

      if (data.outstanding_greater && data.outstanding_greater !== null) {
        urlPara = urlPara + '&outstanding_greater=' + data.outstanding_greater;
      }
      if (data.outstanding_less && data.outstanding_less !== null) {
        urlPara = urlPara + '&outstanding_less=' + data.outstanding_less;
      }
      if (data.outstanding_equal && data.outstanding_equal !== null) {
        urlPara = urlPara + '&outstanding_equal=' + data.outstanding_equal;
      }
    }

    if (data.over_due_days_greater && data.over_due_days_greater !== null) {
      urlPara = urlPara + '&over_due_days_greater=' + data.over_due_days_greater;
    }
    if (data.over_due_days_lesser && data.over_due_days_lesser !== null) {
      urlPara = urlPara + '&over_due_days_lesser=' + data.over_due_days_lesser;
    }
    if (data.over_due_days_equal && data.over_due_days_equal !== null) {
      urlPara = urlPara + '&over_due_days_equal=' + data.over_due_days_equal;
    }


    urlPara = urlPara + '&searchJoin=and';
    return this.http.get(urlPara, '');
  }

  getQuickCollects() {
    const urlPara = this._urlInvoice + '?accounts_id=' + this.accounts_id + '&companies_id=' + this.companies_id +
      '&invoice_types_id=4&per_page=10&orderBy=invoices_id&sortedBy=desc';
    return this.http.get(urlPara, '')
  }

  getReceivables(data) {
    const urlPara = 'receivables?accounts_id=' + this.accounts_id + '&companies_id=' + this.companies_id +
      '&per_page=10&range_start=' + data.range_start + '&range_end=' + data.range_end;
    return this.http.get(urlPara, '')
  }

  GetPage(url) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.token = currentUser && currentUser.token;
    const headers = new Headers({ 'Authorization': 'Bearer' + this.token });
    const options = new RequestOptions({ headers: headers });
    return this._http.get(url, options)
      .map((response: Response) => response.json());
  }

  getTaxType(contacts_id) {
    const urlPara = this._urlgetTaxType + '?contacts_id=' + contacts_id + '&companies_id=' + this.companies_id;
    return this.http.get(urlPara, '')
  }

  receivablesDownload(data) {
    const urlPara = 'receivables/download?accounts_id=' + this.accounts_id + '&companies_id=' + this.companies_id +
    '&range_start=' + data.range_start + '&range_end=' + data.range_end;
    return this.http._base_url + urlPara;
  }

  quickCollectDownload(data) {
    let urlPara = this._urlDownload + '?accounts_id=' + this.accounts_id + '&companies_id=' + this.companies_id;
    if (data.due_date_from !== '' && data.due_date_to !== '' && data.due_date_from !== null && data.due_date_to !== null) {
      urlPara = urlPara + '&due_date_from=' + data.due_date_from + '&due_date_to=' + data.due_date_to;
    }

    let x = 0;
    if (data.invoices_sequence_id !== '' && data.invoices_sequence_id !== null) {
      x = x + 1;
      urlPara = urlPara + '&search=invoices_sequence_id:' + data.invoices_sequence_id;
    } else if (data.receive_id !== '' && data.receive_id !== null) {
      x = x + 1;
      urlPara = urlPara + '&search=receive_id:' + data.receive_id;
    }
    if (data.recepient_name !== '' && data.recepient_name != null) {
      if (x !== 0) {
        urlPara = urlPara + ';recepient_name:' + data.recepient_name;
      } else {
        x = x + 1;
        urlPara = urlPara + '&search=recepient_name:' + data.recepient_name;
      }
    }
    if (data.invoice_statuses_id !== '' && x !== 0 && data.invoice_statuses_id !== null) {
      urlPara = urlPara + ';invoice_statuses_id:' + data.invoice_statuses_id;
    } else if (data.invoice_statuses_id !== '' && data.invoice_statuses_id !== null) {
      urlPara = urlPara + '&search=invoice_statuses_id:' + data.invoice_statuses_id;
    }

    if (data.amount_by === '1') {
      if (data.total_billed_greater && data.total_billed_greater !== null) {
        urlPara = urlPara + '&total_billed_greater=' + data.total_billed_greater;
      }
      if (data.total_billed_lesser && data.total_billed_lesser !== null) {
        urlPara = urlPara + '&total_billed_lesser=' + data.total_billed_lesser;
      }
      if (data.total_billed_equal && data.total_billed_equal !== null) {
        urlPara = urlPara + '&total_billed_equal=' + data.total_billed_equal;
      }
    } else if (data.amount_by === '2') {

      if (data.outstanding_greater && data.outstanding_greater !== null) {
        urlPara = urlPara + '&outstanding_greater=' + data.outstanding_greater;
      }
      if (data.outstanding_less && data.outstanding_less !== null) {
        urlPara = urlPara + '&outstanding_less=' + data.outstanding_less;
      }
      if (data.outstanding_equal && data.outstanding_equal !== null) {
        urlPara = urlPara + '&outstanding_equal=' + data.outstanding_equal;
      }
    }

    if (data.over_due_days_greater && data.over_due_days_greater !== null) {
      urlPara = urlPara + '&over_due_days_greater=' + data.over_due_days_greater;
    }
    if (data.over_due_days_lesser && data.over_due_days_lesser !== null) {
      urlPara = urlPara + '&over_due_days_lesser=' + data.over_due_days_lesser;
    }
    if (data.over_due_days_equal && data.over_due_days_equal !== null) {
      urlPara = urlPara + '&over_due_days_equal=' + data.over_due_days_equal;
    }

    urlPara = urlPara + '&search=invoice_types_id:4&searchJoin=and';
    return this.http._base_url + urlPara;
  }

  download(data) {
    let urlPara = this._urlDownload + '?accounts_id=' + this.accounts_id + '&companies_id=' + this.companies_id;

    if (data.due_date_from !== '' && data.due_date_to !== '' && data.due_date_from != null && data.due_date_to != null) {
      urlPara = urlPara + '&due_date_from=' + data.due_date_from + '&due_date_to=' + data.due_date_to;
    }

    if (data.invoice_date_from !== '' && data.invoice_date_to !== '' && data.invoice_date_from != null && data.invoice_date_to != null) {
      urlPara = urlPara + '&invoice_date_from=' + data.invoice_date_from + '&invoice_date_to=' + data.invoice_date_to;
    }

    let x = 0;
    if (data.invoice_sequence_id !== '' && data.invoice_sequence_id != null) {
      x = x + 1;
      urlPara = urlPara + '&search=invoice_sequence_id:' + data.invoice_sequence_id;
    } else if (data.mobile_number !== '' && data.mobile_number != null) {
      x = x + 1;
      urlPara = urlPara + '&search=mobile_number:' + data.mobile_number;
    } else if (data.email_id !== '' && data.email_id != null) {
      x = x + 1;
      urlPara = urlPara + '&search=email_id:' + data.email_id;
    } else if (data.recepient_name !== '' && data.recepient_name != null) {
      x = x + 1;
      urlPara = urlPara + '&search=recepient_name:' + data.recepient_name;
    }

    if (data.invoice_types_id !== 'all') {
      if (x !== 0) {
        urlPara = urlPara + ';invoice_types_id:' + data.invoice_types_id;
      } else {
        x = x + 1;
        urlPara = urlPara + '&search=invoice_types_id:' + data.invoice_types_id;
      }
    }

    if (data.income_categories_id !== '' && typeof data.income_categories_id !== 'undefined'
      && x !== 0 && data.income_categories_id != null) {
      urlPara = urlPara + ';income_categories_id:' + data.income_categories_id;
    } else if (data.income_categories_id !== '' && typeof data.income_categories_id != 'undefined' && data.income_categories_id != null) {
      urlPara = urlPara + '&search=income_categories_id:' + data.income_categories_id;
    }

    if (data.invoice_statuses_id !== '' && x !== 0 && data.invoice_statuses_id != null) {
      urlPara = urlPara + ';invoice_statuses_id:' + data.invoice_statuses_id;
    } else if (data.invoice_statuses_id !== '' && data.invoice_statuses_id != null) {
      urlPara = urlPara + '&search=invoice_statuses_id:' + data.invoice_statuses_id;
    }

    if (data.amount && data.amount != null) {
      urlPara = urlPara + '&amount=' + data.amount;
    }
    urlPara = urlPara + '&searchJoin=and';

    return this.http._base_url + urlPara;
  }

  getInvoiceByFilter(data) {
    let urlPara = this._urlinvoiceSearch + '?accounts_id=' + this.accounts_id +
    '&companies_id=' + this.companies_id + '&invoice_types_id=1:3';

    if (data.due_date_from !== '' && data.due_date_to !== '' && data.due_date_from !== null && data.due_date_to !== null) {
      urlPara = urlPara + '&due_date_from=' + data.due_date_from + '&due_date_to=' + data.due_date_to;
    }

    if (data.invoice_date_from !== '' && data.invoice_date_to !== '' && data.invoice_date_from !== null && data.invoice_date_to !== null) {
      urlPara = urlPara + '&invoice_date_from=' + data.invoice_date_from + '&invoice_date_to=' + data.invoice_date_to;
    }


    if (data.over_due_days_equal !== '' && data.over_due_days_equal !== null) {
      urlPara = urlPara + '&over_due_days_equal=' + data.over_due_days_equal;
    }

    if (data.over_due_days_greater !== '' && data.over_due_days_greater !== null) {
      urlPara = urlPara + '&over_due_days_greater=' + data.over_due_days_greater;
    }

    if (data.over_due_days_lesser !== '' && data.over_due_days_lesser !== null) {
      urlPara = urlPara + '&over_due_days_lesser=' + data.over_due_days_lesser;
    }

    if (data.byamount !== '' && data.byamount !== null) {
      if (data.byamount === 1) {
        if (data.total_billed_equal !== '' && data.total_billed_equal !== null) {
          urlPara = urlPara + '&total_billed_equal=' + data.total_billed_equal;
        }

        if (data.total_billed_greater !== '' && data.total_billed_greater !== null) {
          urlPara = urlPara + '&total_billed_greater=' + data.total_billed_greater;
        }

        if (data.total_billed_lesser !== '' && data.total_billed_lesser !== null) {
          urlPara = urlPara + '&total_billed_lesser=' + data.total_billed_lesser;
        }
      } else {
        if (data.outstanding_equal !== '' && data.outstanding_equal !== null) {
          urlPara = urlPara + '&outstanding_equal=' + data.outstanding_equal;
        }

        if (data.outstanding_greater !== '' && data.outstanding_greater !== null) {
          urlPara = urlPara + '&outstanding_greater=' + data.outstanding_greater;
        }

        if (data.outstanding_less !== '' && data.outstanding_less !== null) {
          urlPara = urlPara + '&outstanding_less=' + data.outstanding_less;
        }
      }
    }

    //////////////////////////////////////////////////

    let x = 0;
    if (data.invoice_sequence_id !== '' && data.invoice_sequence_id !== null) {
      x = x + 1;
      urlPara = urlPara + '&search=invoice_sequence_id:' + data.invoice_sequence_id;
    } else if (data.mobile_number !== '' && data.mobile_number !== null) {
      x = x + 1;
      urlPara = urlPara + '&search=mobile_number:' + data.mobile_number;
    } else if (data.email_id !== '' && data.email_id !== null) {
      x = x + 1;
      urlPara = urlPara + '&search=email_id:' + data.email_id;
    } else if (data.recepient_name !== '' && data.recepient_name != null) {
      x = x + 1;
      urlPara = urlPara + '&search=recepient_name:' + data.recepient_name;
    }

    if (data.invoice_types_id !== 'all') {
      if (x !== 0) {
        urlPara = urlPara + ';invoice_types_id:' + data.invoice_types_id;
      } else {
        x = x + 1;
        urlPara = urlPara + '&search=invoice_types_id:' + data.invoice_types_id;
      }
    }

    // if (data.income_categories_id !== '' && typeof data.income_categories_id !== 'undefined' && x !== 0
    //   && data.income_categories_id !== null) {
    //   urlPara = urlPara + ';income_categories_id:' + data.income_categories_id;
    // } else if (data.income_categories_id !== '' && typeof data.income_categories_id !== 'undefined'
    //  && data.income_categories_id !== null) {
    //   urlPara = urlPara + '&search=income_categories_id:' + data.income_categories_id;
    // }

    if (data.invoice_statuses_id !== '' && x !== 0 && data.invoice_statuses_id !== null) {
      urlPara = urlPara + ';invoice_statuses_id:' + data.invoice_statuses_id;
    } else if (data.invoice_statuses_id !== '' && data.invoice_statuses_id !== null) {
      urlPara = urlPara + '&search=invoice_statuses_id:' + data.invoice_statuses_id;
    }

    // if (data.amount && data.amount !== null) {
    //   urlPara = urlPara + '&amount=' + data.amount;
    // }
    urlPara = urlPara + '&searchJoin=and';
    return this.http.get(urlPara, '');
  }

  getExpenseCategorySearch(query) {
    const urlPara = this._urlCategoryExpense + '?accounts_id=' + this.accounts_id + '&companies_id=' + this.companies_id +
      '&limit=15&orderBy=category_name&search=category_name:' + query;
    return this.http.get(urlPara, '');
  }

  sortInvoices(data) {
    let urlPara = this._urlInvoice + '?accounts_id=' + this.accounts_id + '&companies_id=' + this.companies_id +
      '&orderBy=' + data.orderBy + '&sortedBy=' + data.sortedBy + '&per_page=10';

    if (data.due_date_from !== '' && data.due_date_to !== '' && data.due_date_from !== null && data.due_date_to !== null) {
      urlPara = urlPara + '&due_date_from=' + data.due_date_from + '&due_date_to=' + data.due_date_to;
    }

    if (data.invoice_date_from !== '' && data.invoice_date_to !== '' && data.invoice_date_from !== null && data.invoice_date_to !== null) {
      urlPara = urlPara + '&invoice_date_from=' + data.invoice_date_from + '&invoice_date_to=' + data.invoice_date_to;
    }

    let x = 0;
    if (data.invoice_sequence_id !== '' && data.invoice_sequence_id !== null) {
      x = x + 1;
      urlPara = urlPara + '&search=invoice_sequence_id:' + data.invoice_sequence_id;
    } else if (data.mobile_number !== '' && data.mobile_number !== null) {
      x = x + 1;
      urlPara = urlPara + '&search=mobile_number:' + data.mobile_number;
    } else if (data.email_id !== '' && data.email_id !== null) {
      x = x + 1;
      urlPara = urlPara + '&search=email_id:' + data.email_id;
    } else if (data.recepient_name !== '' && data.recepient_name !== null) {
      x = x + 1;
      urlPara = urlPara + '&search=recepient_name:' + data.recepient_name;
    }
    if (data.invoice_types_id !== 'all') {
      if (x !== 0) {
        urlPara = urlPara + ';invoice_types_id:' + data.invoice_types_id;
      } else {
        x = x + 1;
        urlPara = urlPara + '&search=invoice_types_id:' + data.invoice_types_id;
      }
    }

    if (data.income_categories_id !== '' && typeof data.income_categories_id !== 'undefined' && x !== 0
      && data.income_categories_id !== null) {
      urlPara = urlPara + ';income_categories_id:' + data.income_categories_id;
    } else if (data.income_categories_id !== '' && typeof data.income_categories_id !== 'undefined' && data.income_categories_id !== null) {
      urlPara = urlPara + '&search=income_categories_id:' + data.income_categories_id;
    }

    if (data.invoice_statuses_id !== '' && x !== 0 && data.invoice_statuses_id !== null) {
      urlPara = urlPara + ';invoice_statuses_id:' + data.invoice_statuses_id;
    } else if (data.invoice_statuses_id !== '' && data.invoice_statuses_id !== null) {
      urlPara = urlPara + '&search=invoice_statuses_id:' + data.invoice_statuses_id;
    }

    if (data.amount && data.amount !== null) {
      urlPara = urlPara + '&amount=' + data.amount;
    }
    urlPara = urlPara + '&searchJoin=and';
    return this.http.get(urlPara, '')
  }

  GetCompanyGSTIN() {
    const urlPara = this._urlGetCompanyGSTIN + '?accounts_id=' + this.accounts_id + '&companies_id=' + this.companies_id;
    return this.http.get(urlPara, '')
  }

  getExternalPayment(data) {
    const urlPara = this._urlExternalpayment + '?accounts_id=' + this.accounts_id + '&companies_id=' + this.companies_id +
      '&contacts_id=' + data.id + '&per_page=15&orderBy=external_payments_id&sortedBy=desc';
    return this.http.get(urlPara, '')
  }

  getStopRecurring(data, id) {
    const urlPara = this._urlInvoice + '/' + id;
    return this.http.put(urlPara, data)
  }
  getCancelInvoice(data, id) {
    const urlPara = this._urlInvoice + '/' + id;
    return this.http.put(urlPara, data)
  }

  markPayment(data) {
    return this.http.post(this._urlMarkpayment, data)
  }

  // search=sac_code:99
  fileUploadOthers(file) {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    const url = this._fileUploadOthers + '?companies_id=' + this.companies_id + '&accounts_id=' + this.accounts_id;
    return this.http.post(url, formData);
  }

  getInvoicePdf(id) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.token = currentUser && currentUser.token;
    const headers = new Headers({ 'Authorization': 'Bearer' + this.token, 'Access-Control-Allow-Origin': 'no-cors' });
    const options = new RequestOptions({ headers: headers }); // responseType:ResponseContentType.ArrayBuffer
    const urlPara = this.http._base_url + this._urlInvoice + '/preview/' + id;
    return this._http.get(urlPara, options).map((response: Response) => response.json());
  }

  addCompanyTax(data) {
    return this.http.post(this._urlCompanyTax, data)
  }
  updateCompanyTax(data, id) {
    return this.http.put(this._urlCompanyTax + '/' + id, data)
  }

  // get all customer data in create invoice page
  getCustomers(query) {
    const urlPara = this._urlContactDetails + '?accounts_id=' + this.accounts_id + '&companies_id=' + this.companies_id +
      '&per_page=15&orderBy=name&search=name:' + query;
    return this.http.get(urlPara, '')
  }

  // add a customer in create invoice
  createContact(data) {
    return this.http.post(this._urlContactDetails, data)
  }

  // update a contact in create invoice
  updateContact(id, data) {
    const urlPara = this._urlContactDetails + '/' + id;
    return this.http.put(urlPara, data)
  }

  // delete a contact in create invoice
  deleteContact(data) {
    const urlPara = this._urlContactDetails + '/' + data;
    return this.http.delete(urlPara)
  }

  // create item
  createItem(data) {
    return this.http.post(this._urlItem, data)
  }

  // update item
  updateItem(id, data) {
    const urlPara = this._urlItem + '/' + id
    return this.http.put(urlPara, data)
  }

  // get all item
  getAllItem(query) {
    const urlPara = this._urlItem + '?accounts_id=' + this.accounts_id + '&companies_id=' + this.companies_id +
      '&per_page=10&orderBy=items_id&sortedBy=desc&search=item_name:' + query;
    return this.http.get(urlPara, '')
  }

  // create income category
  createIncomeCategory(data) {
    return this.http.post(this._urlCategoryIncome, data)
  }

  // getIncome category
  getIncomeCategory(query) {
    const urlPara = this._urlCategoryIncome + '?accounts_id=' +
      this.accounts_id + '&companies_id=' + this.companies_id + '&per_page=15&orderBy=category_name&search=category_name:' + query;
    return this.http.get(urlPara, '')
  }

  // get all Income category
  getAllIncomeCategory() {
    const urlPara = this._urlCategoryIncome + '?accounts_id=' + this.accounts_id +
      '&companies_id=' + this.companies_id + '&per_page=15&orderBy=category_name';
    return this.http.get(urlPara, '')
  }

  // generate invoice sequnce id
  getSequenceId(data) {
    return this.http.post(this._urlInvoiceSequence, data)
  }

  sendInvoice(data) {
    const url = this._urlInvoice + '/send';
    return this.http.post(url, data)
  }

  getCompanyTaxes() {
    const urlPara = this._urlCompanyTax + '?accounts_id=' + this.accounts_id + '&companies_id=' + this.companies_id +
      '&per_page=15&orderBy=company_taxes_id&sortedBy=desc';
    return this.http.get(urlPara, '')
  }

  getAllHSNCode() {
    return this.http.get(this._urlHSNCode, '')
  }

  getHSNCode(query) {
    const urlPara = this._urlHSNCode + '?keyword=' + query;
    return this.http.get(urlPara, '')
  }

  getHSNCodeByDesc(query) {
    const urlPara = this._urlHSNCode + '?keyword=' + query;
    return this.http.get(urlPara, '')
  }

  getAllSACCode() {
    return this.http.get(this._urlSACCode, '')
  }

  getSACCode(query) {
    const urlPara = this._urlSACCode + '?keyword=' + query;
    return this.http.get(urlPara, '')
  }

  getSACCodeByDesc(query) {
    const urlPara = this._urlSACCode + '?keyword=' + query;
    return this.http.get(urlPara, '')
  }

  createInvoice(data) {
    return this.http.post(this._urlInvoice, data)
  }


  updateInvoice(data, id) {
    const urlPara = this._urlInvoice + '/' + id;
    return this.http.put(urlPara, data);
  }

  getAllInvoicebyType(typeId) {
    if (typeId === 'all') {
      const urlPara = this._urlInvoice + '?accounts_id=' + this.accounts_id + '&companies_id=' + this.companies_id  +
        '&invoice_types_id=1:3&per_page=10&orderBy=invoices_id&sortedBy=desc'
      return this.http.get(urlPara, '');
    } else {
      if (typeId === '3') {
        const urlPara = this._urlInvoice +
          '?accounts_id=' + this.accounts_id + '&companies_id=' + this.companies_id + '&per_page=10&orderBy=invoices_id&sortedBy=desc' +
          '&search=invoice_types_id:' + typeId + ';is_recurring:1&searchJoin=and';
        return this.http.get(urlPara, '');
      } else {
        const urlPara = this._urlInvoice +
          '?accounts_id=' + this.accounts_id + '&companies_id=' + this.companies_id + '&per_page=10&orderBy=invoices_id&sortedBy=desc' +
          '&search=invoice_types_id:' + typeId;
        return this.http.get(urlPara, '');
      }

    }
  }

  getSubRecurringInvoices(id) {
    const urlPara = this._urlInvoice + '?accounts_id=' + this.accounts_id + '&companies_id=' + this.companies_id +
      '&per_page=15&orderBy=invoices_id&sortedBy=desc' + '&search=invoice_types_id:3;recurring_invoices_id:' + id + '&searchJoin=and';
    return this.http.get(urlPara, '');
  }


  getInvoiceById(id) {
    const urlPara = this._urlInvoice + '/' + id;
    return this.http.get(urlPara, '');
  }

  deleteFiles(id) {
    const url = this._deleteFiles + id;
    return this.http.delete(url);
  }

  serchreceivables(data) {
    let urlPara = this._urlSearchReceivable +
      '?accounts_id=' + this.accounts_id + '&companies_id=' + this.companies_id;
    if (data.invoice_types_id === '1') {
      urlPara = urlPara + '&invoice_types_id=1:3:4';
    } else if (data.invoice_types_id === '2') {
      urlPara = urlPara + '&invoice_types_id=4';
    } else if (data.invoice_types_id === '3') {
      urlPara = urlPara + '&invoice_types_id=1:3';
    }

    if (data.invoice_date_from !== '' && data.invoice_date_to !== '' && data.invoice_date_from != null && data.invoice_date_to != null) {
      urlPara = urlPara + '&invoice_date_from:' + data.invoice_date_from + ',invoice_date_to:' + data.invoice_date_to;
    }

    if (data.due_date_from !== '' && data.due_date_to !== '' && data.due_date_from != null && data.due_date_to != null) {
      urlPara = urlPara + '&due_date_from:' + data.due_date_from + ',due_date_to:' + data.due_date_to;
    }

    if (data.invoices_statuses_id !== '' && data.invoices_statuses_id != null) {
      urlPara = urlPara + '&search=invoice_statuses_id:' + data.invoices_statuses_id + '&searchJoin=and';
    }

    return this.http.get(urlPara, '');
  }



  // static data for address proof types
  getStateList() {
    return STATE_LIST;
  }
  getUnitList() {
    return UNIT_LIST;
  }
  getGstList() {
    return GST_LIST;
  }
  getPaymentTermList() {
    return PAYMENT_TERM_LIST;
  }
  getFrequencyList() {
    return FREQUENCY_LIST;
  }

}
