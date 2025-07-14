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
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <div class="mx-auto h-12 w-12 text-4xl text-center">🚗</div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your garage account
          </h2>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="mt-8 space-y-6">
          <div class="space-y-4">
            <div>
              <label for="email" class="form-label">Email address</label>
              <input
                id="email"
                type="email"
                formControlName="email"
                class="form-input"
                [class.border-red-500]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
                placeholder="Enter your email"
              />
              <div *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched" class="mt-1 text-sm text-red-600">
                Please enter a valid email address
              </div>
            </div>

            <div>
              <label for="password" class="form-label">Password</label>
              <input
                id="password"
                type="password"
                formControlName="password"
                class="form-input"
                [class.border-red-500]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
                placeholder="Enter your password"
              />
              <div *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" class="mt-1 text-sm text-red-600">
                Password is required
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              [disabled]="loginForm.invalid || isLoading"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              <span *ngIf="isLoading" class="mr-2">Loading...</span>
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly notificationService: NotificationService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) return;

    this.isLoading = true;

    try {
      const { email, password } = this.loginForm.value;
      await this.authService.signIn(email, password);
      this.notificationService.showSuccess('Successfully signed in!');
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      this.notificationService.showError(error.message || 'Failed to sign in');
    } finally {
      this.isLoading = false;
    }
  }
}