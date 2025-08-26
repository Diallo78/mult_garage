import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  canActivate() {
    // Vérifier d'abord si un garageId existe dans localStorage
    // Ce qui indique qu'un utilisateur était connecté précédemment
    const garageId = localStorage.getItem('garageId');
    
    return this.authService.currentUser$.pipe(
      take(1),
      map(user => {
        if (user) {
          return true;
        } else if (garageId) {
          // Si garageId existe mais l'utilisateur n'est pas encore chargé,
          // permettre l'accès et laisser le service d'authentification gérer l'état
          return true;
        } else {
          this.router.navigate(['/login']);
          return false;
        }
      })
    );
  }
  
}
