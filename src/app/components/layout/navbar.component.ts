import { Component} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="bg-white shadow-lg border-b border-gray-200">
      <div class="w-full px-0 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <div class="flex-shrink-0 flex items-center">
              <div class="text-2xl font-bold text-primary-600">🚗 <span class="ml-1">GarageManager</span></div>
            </div>
          </div>

          <div class="flex items-center space-x-4">
            <div class="relative" *ngIf="currentUser$ | async as user">
              <button
                (click)="toggleDropdown()"
                class="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <div class="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <span class="text-white text-sm font-medium">
                    {{ user.displayName.charAt(0).toUpperCase() }}
                  </span>
                </div>
                <div class="ml-2">
                  <div class="text-sm font-medium text-gray-900">{{ user.displayName }}</div>
                  <div class="text-xs text-gray-500">{{ user.role }}</div>
                </div>
              </button>

              <div
                *ngIf="showDropdown"
                class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
              >
                <a routerLink="/garage-setup" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</a>
                <a enable = false routerLink="/garage-setup" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Paramètre</a>
                <button
                  (click)="signOut()"
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                Se déconnecter
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  currentUser$: Observable<User | null>;
  showDropdown = false;

  constructor(private readonly authService: AuthService) {
    this.currentUser$ = this.authService.currentUser$;
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  async signOut(): Promise<void> {
    try {
      await this.authService.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }
}