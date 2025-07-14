import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { NavbarComponent } from './navbar.component';
import { NotificationComponent } from '../shared/notification.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, SidebarComponent, NotificationComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <app-navbar></app-navbar>
      <div class="flex">
        <app-sidebar></app-sidebar>
        <main class="flex-1 p-6">
          <router-outlet></router-outlet>
        </main>
      </div>
      <!-- <app-notification></app-notification> -->
    </div>
  `
})
export class MainLayoutComponent {}