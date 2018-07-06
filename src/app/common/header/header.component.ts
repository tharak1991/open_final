import { Component, OnInit } from '@angular/core';
declare let mixpanel: any;
declare let Intercom: any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {
  public fname;
  public lname;
  public name;
  public header_state=false;
  constructor() {
    var currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.fname = currentUser && currentUser.data.data.first_name;
    this.lname = currentUser && currentUser.data.data.last_name;
    this.name = (this.fname.charAt(0)+this.lname.charAt(0)).toUpperCase();
   // this.name = this.lname.charAt(0);

    if( typeof currentUser.account_details.company.data !='undefined' && typeof currentUser.account_details.company.data[0].mob_master !='undefined' && typeof currentUser.account_details.company.data[0].mob_master.data.mob_business_types_id !='undefined')
    {
        let current_step = currentUser && currentUser.account_details.company.data[0].mob_master.data.current_step;
        let current_sub_step = currentUser && currentUser.account_details.company.data[0].mob_master.data.current_sub_step;
        if (current_step == 4 && current_sub_step == 2) {
            this.header_state=true;
        }
    }
    
  }
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
