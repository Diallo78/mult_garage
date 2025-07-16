import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';


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
          >
            <span class="mr-3">👥</span>
            Clients
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
            Visites
          </a>

          <a
            routerLink="/diagnostics"
            routerLinkActive="bg-primary-600"
            class="flex items-center px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            *ngIf="canAccessDiagnostics"
          >
            <span class="mr-3">🔍</span>
            Diagnostic
          </a>

          <a
            routerLink="/quotes"
            routerLinkActive="bg-primary-600"
            class="flex items-center px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            <span class="mr-3">💰</span>
            Citations
          </a>

          <a
            routerLink="/interventions"
            routerLinkActive="bg-primary-600"
            class="flex items-center px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            *ngIf="canAccessInterventions"
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
            Factures
          </a>

          <a
            routerLink="/payments"
            routerLinkActive="bg-primary-600"
            class="flex items-center px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            *ngIf="canAccessPayments"
          >
            <span class="mr-3">💳</span>
            Paiements
          </a>

          <a
            routerLink="/reports"
            routerLinkActive="bg-primary-600"
            class="flex items-center px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            *ngIf="canAccessReports"
          >
            <span class="mr-3">📈</span>
            Rapports
          </a>

          <a
            routerLink="/personnel"
            routerLinkActive="bg-primary-600"
            class="flex items-center px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            *ngIf="canAccessPersonnel"
          >
            <span class="mr-3">👨‍💼</span>
            Personnel
          </a>
        </nav>
      </div>
    </div>
  `
})
export class SidebarComponent {
  currentUser$: Observable<User | null>;

  constructor(private readonly authService: AuthService) {
    this.currentUser$ = this.authService.currentUser$;
  }

  get canAccessDiagnostics(): boolean {
    return this.authService.hasAnyRole(['AdminGarage', 'Technician']);
  }

  get canAccessInterventions(): boolean {
    return this.authService.hasAnyRole(['AdminGarage', 'Technician']);
  }

  get canAccessPayments(): boolean {
    return this.authService.hasAnyRole(['AdminGarage', 'Accountant', 'Receptionist']);
  }

  get canAccessReports(): boolean {
    return this.authService.hasAnyRole(['AdminGarage', 'Accountant']);
  }

  get canAccessPersonnel(): boolean {
    return this.authService.hasAnyRole(['AdminGarage', 'Manager']);
  }
}