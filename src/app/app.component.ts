import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  showSidebar = true;
  private noSidebarRoutes = ['/login', '/register']; 

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.showSidebar = !this.noSidebarRoutes.includes(event.urlAfterRedirects);
      }
    });
  }
}
