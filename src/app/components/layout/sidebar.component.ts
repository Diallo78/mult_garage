import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Toggle button visible uniquement sur mobile -->
    <button
      class="md:hidden fixed top-3 left-2 z-50 bg-transparent text-gray-800 hover:bg-gray-200 p-2 rounded transition"
      (click)="toggleSidebar()"
    >
      ☰
    </button>

    <!-- Sidebar -->
    <div
      class="fixed inset-y-0 left-0 z-40 w-64 bg-gray-800 text-white transform transition-transform duration-300 ease-in-out
             md:relative md:translate-x-0 md:flex md:min-h-screen"
      [class.-translate-x-full]="!isSidebarOpen"
    >
      <div class="p-4">
        <h2 class="text-xl font-semibold mb-6">Navigation</h2>
        <nav class="space-y-2">
          <a
            routerLink="/dashboard"
            routerLinkActive="bg-primary-600"
            class="flex items-center px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            <span class="mr-3">📊</span>
            Dashboard
          </a>

          <a
            routerLink="/clients"
            routerLinkActive="bg-primary-600"  (click)="toggleSidebar()"
            class="flex items-center px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            *ngIf="authService.canccessDashboard"
          >
            <span class="mr-3">👥</span>
            Clients
          </a>

          <a
            routerLink="/suivi"
            routerLinkActive="bg-primary-600"  (click)="toggleSidebar()"
            class="flex items-center px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            *ngIf="authService.isClient"
          >
            <span class="mr-3">👨🏻‍💻</span>
            Status Véhicule
          </a>

          <a
            routerLink="/vehicles"
            routerLinkActive="bg-primary-600"  (click)="toggleSidebar()"
            class="flex items-center px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            <span class="mr-3">🚗</span>
            Véhicules
          </a>

          <a
            routerLink="/visits"
            routerLinkActive="bg-primary-600"  (click)="toggleSidebar()"
            class="flex items-center px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            <span class="mr-3">🏥</span>
            Déclaration / Visits
          </a>

          <a
            routerLink="/diagnostics"
            routerLinkActive="bg-primary-600"  (click)="toggleSidebar()"
            class="flex items-center px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            *ngIf="authService.canAccessDiagnostics"
          >
            <span class="mr-3">🔍</span>
            Diagnostics
          </a>

          <a
            routerLink="/quotes"
            routerLinkActive="bg-primary-600"  (click)="toggleSidebar()"
            class="flex items-center px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            <span class="mr-3">💰</span>
            Devis
          </a>

          <a
            routerLink="/interventions"
            routerLinkActive="bg-primary-600"  (click)="toggleSidebar()"
            class="flex items-center px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            *ngIf="authService.canAccessInterventions"
          >
            <span class="mr-3">🔧</span>
            Interventions
          </a>

          <a
            routerLink="/invoices"
            routerLinkActive="bg-primary-600"  (click)="toggleSidebar()"
            class="flex items-center px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            <span class="mr-3">🧾</span>
            Facture
          </a>

          <a
            routerLink="/payments"
            routerLinkActive="bg-primary-600"  (click)="toggleSidebar()"
            class="flex items-center px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            *ngIf="authService.canAccessPayments"
          >
            <span class="mr-3">💳</span>
            Payments
          </a>

          <a
            routerLink="/reports"
            routerLinkActive="bg-primary-600"  (click)="toggleSidebar()"
            class="flex items-center px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            *ngIf="authService.canAccessReports"
          >
            <span class="mr-3">📈</span>
            Reports
          </a>

          <a
            routerLink="/stockDashboard"
            routerLinkActive="bg-primary-600"  (click)="toggleSidebar()"
            class="flex items-center px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            *ngIf="authService.canAccessPersonnel"
          >
            <span class="mr-3">🗄️</span>
            Stocks
          </a>

          <a
            routerLink="/personnel"
            routerLinkActive="bg-primary-600"  (click)="toggleSidebar()"
            class="flex items-center px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            *ngIf="authService.canAccessPersonnel"
          >
            <span class="mr-3">👨🏻‍🔧</span>
            Personnel
          </a>

          <a
            routerLink="/garage-setup"
            routerLinkActive="bg-primary-600"  (click)="toggleSidebar()"
            class="flex items-center px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            *ngIf="authService.canAccessSuperAdmin"
          >
            <span class="mr-3">🛠️</span>
            Garage
          </a>
        </nav>
      </div>
    </div>
  `,
})
export class SidebarComponent {
  currentUser$: Observable<User | null>;
  isSidebarOpen = false;
  constructor(public authService: AuthService) {
    this.currentUser$ = this.authService.currentUser$;
  }
  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}
