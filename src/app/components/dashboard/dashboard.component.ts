import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Quote } from '../../models/quote.model';
import { Invoice } from '../../models/invoice.model';
import { GarageDataService } from '../../services/garage-data.service';
import { Client } from '../../models/client.model';
import { Intervention } from '../../models/intervention.model';
import { FirestoreDatePipe } from '../../pipe/firestore-date.pipe';
import { NotificationService } from '../../services/notification.service';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ClientDashboardComponent } from '../client-portal/client-dashboard.component';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  stagger,
  state,
} from '@angular/animations';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FirestoreDatePipe,
    NgChartsModule,
    FormsModule,
    ClientDashboardComponent,
  ],
  animations: [
    // Animation d'entrée/sortie de la modal
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('150ms ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('100ms ease-in', style({ opacity: 0 }))]),
    ]),

    // Animation de scale pour le contenu
    trigger('scaleIn', [
      transition(':enter', [
        style({ transform: 'scale(0.95)', opacity: 0 }),
        animate(
          '200ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ transform: 'scale(1)', opacity: 1 })
        ),
      ]),
    ]),

    // Animation des éléments en liste
    trigger('staggerIn', [
      transition('* => *', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateY(10px)' }),
            stagger('50ms', [
              animate(
                '200ms ease-out',
                style({ opacity: 1, transform: 'translateY(0)' })
              ),
            ]),
          ],
          { optional: true }
        ),
      ]),
    ]),

    // Animation de hover scale
    trigger('hoverScale', [
      state('normal', style({ transform: 'scale(1)' })),
      state('hover', style({ transform: 'scale(1.02)' })),
      transition('normal <=> hover', animate('150ms ease-in-out')),
    ]),

    // Animation d'entrée des lignes
    trigger('fadeInGrow', [
      transition(':enter', [
        style({
          opacity: 0,
          height: '0px',
          paddingTop: '0',
          paddingBottom: '0',
        }),
        animate(
          '200ms ease-out',
          style({
            opacity: 1,
            height: '*',
            paddingTop: '*',
            paddingBottom: '*',
          })
        ),
      ]),
    ]),
  ],
  template: `
    @if(this.authService.canccessDashboard){
    <div *ngIf="isLoading" class="flex justify-center items-center h-[60vh]">
      <div
        class="animate-spin rounded-full h-12 w-12 border-t-4 border-primary-500 border-solid"
      ></div>
    </div>

    <div *ngIf="!isLoading">
      <div class="space-y-6">
        <div class="md:flex md:items-center md:justify-between">
          <div class="flex-1 min-w-0">
            <h2
              class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate"
            >
              Tableau de bord
            </h2>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div class="card">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div
                  class="flex items-center justify-center h-8 w-8 rounded-md bg-primary-500 text-white"
                >
                  👥
                </div>
              </div>
              <div class="ml-4">
                <div class="text-sm font-medium text-gray-500">
                  Nombre total de clients
                </div>
                <div class="text-2xl font-bold text-gray-900">
                  {{ stats.totalClients }}
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div
                  class="flex items-center justify-center h-8 w-8 rounded-md bg-secondary-500 text-white"
                >
                  💰
                </div>
              </div>
              <div class="ml-4">
                <div class="text-sm font-medium text-gray-500">
                  Devis en attente
                </div>
                <div class="text-2xl font-bold text-gray-900">
                  {{ stats.pendingQuotes }}
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div
                  class="flex items-center justify-center h-8 w-8 rounded-md bg-accent-500 text-white"
                >
                  🔧
                </div>
              </div>
              <div class="ml-4">
                <div class="text-sm font-medium text-gray-500">
                  Interventions actives
                </div>
                <div class="text-2xl font-bold text-gray-900">
                  {{ stats.activeInterventions }}
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div
                  class="flex items-center justify-center h-8 w-8 rounded-md bg-green-500 text-white"
                >
                  🧾
                </div>
              </div>
              <div class="ml-4">
                <div class="text-sm font-medium text-gray-500">
                  Factures impayées
                </div>
                <div class="text-2xl font-bold text-gray-900">
                  {{ stats.unpaidInvoices }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Citations récentes -->
          <div class="card">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-medium text-gray-900">
                Citations récentes (Devis)
              </h3>
              <div class="flex items-center space-x-2">
                <button
                  (click)="prevQuotePage()"
                  [disabled]="currentQuotePage === 0"
                  class="p-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <span class="text-sm text-gray-600">
                  Page {{ currentQuotePage + 1 }} / {{ totalQuotePages }}
                </span>
                <button
                  (click)="nextQuotePage()"
                  [disabled]="currentQuotePage === totalQuotePages - 1"
                  class="p-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div class="space-y-3">
              <div
                *ngFor="let quote of paginatedQuotes"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-md"
              >
                <div>
                  <div class="text-sm font-medium text-gray-900">
                    {{ quote.quoteNumber }}
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ quote.createdAt | firestoreDate | date : 'short' }}
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-sm font-medium text-gray-900">
                    \GNF {{ quote.total.toFixed(2) }}
                  </div>
                  <span
                    class="status-badge"
                    [ngClass]="getStatusClass(quote.status)"
                  >
                    {{ quote.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Factures récentes -->
          <div class="card">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-medium text-gray-900">
                Factures récentes
              </h3>
              <div class="flex items-center space-x-2">
                <button
                  (click)="prevInvoicePage()"
                  [disabled]="currentInvoicePage === 0"
                  class="p-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <span class="text-sm text-gray-600">
                  Page {{ currentInvoicePage + 1 }} / {{ totalInvoicePages }}
                </span>
                <button
                  (click)="nextInvoicePage()"
                  [disabled]="currentInvoicePage === totalInvoicePages - 1"
                  class="p-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div class="space-y-3">
              <div
                *ngFor="let invoice of paginatedInvoices"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-md"
              >
                <div>
                  <div class="text-sm font-medium text-gray-900">
                    {{ invoice.invoiceNumber }}
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ invoice.createdAt | firestoreDate | date : 'short' }}
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-sm font-medium text-gray-900">
                    \GNF {{ invoice.totalAmount.toFixed(2) }}
                  </div>
                  <span
                    class="status-badge"
                    [ngClass]="getStatusClass(invoice.status)"
                  >
                    {{ invoice.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Bloc Revenus Mensuels -->
          <div
            class="bg-white rounded-2xl shadow-lg p-6 transition duration-300 hover:shadow-2xl hover:scale-[1.02]"
          >
            <h3
              class="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2"
            >
              📈 Revenus mensuels
            </h3>

            <div class="grid grid-cols-2 gap-4 mb-6">
              <div class="flex flex-col">
                <label class="text-sm font-medium text-gray-600 mb-1"
                  >Date début</label
                >
                <input
                  type="date"
                  [(ngModel)]="filterStartDate"
                  (change)="onFilterChange()"
                  class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div class="flex flex-col">
                <label class="text-sm font-medium text-gray-600 mb-1"
                  >Date fin</label
                >
                <input
                  type="date"
                  [(ngModel)]="filterEndDate"
                  (change)="onFilterChange()"
                  class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <canvas
              baseChart
              [data]="revenueChartData"
              [options]="revenueChartOptions"
              [type]="'line'"
              class="w-full h-64"
            ></canvas>
          </div>

          <!-- Bloc Diagnostics clôturés -->
          <div
            class="bg-white rounded-2xl shadow-lg p-6 transition duration-300 hover:shadow-2xl hover:scale-[1.02]"
          >
            <h3
              class="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2"
            >
              🛠️ Diagnostics & Entretiens clôturés
            </h3>

            <canvas
              baseChart
              [data]="closedDiagChartData"
              [options]="closedDiagChartOptions"
              [type]="'bar'"
              class="w-full h-64"
            ></canvas>
          </div>
        </div>
      </div>
    </div>
    }@else{
    <app-client-dashboard></app-client-dashboard>
    }
  `,
})
export class DashboardComponent implements OnInit {
  stats = {
    totalClients: 0,
    pendingQuotes: 0,
    activeInterventions: 0,
    unpaidInvoices: 0,
  };

