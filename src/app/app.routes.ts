import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },

  {
    path: 'login',
    loadComponent: () =>
      import('./components/auth/login.component').then((m) => m.LoginComponent),
  },
  // Client Portal Routes
  {
    path: 'client',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./components/client-portal/client-dashboard.component').then(
            (m) => m.ClientDashboardComponent
          ),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    loadComponent: () =>
      import('./components/layout/main-layout.component').then(
        (m) => m.MainLayoutComponent
      ),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./components/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: 'clients',
        loadComponent: () =>
          import('./components/clients/client-list.component').then(
            (m) => m.ClientListComponent
          ),
      },
      {
        path: 'clients/new',
        loadComponent: () =>
          import('./components/clients/client-form.component').then(
            (m) => m.ClientFormComponent
          ),
      },
      {
        path: 'clients/:id',
        loadComponent: () =>
          import('./components/clients/client-detail.component').then(
            (m) => m.ClientDetailComponent
          ),
      },
      {
        path: 'clients/:id/edit',
        loadComponent: () =>
          import('./components/clients/client-form.component').then(
            (m) => m.ClientFormComponent
          ),
      },
      {
        path: 'suivi',
        loadComponent: () =>
          import('./components/client-portal/suivi-vehicule.component').then(
            (m) => m.SuiviVehicule
          ),
      },
      {
        path: 'vehicles',
        loadComponent: () =>
          import('./components/vehicles/vehicle-list.component').then(
            (m) => m.VehicleListComponent
          ),
      },
      {
        path: 'vehicles/new',
        loadComponent: () =>
          import('./components/vehicles/vehicle-form.component').then(
            (m) => m.VehicleFormComponent
          ),
      },
      {
        path: 'vehicles/:id',
        loadComponent: () =>
          import('./components/vehicles/vehicle-detail.component').then(
            (m) => m.VehicleDetailComponent
          ),
      },
      {
        path: 'vehicles/:id/edit',
        loadComponent: () =>
          import('./components/vehicles/vehicle-form.component').then(
            (m) => m.VehicleFormComponent
          ),
      },
      {
        path: 'visits',
        loadComponent: () =>
          import('./components/visits/visit-list.component').then(
            (m) => m.VisitListComponent
          ),
      },
      {
        path: 'visits/new',
        loadComponent: () =>
          import('./components/visits/visit-form-enhanced.component').then(
            (m) => m.VisitFormEnhancedComponent
          ),
      },
      {
        path: 'visits/:id',
        loadComponent: () =>
          import('./components/visits/visit-detail.component').then(
            (m) => m.VisitDetailComponent
          ),
      },
      {
        path: 'visits/:id/edit',
        loadComponent: () =>
          import('./components/visits/visit-form-enhanced.component').then(
            (m) => m.VisitFormEnhancedComponent
          ),
      },
      {
        path: 'diagnostics',
        loadComponent: () =>
          import('./components/diagnostics/diagnostic-list.component').then(
            (m) => m.DiagnosticListComponent
          ),
      },
      {
        path: 'diagnostics/create/:visitId',
        loadComponent: () =>
          import('./components/diagnostics/diagnostic-form.component').then(
            (m) => m.DiagnosticFormComponent
          ),
      },
      {
        path: 'diagnostics/:id',
        loadComponent: () =>
          import('./components/diagnostics/diagnostic-detail.component').then(
            (m) => m.DiagnosticDetailComponent
          ),
      },
      {
        path: 'quotes',
        loadComponent: () =>
          import('./components/quotes/quote-list.component').then(
            (m) => m.QuoteListComponent
          ),
      },
      {
        path: 'quotes/new',
        loadComponent: () =>
          import('./components/quotes/quote-form-new.component').then(
            (m) => m.QuoteFormNewComponent
          ),
      },
      {
        path: 'quotes/create/:diagnosticId',
        loadComponent: () =>
          import('./components/quotes/quote-form.component').then(
            (m) => m.QuoteFormComponent
          ),
      },
      {
        path: 'quotes/:id',
        loadComponent: () =>
          import('./components/quotes/quote-detail.component').then(
            (m) => m.QuoteDetailComponent
          ),
      },
      {
        path: 'interventions',
        loadComponent: () =>
          import('./components/interventions/intervention-list.component').then(
            (m) => m.InterventionListComponent
          ),
      },
      {
        path: 'interventions/create/:quoteId',
        loadComponent: () =>
          import('./components/interventions/intervention-form.component').then(
            (m) => m.InterventionFormComponent
          ),
      },
      {
        path: 'interventions/:id',
        loadComponent: () =>
          import(
            './components/interventions/intervention-detail.component'
          ).then((m) => m.InterventionDetailComponent),
      },
      {
        path: 'invoices',
        loadComponent: () =>
          import('./components/invoices/invoice-list.component').then(
            (m) => m.InvoiceListComponent
          ),
      },
      {
        path: 'invoices/create/:interventionId',
        loadComponent: () =>
          import('./components/invoices/invoice-form.component').then(
            (m) => m.InvoiceFormComponent
          ),
      },
      {
        path: 'invoices/:id',
        loadComponent: () =>
          import('./components/invoices/invoice-detail.component').then(
            (m) => m.InvoiceDetailComponent
          ),
      },
      {
        path: 'payments',
        loadComponent: () =>
          import('./components/payments/payment-list.component').then(
            (m) => m.PaymentListComponent
          ),
      },
      {
        path: 'payments/create/:invoiceId',
        loadComponent: () =>
          import('./components/payments/payment-form.component').then(
            (m) => m.PaymentFormComponent
          ),
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./components/reports/report-dashboard.component').then(
            (m) => m.ReportDashboardComponent
          ),
      },
      {
        path: 'personnel',
        loadComponent: () =>
          import('./components/personnel/personnel-list.component').then(
            (m) => m.PersonnelListComponent
          ),
      },
      {
        path: 'personnel/new',
        loadComponent: () =>
          import('./components/personnel/personnel-form.component').then(
            (m) => m.PersonnelFormComponent
          ),
      },
      {
        path: 'personnel/:id/edit',
        loadComponent: () =>
          import('./components/personnel/personnel-form.component').then(
            (m) => m.PersonnelFormComponent
          ),
      },
      {
        path: 'personnel/:id',
        loadComponent: () =>
          import('./components/personnel/personnel-detail.component').then(
            (m) => m.PersonnelDetailComponent
          ),
      },
      {
        path: 'garage-setup',
        loadComponent: () =>
          import('./components/garage/garage-setting.component').then(
            (m) => m.GarageSetupComponent
          ),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./components/settings/garage-setup.component').then(
            (m) => m.GarageSetupComponent
          ),
      },
      {
        path: 'profile/:email/edit',
        loadComponent: () =>
          import('./components/auth/profile.component').then(
            (m) => m.ProfileComponent
          ),
      },
      {
        path: 'checksDiagnostique',
        loadComponent: () =>
          import('./components/checks-giagnostique/checks-giagnostique').then(
            (m) => m.ChecksFiagnostique
          ),
      },
      {
        path: 'dictionnaire',
        loadComponent: () =>
          import('./components/settings/dictionnaire.component').then(
            (m) => m.DictionnaireComponent
          ),
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./components/notification-message/notification-message').then(
            (m) => m.NotificationMessage
          ),
      },
      {
        path: 'stockDashboard',
        loadComponent: () =>
          import('./components/stocks/stock-dashboard.component').then(
            (m) => m.StockDashboardComponent
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];