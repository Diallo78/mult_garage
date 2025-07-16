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
    return this.authService.currentUser$.pipe(
      take(1),
      map(user => {
        if (user) {
          console.log(user);

          return true;
        } else {
          this.router.navigate(['/login']);
          return false;
        }
      })
    );
  }
}

// export class AuthGuard {
//   constructor(
//     private readonly authService: AuthService,
//     private readonly router: Router
//   ) {}

//   canActivate() {
//     return this.authService.currentUser$.pipe(
//       take(1),
//       map(user => {
//         console.log(user);

//         if (user) {
//           // Redirect clients to client portal
//           if (user.role === 'Client' && !window.location.pathname.startsWith('/client')) {
//             this.router.navigate(['/client/dashboard']);
//             return false;
//           }
//           // Redirect non-clients away from client portal
//           if (user.role !== 'Client' && window.location.pathname.startsWith('/client')) {
//             this.router.navigate(['/dashboard']);
//             return false;
//           }
//           return true;
//         } else {
//           this.router.navigate(['/login']);
//           return false;
//         }
//       })
//     );
//   }
// }