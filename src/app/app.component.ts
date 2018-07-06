import { Component,OnInit } from '@angular/core';
import { Router,NavigationEnd } from '@angular/router';
declare var ga: any;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  constructor(private router: Router) { 
    router.events.distinctUntilChanged((previous: any, current: any) => {
        if(current instanceof NavigationEnd) {
            return previous.url === current.url;
        }
        return true;
    }).subscribe((x: any) => {
        //console.log('router.change', x);
        ga('send', 'pageview', x.url);
    });
  }

  ngOnInit() {
      this.router.events.subscribe((evt) => {
          if (!(evt instanceof NavigationEnd)) {
              return;
          }
          window.scrollTo(0, 0)
      });
  }
}
