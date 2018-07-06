import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
 
@Injectable()
export class AuthGuard implements CanActivate {
 
    constructor(private router: Router) { }
 
    canActivate() {
        if (localStorage.getItem('currentUser')) {
            // logged in so return true
            var currentUser = JSON.parse(localStorage.getItem('currentUser'));
            var exp_token = currentUser.data.meta.claims.exp;
            var d = new Date();
            var n = (d.getTime())/1000;
            if(exp_token > n){
                // valid token
               // return true;
                    if( typeof currentUser.account_details.company.data !='undefined' && typeof currentUser.account_details.company.data[0].mob_master !='undefined' && typeof currentUser.account_details.company.data[0].mob_master.data.mob_business_types_id !='undefined')
                    {
                        let user_type = currentUser && currentUser.account_details.company.data[0].mob_master.data.mob_business_types_id;
                        let current_step = currentUser && currentUser.account_details.company.data[0].mob_master.data.current_step;
                        let current_sub_step = currentUser && currentUser.account_details.company.data[0].mob_master.data.current_sub_step;
                    
                            if (current_step == 4 && current_sub_step == 2) {
                                //valid token
                                return true;
                            } else {
                                if (user_type == 1) {
                                    this.router.navigate(['/onboard-individual']);
                                } else if (user_type == 2) {
                                    this.router.navigate(['/onboard-proprietership']);
                                } else if (user_type == 3) {
                                    this.router.navigate(['/onboard-partnership']);
                                } else if (user_type == 4) {
                                    this.router.navigate(['/onboard-private-limited']);
                                } else if (user_type == 5) {
                                    this.router.navigate(['/onboard-trust-or-societies']);
                                }
                            }
                    } else {
                        this.router.navigate(['/onboard-individual']);
                        return false;
                    }
                
            }else{
                // token expired
                this.router.navigate(['/logout']);
                return false;
            }
        }
        // not logged in so redirect to login page
        this.router.navigate(['/login']);
        return false;
    }
}
