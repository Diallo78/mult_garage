import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div
      class="max-w-xl mx-auto p-6 mt-10 bg-white shadow-md rounded-lg border border-gray-200 animate-fade-in"
    >
      <h2 class="text-2xl font-semibold text-primary-700 mb-6">
        🧑‍💼 Mon Profil
      </h2>

      <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="space-y-4">
        <!-- Nom complet (lecture seule) -->
        <div>
          <label class="form-label">Nom complet</label>
          <input
            formControlName="displayName"
            type="text"
            class="form-input bg-gray-100 cursor-not-allowed"
            [readonly]="true"
            [attr.disabled]="true"
          />
        </div>

        <!-- Email (lecture seule) -->
        <div>
          <label class="form-label">Email</label>
          <input
            formControlName="email"
            type="email"
            class="form-input bg-gray-100 cursor-not-allowed"
            [readonly]="true"
            [attr.disabled]="true"
          />
        </div>

        <!-- Mot de passe (modifiable) -->
        <div>
          <label class="form-label">Mot de passe(Changer / modifier)</label>
          <input
            formControlName="password"
            type="password"
            class="form-input"
            placeholder="Nouveau mot de passe"
          />
          <p
            *ngIf="
              profileForm.get('password')?.invalid &&
              profileForm.get('password')?.touched
            "
            class="text-red-500 text-sm"
          >
            Le mot de passe doit contenir au moins 6 caractères
          </p>
        </div>

        <button
          type="submit"
          class="btn-primary w-full mt-4"
          [disabled]="
            profileForm.invalid || !profileForm.get('password')?.value
          "
        >
          💾 Mettre à jour le mot de passe
        </button>
      </form>
    </div>
  `,
  styles: [
    `
      .form-input[disabled] {
        opacity: 1;
      }
    `,
  ],
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);

  constructor() {
    this.profileForm = this.fb.group({
      displayName: [{ value: '', disabled: true }],
      email: [{ value: '', disabled: true }],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit() {
    const u = this.authService.getCurrentUser();
    if (u) {
      this.profileForm.patchValue({
        displayName: u.displayName || '',
        email: u.email || '',
        password: '',
      });
    }
  }

  async onSubmit(): Promise<void> {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    try {
      await this.authService.updateUserPassword(
        this.profileForm.value.password
      );
      this.profileForm.get('password')?.reset();
      this.notificationService.showSuccess(
        'Mot de passe mis à jour avec succès.'
      );
    } catch (error) {
      console.error(error);
      this.notificationService.showError(
        'Échec de la mise à jour du mot de passe.'
      );
    }
  }
}
