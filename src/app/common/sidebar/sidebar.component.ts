import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
declare let mixpanel: any;
declare let Intercom: any;

@Component({
  selector: 'sidebar',
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent implements OnInit {

  constructor(public router: Router) {}
  ngOnInit() {
  }

  hrefClick(data){
    mixpanel.track(
      data,
      {"menu": "click"}
    );
    Intercom('trackEvent', data);
    
  }

}
