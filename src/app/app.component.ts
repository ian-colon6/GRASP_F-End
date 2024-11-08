import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'GRASP-FrontEnd';

  // Control visibility of sidebar and map
  showSidebarAndMap = true;

  formFields = {
    signUp: {
      username: {
        order: 1
      },
      email: {
        order: 2
      },
      password: {
        order: 5
      },
      confirm_password: {
        order: 6
      }
    },
  };

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Subscribe to router events to check the current route
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        // Hide sidebar and map when on the About Us page and My Profile
        this.showSidebarAndMap = event.url !== '/about-us' && event.url !== '/my-profile';
      });
  }
}
