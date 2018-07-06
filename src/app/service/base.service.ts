import { Injectable } from '@angular/core';
import { Http, Response, HttpModule, Headers, RequestOptions, BaseRequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { ConfigService } from './config.service';
import {Observable} from 'rxjs/Rx';

@Injectable()
export class BaseService {
  public token: string;
  public _base_url: string = this._config._base_url;
  
  constructor(private _http: Http,private _config: ConfigService) {
  }

  get(url,data){
    var currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.token = currentUser && currentUser.token;
    let headers = new Headers({'Authorization':'Bearer'+this.token});
    
    let options = new RequestOptions({headers:headers});
    return this._http.get(this._base_url+url,options)
    .map((response:Response)=>response.json());
  }
  post(url,data){
    var currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.token = currentUser && currentUser.token;
    let headers = new Headers({'Authorization':'Bearer'+this.token});
    let options = new RequestOptions({headers:headers});
    return this._http.post(this._base_url+url,data,options)
    .map((response:Response)=>response.json());
  }
  put(url,data){
    var currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.token = currentUser && currentUser.token;
    let headers = new Headers({'Authorization':'Bearer'+this.token});
    let options = new RequestOptions({headers:headers});
    return this._http.put(this._base_url+url,data,options)
    .map((response:Response)=>response.json());
  }

  delete(url){
    var currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.token = currentUser && currentUser.token;
    let headers = new Headers({'Authorization':'Bearer'+this.token});
    let options = new RequestOptions({headers:headers});
    return this._http.delete(this._base_url+url,options)
    .map((response:Response)=>response.json());
  }

}


