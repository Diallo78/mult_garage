import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { map, take } from 'rxjs/operators';
import { UserRole } from '../models/user.model';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  canActivate(allowedRoles: UserRole[]) {
    return this.authService.currentUser$.pipe(
      take(1),
      map(user => {
        if (user && allowedRoles.includes(user.role)) {
          return true;
        } else {
          this.router.navigate(['/unauthorized']);
          return false;
        }
      })
    );
  }
}