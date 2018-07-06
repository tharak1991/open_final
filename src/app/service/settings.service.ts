import { Injectable } from '@angular/core';
import { Http, Response, HttpModule, Headers, RequestOptions, BaseRequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Rx';
import { BaseService } from './base.service';
import { FREQUENCY_LIST } from '../mock/frequency';

@Injectable()
export class SettingService {
    public token: string;
    public companies_id;
    public accounts_id;

    constructor(private _http: Http, private http: BaseService) {
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.companies_id = currentUser && currentUser.company_details.companies_id;
        this.accounts_id = currentUser && currentUser.account_details.accounts_id;
    }

    private _urlgetSettings: string = "settings";

    private _fileUploadOthers: string = "file/others";

    private _urlChangepassword: string = "users/reset_password";

    getSettings() {
        let urlPara = this._urlgetSettings + "?companies_id=" + this.companies_id;
        return this.http.get(urlPara, '');
    }
    updateSettings(data) {
        return this.http.put(this._urlgetSettings, data);
    }

    changePassword(data) {
        return this.http.post(this._urlChangepassword, data);
    }

    fileUploadOthers(file) {
        let formData: FormData = new FormData();
        formData.append('file', file, file.name);
        let url = this._fileUploadOthers + "?companies_id=" + this.companies_id + "&accounts_id=" + this.accounts_id;
        return this.http.post(url, formData);
    }

    getFrequencyList() {
        return FREQUENCY_LIST;
    }

}
