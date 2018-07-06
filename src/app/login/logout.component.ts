import { Component, OnInit,ElementRef,ViewChild,Renderer } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../service/login.service';
import { ConfigService } from '../service/config.service';
declare let Intercom: any;

@Component({
  selector: 'app-login',
  template: 'Logout',
  providers: [LoginService]
})
export class LogoutComponent implements OnInit {

  constructor(private _config: ConfigService,private _router:Router, private _httpService :LoginService) {
  }

	ngOnInit() {

        setTimeout(() => {
          Intercom('shutdown');
          Intercom('boot', {app_id: this._config._intercom_id})
        }, 2000)

        
        this._httpService.logout();
        this._router.navigate(['/login']);
        
	}

}
