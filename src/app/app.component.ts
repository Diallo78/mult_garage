import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MainLayoutComponent } from './components/layout/main-layout.component';
import { AuthService } from './services/auth.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MainLayoutComponent],
  template: `

      <router-outlet></router-outlet>

  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: #f8fafc;
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'Gestion Multi-Garage';

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService
  ) {}

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // Auto-redirect logic can be added here
    });
  }

  isLoginPage(): boolean {
    return this.router.url === '/login' || this.router.url === '/';
  }
}