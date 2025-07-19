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
import { ChartConfiguration, ChartType } from 'chart.js';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FirestoreDatePipe, NgChartsModule, FormsModule],
  template: `
    <div *ngIf="isLoading" class="flex justify-center items-center h-[60vh]">
      <div class="animate-spin rounded-full h-12 w-12 border-t-4 border-primary-500 border-solid"></div>
    </div>
    <div *ngIf="!isLoading">
      <div class="space-y-6">
        <div class="md:flex md:items-center md:justify-between">
          <div class="flex-1 min-w-0">
            <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Tableau de bord
            </h2>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div class="card">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="flex items-center justify-center h-8 w-8 rounded-md bg-primary-500 text-white">
                  👥
                </div>
              </div>
              <div class="ml-4">
                <div class="text-sm font-medium text-gray-500">Nombre total de clients</div>
                <div class="text-2xl font-bold text-gray-900">{{ stats.totalClients }}</div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="flex items-center justify-center h-8 w-8 rounded-md bg-secondary-500 text-white">
                  💰
                </div>
              </div>
              <div class="ml-4">
                <div class="text-sm font-medium text-gray-500">Devis en attente</div>
                <div class="text-2xl font-bold text-gray-900">{{ stats.pendingQuotes }}</div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="flex items-center justify-center h-8 w-8 rounded-md bg-accent-500 text-white">
                  🔧
                </div>
              </div>
              <div class="ml-4">
                <div class="text-sm font-medium text-gray-500">Interventions actives</div>
                <div class="text-2xl font-bold text-gray-900">{{ stats.activeInterventions }}</div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="flex items-center justify-center h-8 w-8 rounded-md bg-green-500 text-white">
                  🧾
                </div>
              </div>
              <div class="ml-4">
                <div class="text-sm font-medium text-gray-500">Factures impayées</div>
                <div class="text-2xl font-bold text-gray-900">{{ stats.unpaidInvoices }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="card">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Citations récentes(Devis)</h3>
            <div class="space-y-3">
              <div *ngFor="let quote of recentQuotes" class="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ quote.quoteNumber }}</div>
                  <div class="text-xs text-gray-500">{{ quote.createdAt | firestoreDate | date:'short' }}</div>
                </div>
                <div class="text-right">
                  <div class="text-sm font-medium text-gray-900">\${{ quote.total.toFixed(2) }}</div>
                  <span class="status-badge" [ngClass]="getStatusClass(quote.status)">
                    {{ quote.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Factures récentes</h3>
            <div class="space-y-3">
              <div *ngFor="let invoice of recentInvoices" class="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ invoice.invoiceNumber }}</div>
                  <div class="text-xs text-gray-500">{{ invoice.createdAt | firestoreDate | date:'short' }}</div>
                </div>
                <div class="text-right">
                  <div class="text-sm font-medium text-gray-900">\${{ invoice.totalAmount.toFixed(2) }}</div>
                  <span class="status-badge" [ngClass]="getStatusClass(invoice.status)">
                    {{ invoice.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="card">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Revenus mensuels</h3>
            <div class="flex gap-4 mb-4">
              <div>
                <label>Date début:</label>
                <input type="date" [(ngModel)]="filterStartDate" (change)="onFilterChange()" class="input input-bordered" />
              </div>
              <div>
                <label>Date fin:</label>
                <input type="date" [(ngModel)]="filterEndDate" (change)="onFilterChange()" class="input input-bordered" />
              </div>
            </div>
            <canvas baseChart
              [data]="revenueChartData"
              [options]="revenueChartOptions"
              [type]="'line'">
            </canvas>
          </div>

          <div class="card">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Diagnostics & Entretiens clôturés</h3>
            <canvas baseChart
              [data]="closedDiagChartData"
              [options]="closedDiagChartOptions"
              [type]="'bar'">
            </canvas>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  stats = {
    totalClients: 0,
    pendingQuotes: 0,
    activeInterventions: 0,
    unpaidInvoices: 0
  };

  recentQuotes: Quote[] = [];
  recentInvoices: Invoice[] = [];
  isLoading = true;

  filterStartDate: string | null = null;
  filterEndDate: string | null = null;

  public revenueChartData: ChartConfiguration<'line'>['data'] = {
    labels: [], // Mois ou dates
    datasets: [
      { data: [], label: 'Revenus (GNF)' }
    ]
  };
  public revenueChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true
  };

  public closedDiagChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [], // Mois ou dates
    datasets: [
      { data: [], label: 'Diagnostics clôturés' },
      { data: [], label: 'Entretiens clôturés' }
    ]
  };
  public closedDiagChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true
  };

  constructor(
    private readonly garageDataService: GarageDataService,
    private readonly notificationService: NotificationService) {}

  ngOnInit() {
    (async() => {
      await this.loadDashboardData();
    })()
  }

  private async loadDashboardData(): Promise<void> {
    this.isLoading = true;
    try {
      // Load stats
      const clients = await this.garageDataService.getAll<Client>('clients');
      this.stats.totalClients = clients.length;

      const quotes = await this.garageDataService.getAll<Quote>('quotes');
      this.stats.pendingQuotes = quotes.filter(q => q.status === 'Pending').length;

      const interventions = await this.garageDataService.getAll<Intervention>('interventions');
      this.stats.activeInterventions = interventions.filter(i => i.status === 'InProgress').length;

      const invoices = await this.garageDataService.getAll<Invoice>('invoices');
      this.stats.unpaidInvoices = invoices.filter(i => i.status === 'Unpaid').length;

      // Load recent items
      this.recentQuotes = quotes.slice(0, 5);
      this.recentInvoices = invoices.slice(0, 5);

      // Aggregate data for charts
      let filteredInvoices = invoices;
      let filteredInterventions = interventions;

      if (this.filterStartDate) {
        const start = new Date(this.filterStartDate);
        filteredInvoices = filteredInvoices.filter(inv => new Date(inv.createdAt) >= start);
        filteredInterventions = filteredInterventions.filter(intv => new Date(intv.createdAt) >= start);
      }
      if (this.filterEndDate) {
        const end = new Date(this.filterEndDate);
        filteredInvoices = filteredInvoices.filter(inv => new Date(inv.createdAt) <= end);
        filteredInterventions = filteredInterventions.filter(intv => new Date(intv.createdAt) <= end);
      }

      const aggregatedRevenue = this.aggregateRevenueByMonth(filteredInvoices);
      this.revenueChartData.labels = Object.keys(aggregatedRevenue);
      this.revenueChartData.datasets[0].data = Object.values(aggregatedRevenue);

      const aggregatedClosed = this.aggregateClosedInterventionsByMonth(filteredInterventions);
      this.closedDiagChartData.labels = Object.keys(aggregatedClosed);
      this.closedDiagChartData.datasets[0].data = Object.values(aggregatedClosed);
      this.closedDiagChartData.datasets[0].label = 'Interventions clôturées';
      this.closedDiagChartData.datasets = this.closedDiagChartData.datasets.slice(0, 1); // Un seul dataset

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      this.notificationService.showError('Error loading dashboard data:' + error, 30)
    } finally {
      this.isLoading = false;
    }
  }

  private aggregateRevenueByMonth(invoices: Invoice[]): { [key: string]: number } {
    const aggregated: { [key: string]: number } = {};
    invoices.forEach(invoice => {
      if (!isNaN(invoice.totalAmount)) {
        const date = (typeof (invoice.createdAt as any)?.toDate === 'function'
            ? (invoice.createdAt as any).toDate()
            : new Date(invoice.createdAt));
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

  private aggregateClosedInterventionsByMonth(interventions: Intervention[]): { [key: string]: number } {
    const aggregated: { [key: string]: number } = {};
    interventions.forEach(intervention => {
      if (intervention.status === 'Completed') {
        const date = (typeof (intervention.createdAt as any)?.toDate === 'function'
            ? (intervention.createdAt as any).toDate()
            : new Date(intervention.createdAt));
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
    const mois = ['janv', 'févr', 'mars', 'avr', 'mai', 'juin', 'juil', 'août', 'sept', 'oct', 'nov', 'déc'];
    return `${mois[date.getMonth()]} ${date.getFullYear()}`;
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending': return 'status-pending';
      case 'accepted': return 'status-accepted';
      case 'rejected': return 'status-rejected';
      case 'paid': return 'status-paid';
      case 'unpaid': return 'status-unpaid';
      case 'partial': return 'status-partial';
      default: return 'status-pending';
    }
  }

  onFilterChange() {
    this.loadDashboardData();
  }
}


