import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
 
@Injectable()
export class OnboardAuthGuard implements CanActivate {
 
    constructor(private router: Router) { }
 
    canActivate() {
        if (localStorage.getItem('currentUser')) {
            // logged in so return true
            var currentUser = JSON.parse(localStorage.getItem('currentUser'));
            var exp_token = currentUser.data.meta.claims.exp;
            var d = new Date();
            var n = (d.getTime())/1000;
            if(exp_token > n){
                //valid token
                return true;
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