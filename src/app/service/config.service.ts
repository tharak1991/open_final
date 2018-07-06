import { Injectable } from '@angular/core';

@Injectable()
export class ConfigService {
  public _base_url = 'http://staging.bankopen.co/api/';
  public _intercom_id = 'fq4nevwt';
  public _mixpanel_id = '2ff23e024646457506a65b329c087772';
  constructor() {}

}
