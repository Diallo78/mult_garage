import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NavbarComponent } from './navbar.component';
import { SidebarComponent } from './sidebar.component';
import { NotificationComponent } from '../shared/notification.component';
import { Observable } from 'rxjs';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NavbarComponent,
    SidebarComponent,
    NotificationComponent,
  ],
  //   template: `
  //   <div class="min-h-screen bg-gray-50">
  //     <app-navbar></app-navbar>
  //     <div class="flex">
  //       <app-sidebar></app-sidebar>
  //       <main class="flex-1 p-6">
  //         <router-outlet></router-outlet>
  //       </main>
  //     </div>
  //     <!-- <app-notification></app-notification> -->
  //   </div>
  // `
  // })
  // export class MainLayoutComponent {

  // } v2 ci-dessous

  template: `
    <div class="min-h-screen bg-gray-50">
      <app-navbar></app-navbar>
      <div
        class="flex flex-col lg:flex-row"
        *ngIf="currentUser$ | async as user"
      >
        <app-sidebar></app-sidebar>
        <main
          class="flex-1 p-3 sm:p-4 lg:p-6 transition-all duration-300 ease-in-out"
          [class.ml-0]="user.role === 'Client'"
          [class.lg:ml-0]="user.role === 'Client'"
        >
          <router-outlet></router-outlet>
        </main>
      </div>
      <app-notification></app-notification>
    </div>
  `,
})
export class MainLayoutComponent {
  currentUser$: Observable<User | null>;

  constructor(private authService: AuthService) {
    this.currentUser$ = this.authService.currentUser$;
  }
}
