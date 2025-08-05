import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div
      class="min-h-screen bg-gradient-to-br from-cyan-200 to-blue-400 flex items-center justify-center p-4 font-sans"
    >
      <div
        class="w-full max-w-4xl flex flex-row rounded-2xl shadow-2xl overflow-hidden bg-white"
      >
        <!-- Form Section -->
        <div class="w-full lg:w-1/2 bg-white p-8 sm:p-12 space-y-8">
          <div class="flex items-center space-x-3">
            <img src="image/logo1.png" alt="Logo" class="h-10 w-auto" />
            <span class="text-2xl font-bold text-gray-700">Multi-Garage</span>
          </div>

          <div>
            <h1 class="text-4xl font-bold text-gray-800">Login</h1>
            <p class="text-gray-500 mt-2">
              Bienvenue ! Veuillez vous connecter.
            </p>
          </div>

          <form
            [formGroup]="loginForm"
            (ngSubmit)="onSubmit()"
            class="space-y-7"
          >
            <div class="relative">
              <label
                for="email"
                class="font-semibold text-gray-500 text-xs tracking-widest uppercase"
                >Adresse Email</label
              >
              <input
                id="email"
                type="email"
                formControlName="email"
                class="w-full bg-transparent border-b-2 border-gray-200 focus:border-blue-500 outline-none pt-2 pb-1 text-gray-700 transition-colors duration-300"
                placeholder="votre@email.com"
              />
            </div>

            <div class="relative">
              <label
                for="password"
                class="font-semibold text-gray-500 text-xs tracking-widest uppercase"
                >Mot de passe</label
              >
              <input
                id="password"
                type="password"
                formControlName="password"
                class="w-full bg-transparent border-b-2 border-gray-200 focus:border-blue-500 outline-none pt-2 pb-1 text-gray-700 transition-colors duration-300"
                placeholder="••••••••"
              />
            </div>

            <div class="text-right" *ngIf="_message">
              <a
                href="#"
                class="text-sm text-gray-500 hover:text-blue-600 hover:underline"
                >{{_message}}</a
              >
            </div>

            <div>
              <button
                type="submit"
                [disabled]="loginForm.invalid || isLoading"
                class="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-400 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <span *ngIf="!isLoading">LOGIN</span>
                <span
                  *ngIf="isLoading"
                  class="flex items-center justify-center"
                >
                  <svg
                    class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Connexion...
                </span>
              </button>
            </div>
          </form>
        </div>

        <!-- Illustration Section -->
        <div
          class="hidden lg:flex w-1/2 bg-gradient-to-br from-cyan-400 to-blue-600 p-12 flex-col items-center justify-center text-white text-center relative overflow-hidden"
        >
          <div
            class="absolute -bottom-20 -right-20 w-72 h-72 bg-blue-400 rounded-full opacity-50"
          ></div>
          <div
            class="absolute -top-24 -left-16 w-60 h-60 bg-cyan-300 rounded-full opacity-50"
          ></div>

          <div class="z-10">
            <div
              class="border-4 border-white rounded-full p-2 inline-block mb-6"
            >
              <svg
                class="h-20 w-20"
                enable-background="new 0 0 24 24"
                viewBox="0 0 24 24"
                fill="white"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g>
                  <path
                    d="m21.533 11.467h-1.066v-1.067c0-1.178-.955-2.133-2.133-2.133h-1.067v-1.067c0-1.178-.955-2.133-2.133-2.133h-4.267c-1.178 0-2.133.955-2.133 2.133v1.067h-1.067c-1.178 0-2.133.955-2.133 2.133v1.067h-1.067c-.828 0-1.5.672-1.5 1.5v7c0 .828.672 1.5 1.5 1.5h1.067v1.066c0 .589.478 1.067 1.067 1.067h14.933c.589 0 1.067-.478 1.067-1.067v-1.066h1.067c.828 0 1.5-.672 1.5-1.5v-7c0-.828-.672-1.5-1.5-1.5zm-3.2 9.533h-12.8v-1.066c0-.589-.478-1.067-1.067-1.067h-1.067v-5h2.133c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5h-2.133v-1.067c0-.589.478-1.067 1.067-1.067h1.067v-1.066c0-.589.478-1.067 1.067-1.067h4.267c.589 0 1.067.478 1.067 1.067v1.066h1.067c.589 0 1.067.478 1.067 1.067v1.067h1.067c.589 0 1.067.478 1.067 1.067v5.333h1.067c.589 0 1.067.478 1.067 1.067v1.066h-1.067c-.589 0-1.067.478-1.067 1.067z"
                  />
                  <path
                    d="m14.333 15.8h1.167c.276 0 .5.224.5.5s-.224.5-.5.5h-1.167c-.276 0-.5-.224-.5-.5s.224-.5.5-.5z"
                  />
                  <path
                    d="m14.333 12.8h1.167c.276 0 .5.224.5.5s-.224.5-.5.5h-1.167c-.276 0-.5-.224-.5-.5s.224-.5.5-.5z"
                  />
                  <path
                    d="m11.333 15.8h1.167c.276 0 .5.224.5.5s-.224.5-.5.5h-1.167c-.276 0-.5-.224-.5-.5s.224-.5.5-.5z"
                  />
                  <path
                    d="m11.333 12.8h1.167c.276 0 .5.224.5.5s-.224.5-.5.5h-1.167c-.276 0-.5-.224-.5-.5s.224-.5.5-.5z"
                  />
                  <path
                    d="m8.333 15.8h1.167c.276 0 .5.224.5.5s-.224.5-.5.5h-1.167c-.276 0-.5-.224-.5-.5s.224-.5.5-.5z"
                  />
                  <path
                    d="m8.333 12.8h1.167c.276 0 .5.224.5.5s-.224.5-.5.5h-1.167c-.276 0-.5-.224-.5-.5s.224-.5.5-.5z"
                  />
                </g>
              </svg>
            </div>
            <h2 class="text-3xl font-bold mb-2">Gestion Centralisée</h2>
            <p class="max-w-sm">
              Gérez tous vos garages depuis une seule interface. Simple, rapide
              et efficace.
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

      :host {
        font-family: 'Poppins', sans-serif;
      }
    `,
  ],
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  _message = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly notificationService: NotificationService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.notificationService.showError(
        'Veuillez remplir tous les champs correctement'
      );
      return;
    }

    this.isLoading = true;

    try {
      const { email, password } = this.loginForm.value;
      await this.authService.signIn(email, password);

      this.notificationService.showSuccess('Connexion réussie !');
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      // Gestion centralisée des erreurs
      switch (error.code) {
        case 'auth/invalid-email':
          this._message = "Format d'email invalide";
          break;
        case 'auth/user-disabled':
          this._message = 'Compte désactivé';
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          this._message = 'Email ou mot de passe incorrect';
          break;
        case 'auth/too-many-requests':
          this._message = 'Trop de tentatives. Réessayez plus tard';
          break;
        case 'auth/network-request-failed':
          this._message = 'Problème de connexion internet';
          break;
        default:
          this._message = error.message || 'Erreur inconnue';
      }

    } finally {
      this.isLoading = false;
    }
  }
}