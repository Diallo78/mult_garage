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
    <div class="bg-gray-800 text-white w-64 min-h-screen">
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
            routerLinkActive="bg-primary-600"
            class="flex items-center px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            *ngIf="this.authService.canccessDashboard"
          >
            <span class="mr-3">👥</span>
            Clients
          </a>

          <a
            routerLink="/suivi"
            routerLinkActive="bg-primary-600"
            class="flex items-center px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            *ngIf="this.authService.isClient"
          >
            <span class="mr-3">👨🏻‍💻</span>
            Status Vehicul
          </a>

          <a
            routerLink="/vehicles"
            routerLinkActive="bg-primary-600"
            class="flex items-center px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            <span class="mr-3">🚗</span>
            Véhicules
          </a>

          <a
            routerLink="/visits"
            routerLinkActive="bg-primary-600"
            class="flex items-center px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            <span class="mr-3">🏥</span>
            Déclaration / Visits
          </a>

          <a
            routerLink="/diagnostics"
            routerLinkActive="bg-primary-600"
            class="flex items-center px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            *ngIf="this.authService.canAccessDiagnostics"
          >
            <span class="mr-3">🔍</span>
            Diagnostics
          </a>

          <a
            routerLink="/quotes"
            routerLinkActive="bg-primary-600"
            class="flex items-center px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            <span class="mr-3">💰</span>
            Devis
          </a>

          <a
            routerLink="/interventions"
            routerLinkActive="bg-primary-600"
            class="flex items-center px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            *ngIf="this.authService.canAccessInterventions"
          >
            <span class="mr-3">🔧</span>
            Interventions
          </a>

          <a
            routerLink="/invoices"
            routerLinkActive="bg-primary-600"
            class="flex items-center px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            <span class="mr-3">🧾</span>
            Facture
          </a>

          <a
            routerLink="/payments"
            routerLinkActive="bg-primary-600"
            class="flex items-center px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            *ngIf="this.authService.canAccessPayments"
          >
            <span class="mr-3">💳</span>
            Payments
          </a>

          <a
            routerLink="/reports"
            routerLinkActive="bg-primary-600"
            class="flex items-center px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            *ngIf="this.authService.canAccessReports"
          >
            <span class="mr-3">📈</span>
            Reports
          </a>

          <a
            routerLink="/stockDashboard"
            routerLinkActive="bg-primary-600"
            class="flex items-center px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            *ngIf="this.authService.canAccessPersonnel"
          >
            <span class="mr-3"> 🗄️ </span>
            Stocks
          </a>

          <a
            routerLink="/personnel"
            routerLinkActive="bg-primary-600"
            class="flex items-center px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            *ngIf="this.authService.canAccessPersonnel"
          >
            <span class="mr-3"> 👨🏻‍🔧 </span>
            Personnel
          </a>

          <a
            routerLink="/garage-setup"
            routerLinkActive="bg-primary-600"
            class="flex items-center px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            *ngIf="this.authService.canAccessSuperAdmin"
          >
            <span class="mr-3"> 🛠️ </span>
            Garage
          </a>
        </nav>
      </div>
    </div>
  `
})
export class SidebarComponent {
  currentUser$: Observable<User | null>;

  constructor(public authService: AuthService) {
    this.currentUser$ = this.authService.currentUser$;
  }


}