  recentQuotes: Quote[] = [];
  recentInvoices: Invoice[] = [];
  isLoading = true;

  filterStartDate: string | null = null;
  filterEndDate: string | null = null;

  public revenueChartData: ChartConfiguration<'line'>['data'] = {
    labels: [], // Mois ou dates
    datasets: [{ data: [], label: 'Revenus (GNF)' }],
  };
  public revenueChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
  };

  public closedDiagChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [], // Mois ou dates
    datasets: [
      { data: [], label: 'Diagnostics clôturés' },
      { data: [], label: 'Entretiens clôturés' },
    ],
  };

  public closedDiagChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
  };

  constructor(
    private readonly garageDataService: GarageDataService,
    private readonly notificationService: NotificationService,
    public readonly authService: AuthService
  ) {}

  ngOnInit() {
    (async () => {
      await this.loadDashboardData();
    })();
  }

  private async loadDashboardData(): Promise<void> {
    this.isLoading = true;
    try {
      // Load stats
      const clients = await this.garageDataService.getAll<Client>('clients');
      this.stats.totalClients = clients.length;

      const quotes = await this.garageDataService.getAll<Quote>('quotes');
      this.stats.pendingQuotes = quotes.filter(
        (q) => q.status === 'Pending'
      ).length;

      const interventions = await this.garageDataService.getAll<Intervention>(
        'interventions'
      );
      this.stats.activeInterventions = interventions.filter(
        (i) => i.status === 'InProgress'
      ).length;

      const invoices = await this.garageDataService.getAll<Invoice>('invoices');
      this.stats.unpaidInvoices = invoices.filter(
        (i) => i.status === 'Unpaid'
      ).length;

      // Load recent items
      this.recentQuotes = quotes.slice(0, 5);
      this.recentInvoices = invoices.slice(0, 5);

      // Aggregate data for charts
      let filteredInvoices = invoices;
      let filteredInterventions = interventions;

      if (this.filterStartDate) {
        const start = new Date(this.filterStartDate);
        filteredInvoices = filteredInvoices.filter(
          (inv) => new Date(inv.createdAt) >= start
        );
        filteredInterventions = filteredInterventions.filter(
          (intv) => new Date(intv.createdAt) >= start
        );
      }
      if (this.filterEndDate) {
        const end = new Date(this.filterEndDate);
        filteredInvoices = filteredInvoices.filter(
          (inv) => new Date(inv.createdAt) <= end
        );
        filteredInterventions = filteredInterventions.filter(
          (intv) => new Date(intv.createdAt) <= end
        );
      }

      const aggregatedRevenue = this.aggregateRevenueByMonth(filteredInvoices);
      this.revenueChartData.labels = Object.keys(aggregatedRevenue);
      this.revenueChartData.datasets[0].data = Object.values(aggregatedRevenue);

      const aggregatedClosed = this.aggregateClosedInterventionsByMonth(
        filteredInterventions
      );
      this.closedDiagChartData.labels = Object.keys(aggregatedClosed);
      this.closedDiagChartData.datasets[0].data =
        Object.values(aggregatedClosed);
      this.closedDiagChartData.datasets[0].label = 'Interventions clôturées';
      this.closedDiagChartData.datasets =
        this.closedDiagChartData.datasets.slice(0, 1); // Un seul dataset
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      this.notificationService.showError(
        'Error loading dashboard data:' + error,
        30
      );
    } finally {
      this.isLoading = false;
    }
  }

  private aggregateRevenueByMonth(invoices: Invoice[]): {
    [key: string]: number;
  } {
    const aggregated: { [key: string]: number } = {};
    invoices.forEach((invoice) => {
      if (!isNaN(invoice.totalAmount)) {
        const date =
          typeof (invoice.createdAt as any)?.toDate === 'function'
            ? (invoice.createdAt as any).toDate()
            : new Date(invoice.createdAt);
        const monthLabel = this.getMonthLabel(date);
        if (aggregated[monthLabel]) {
          aggregated[monthLabel] += invoice.totalAmount;
        } else {
          aggregated[monthLabel] = invoice.totalAmount;
        }
      }
    });
    return aggregated;
  }

  private aggregateClosedInterventionsByMonth(interventions: Intervention[]): {
    [key: string]: number;
  } {
    const aggregated: { [key: string]: number } = {};
    interventions.forEach((intervention) => {
      if (intervention.status === 'Completed') {
        const date =
          typeof (intervention.createdAt as any)?.toDate === 'function'
            ? (intervention.createdAt as any).toDate()
            : new Date(intervention.createdAt);
        const monthLabel = this.getMonthLabel(date);
        if (aggregated[monthLabel]) {
          aggregated[monthLabel]++;
        } else {
          aggregated[monthLabel] = 1;
        }
      }
    });
    return aggregated;
  }

  private getMonthLabel(date: Date): string {
    const mois = [
      'janv',
      'févr',
      'mars',
      'avr',
      'mai',
      'juin',
      'juil',
      'août',
      'sept',
      'oct',
      'nov',
      'déc',
    ];
    return `${mois[date.getMonth()]} ${date.getFullYear()}`;
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'status-pending';
      case 'accepted':
        return 'status-accepted';
      case 'rejected':
        return 'status-rejected';
      case 'paid':
        return 'status-paid';
      case 'unpaid':
        return 'status-unpaid';
      case 'partial':
        return 'status-partial';
      default:
        return 'status-pending';
    }
  }

  onFilterChange() {
    this.loadDashboardData();
  }

  //================ Propriétés pour la pagination
  itemsPerPage = 3;
  currentQuotePage = 0;
  currentInvoicePage = 0;

  // Getters pour les données paginées
  get paginatedQuotes() {
    const start = this.currentQuotePage * this.itemsPerPage;
    return this.recentQuotes.slice(start, start + this.itemsPerPage);
  }

  get paginatedInvoices() {
    const start = this.currentInvoicePage * this.itemsPerPage;
    return this.recentInvoices.slice(start, start + this.itemsPerPage);
  }

  // Getters pour le nombre total de pages
  get totalQuotePages() {
    return Math.ceil(this.recentQuotes.length / this.itemsPerPage);
  }

  get totalInvoicePages() {
    return Math.ceil(this.recentInvoices.length / this.itemsPerPage);
  }

  // Méthodes de navigation
  nextQuotePage() {
    if (this.currentQuotePage < this.totalQuotePages - 1) {
      this.currentQuotePage++;
    }
  }

  prevQuotePage() {
    if (this.currentQuotePage > 0) {
      this.currentQuotePage--;
    }
  }

  nextInvoicePage() {
    if (this.currentInvoicePage < this.totalInvoicePages - 1) {
      this.currentInvoicePage++;
    }
  }

  prevInvoicePage() {
    if (this.currentInvoicePage > 0) {
      this.currentInvoicePage--;
    }
  }
}
