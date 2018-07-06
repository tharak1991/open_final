import { Injectable } from '@angular/core';
import { Http, Response, HttpModule, Headers, RequestOptions, BaseRequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Rx';
import { BaseService } from './base.service';

@Injectable()
export class ReceiveService {
    public token: string;
    public companies_id;
    public accounts_id;

    private loggedIn = false;

    private _urlDownloadTemplate = 'quick_collect/bulk/download/empty';
    private _uploadfile = 'file/qc';
    private _urlQuickCollectBulkUplod = 'quick_collect/bulk/upload';
    private _urlQuickCollectBulkList = 'quick_collect/bulk/list';
    private _urlQuickCollectBulkDownload = 'quick_collect/bulk/download';

    constructor(private _http: Http, private http: BaseService) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.companies_id = currentUser && currentUser.company_details.companies_id;
        this.accounts_id = currentUser && currentUser.account_details.accounts_id;
    }

    getTemplate() {
        const urlPara = this._urlDownloadTemplate;
        return this.http.get(urlPara, '')
    }

    fileUploadOthers(file) {
        const formData: FormData = new FormData();
        formData.append('file', file, file.name);
        const url = this._uploadfile + '?companies_id=' + this.companies_id + '&accounts_id=' + this.accounts_id;
        return this.http.post(url, formData);
    }

    uploadBulkCollect(data) {
        const url = this._urlQuickCollectBulkUplod;
        data.accounts_id = this.accounts_id;
        data.companies_id = this.companies_id;

        return this.http.post(url, data);
    }

    getBulkCollectList() {
        const url = this._urlQuickCollectBulkList + '?companies_id=' + this.companies_id + '&accounts_id=' + this.accounts_id;
        return this.http.get(url, '');
    }

    filterBulkCollection(data) {

        let urlPara = this._urlQuickCollectBulkList + '?accounts_id=' + this.accounts_id +
            '&companies_id=' + this.companies_id;

        if (data.filename !== '' && data.filename !== null) {
            urlPara = urlPara + '&filename=' + data.filename;
        }

        if (data.batch_id !== '' && data.batch_id !== null) {
            urlPara = urlPara + '&batch_id=' + data.batch_id;
        }

        if (data.status !== '' && data.status !== null) {
            urlPara = urlPara + '&status=' + data.status;
        }


        if (data.uploaded_date_from !== '' && data.uploaded_date_to !== ''
        && data.uploaded_date_from !== null && data.uploaded_date_to !== null) {
            urlPara = urlPara + '&uploaded_date_from=' + data.uploaded_date_from + '&uploaded_date_to=' + data.uploaded_date_to;
        }

        if (data.total_value_equal !== '' && data.total_value_equal !== null) {
            urlPara = urlPara + '&total_value_equal=' + data.total_value_equal;
        }

        if (data.total_value_greater !== '' && data.total_value_greater !== null) {
            urlPara = urlPara + '&total_value_greater=' + data.total_value_greater;
        }

        if (data.total_value_lesser !== '' && data.total_value_lesser !== null) {
            urlPara = urlPara + '&total_value_lesser=' + data.total_value_lesser;
        }

        return this.http.get(urlPara, '');
    }

    getBulkCollectDownloadFailed(data) {
        const url = this._urlQuickCollectBulkDownload + '?companies_id=' + this.companies_id +
        '&accounts_id=' + this.accounts_id + '&status=' + data.status + '&batch_id=' + data.batch_id;
        return this.http.get(url, '');
    }


}
