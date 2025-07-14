import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GarageDataService } from '../../services/garage-data.service';
import { NotificationService } from '../../services/notification.service';
import { Client, Vehicle, Visit } from '../../models/client.model';
import { Diagnostic } from '../../models/diagnostic.model';
import { Quote } from '../../models/quote.model';
import { Intervention } from '../../models/intervention.model';
import { Invoice } from '../../models/invoice.model';
import { FirestoreDatePipe } from '../../pipe/firestore-date.pipe';

@Component({
  selector: 'app-report-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, FirestoreDatePipe],
  template: `
    <div class="space-y-6">
      <div class="md:flex md:items-center md:justify-between">
        <div class="flex-1 min-w-0">
          <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Reports & Analytics
          </h2>
        </div>
        <div class="mt-4 flex md:mt-0 md:ml-4 space-x-3">
          <button (click)="exportToPDF()" class="btn-secondary">
            Export PDF
          </button>
          <button (click)="exportToCSV()" class="btn-primary">
            Export CSV
          </button>
        </div>
      </div>

      <!-- Date Filter -->
      <div class="card">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="form-label">From Date</label>
            <input
              type="date"
              [(ngModel)]="fromDate"
              (change)="filterData()"
              class="form-input"
            />
          </div>
          <div>
            <label class="form-label">To Date</label>
            <input
              type="date"
              [(ngModel)]="toDate"
              (change)="filterData()"
              class="form-input"
            />
          </div>
          <div class="flex items-end">
            <button (click)="resetFilters()" class="btn-outline w-full">
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      <!-- Key Metrics -->
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div class="card">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="flex items-center justify-center h-8 w-8 rounded-md bg-green-500 text-white">
                💰
              </div>
            </div>
            <div class="ml-4">
              <div class="text-sm font-medium text-gray-500">Total Revenue</div>
              <div class="text-2xl font-bold text-gray-900">\${{ metrics.totalRevenue.toFixed(2) }}</div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="flex items-center justify-center h-8 w-8 rounded-md bg-blue-500 text-white">
                👥
              </div>
            </div>
            <div class="ml-4">
              <div class="text-sm font-medium text-gray-500">Total Clients</div>
              <div class="text-2xl font-bold text-gray-900">{{ metrics.totalClients }}</div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="flex items-center justify-center h-8 w-8 rounded-md bg-purple-500 text-white">
                🔧
              </div>
            </div>
            <div class="ml-4">
              <div class="text-sm font-medium text-gray-500">Interventions</div>
              <div class="text-2xl font-bold text-gray-900">{{ metrics.totalInterventions }}</div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="flex items-center justify-center h-8 w-8 rounded-md bg-orange-500 text-white">
                📊
              </div>
            </div>
            <div class="ml-4">
              <div class="text-sm font-medium text-gray-500">Avg. Invoice</div>
              <div class="text-2xl font-bold text-gray-900">\${{ metrics.averageInvoice.toFixed(2) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts and Analytics -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Revenue Trend -->
        <div class="card">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Monthly Revenue</h3>
          <div class="space-y-3">
            <div *ngFor="let month of monthlyRevenue" class="flex items-center justify-between">
              <span class="text-sm text-gray-600">{{ month.month }}</span>
              <div class="flex items-center space-x-2">
                <div class="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    class="bg-green-600 h-2 rounded-full"
                    [style.width.%]="(month.revenue / getMaxMonthlyRevenue()) * 100"
                  ></div>
                </div>
                <span class="text-sm font-medium text-gray-900">\${{ month.revenue.toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Diagnostic Categories -->
        <div class="card">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Diagnostic Categories</h3>
          <div class="space-y-3">
            <div *ngFor="let category of diagnosticCategories" class="flex items-center justify-between">
              <span class="text-sm text-gray-600">{{ category.name }}</span>
              <div class="flex items-center space-x-2">
                <div class="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    class="bg-blue-600 h-2 rounded-full"
                    [style.width.%]="(category.count / getMaxCategoryCount()) * 100"
                  ></div>
                </div>
                <span class="text-sm font-medium text-gray-900">{{ category.count }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Payment Methods -->
      <div class="card">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Payment Methods Distribution</h3>
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div *ngFor="let method of paymentMethods" class="text-center">
            <div class="text-2xl font-bold text-gray-900">\${{ method.amount.toFixed(2) }}</div>
            <div class="text-sm text-gray-500">{{ method.name }}</div>
            <div class="text-xs text-gray-400">{{ method.percentage.toFixed(1) }}%</div>
          </div>
        </div>
      </div>

      <!-- Top Clients -->
      <div class="card">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Top Clients by Revenue</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Spent
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visits
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Visit
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let client of topClients">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ client.name }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  \${{ client.totalSpent.toFixed(2) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ client.visitCount }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ client.lastVisit |firestoreDate | date:'short' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Service Performance -->
      <div class="card">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Service Performance</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="text-center">
            <div class="text-3xl font-bold text-green-600">{{ serviceMetrics.averageCompletionTime.toFixed(1) }}h</div>
            <div class="text-sm text-gray-500">Avg. Completion Time</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-blue-600">{{ serviceMetrics.customerSatisfaction.toFixed(1) }}%</div>
            <div class="text-sm text-gray-500">Customer Satisfaction</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-purple-600">{{ serviceMetrics.repeatCustomers.toFixed(1) }}%</div>
            <div class="text-sm text-gray-500">Repeat Customers</div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ReportDashboardComponent implements OnInit {
  fromDate = '';
  toDate = '';

  // Data
  clients: Client[] = [];
  vehicles: Vehicle[] = [];
  visits: Visit[] = [];
  diagnostics: Diagnostic[] = [];
  quotes: Quote[] = [];
  interventions: Intervention[] = [];
  invoices: Invoice[] = [];

  // Metrics
  metrics = {
    totalRevenue: 0,
    totalClients: 0,
    totalInterventions: 0,
    averageInvoice: 0
  };

  monthlyRevenue: { month: string; revenue: number }[] = [];
  diagnosticCategories: { name: string; count: number }[] = [];
  paymentMethods: { name: string; amount: number; percentage: number }[] = [];
  topClients: any[] = [];
  serviceMetrics = {
    averageCompletionTime: 0,
    customerSatisfaction: 95.5, // Mock data
    repeatCustomers: 0
  };

  constructor(
    private garageDataService: GarageDataService,
    private notificationService: NotificationService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadData();
    this.setDefaultDateRange();
    this.calculateMetrics();
  }

  private async loadData(): Promise<void> {
    try {
      [
        this.clients,
        this.vehicles,
        this.visits,
        this.diagnostics,
        this.quotes,
        this.interventions,
        this.invoices
      ] = await Promise.all([
        this.garageDataService.getAll<Client>('clients'),
        this.garageDataService.getAll<Vehicle>('vehicles'),
        this.garageDataService.getAll<Visit>('visits'),
        this.garageDataService.getAll<Diagnostic>('diagnostics'),
        this.garageDataService.getAll<Quote>('quotes'),
        this.garageDataService.getAll<Intervention>('interventions'),
        this.garageDataService.getAll<Invoice>('invoices')
      ]);
    } catch (error) {
      this.notificationService.showError('Failed to load report data');
    }
  }

  private setDefaultDateRange(): void {
    const now = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(now.getMonth() - 3);

    this.fromDate = threeMonthsAgo.toISOString().split('T')[0];
    this.toDate = now.toISOString().split('T')[0];
  }

  filterData(): void {
    this.calculateMetrics();
  }

  resetFilters(): void {
    this.setDefaultDateRange();
    this.calculateMetrics();
  }

  private calculateMetrics(): void {
    const filteredInvoices = this.getFilteredInvoices();

    // Basic metrics
    this.metrics.totalRevenue = filteredInvoices.reduce((sum, invoice) => sum + invoice.amountPaid, 0);
    this.metrics.totalClients = this.clients.length;
    this.metrics.totalInterventions = this.interventions.length;
    this.metrics.averageInvoice = filteredInvoices.length > 0 ?
      this.metrics.totalRevenue / filteredInvoices.length : 0;

    // Monthly revenue
    this.calculateMonthlyRevenue(filteredInvoices);

    // Diagnostic categories
    this.calculateDiagnosticCategories();

    // Payment methods
    this.calculatePaymentMethods(filteredInvoices);

    // Top clients
    this.calculateTopClients();

    // Service metrics
    this.calculateServiceMetrics();
  }

  private getFilteredInvoices(): Invoice[] {
    if (!this.fromDate || !this.toDate) return this.invoices;

    const from = new Date(this.fromDate);
    const to = new Date(this.toDate);

    return this.invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.createdAt);
      return invoiceDate >= from && invoiceDate <= to;
    });
  }

  private calculateMonthlyRevenue(invoices: Invoice[]): void {
    const monthlyData: { [key: string]: number } = {};

    invoices.forEach(invoice => {
      const month = new Date(invoice.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short'
      });
      monthlyData[month] = (monthlyData[month] || 0) + invoice.amountPaid;
    });

    this.monthlyRevenue = Object.entries(monthlyData)
      .map(([month, revenue]) => ({ month, revenue }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
  }

  private calculateDiagnosticCategories(): void {
    const categories: { [key: string]: number } = {};

    this.diagnostics.forEach(diagnostic => {
      categories[diagnostic.category] = (categories[diagnostic.category] || 0) + 1;
    });

    this.diagnosticCategories = Object.entries(categories)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }

  private calculatePaymentMethods(invoices: Invoice[]): void {
    const methods: { [key: string]: number } = {};
    let totalPayments = 0;

    invoices.forEach(invoice => {
      invoice.payments.forEach(payment => {
        methods[payment.method] = (methods[payment.method] || 0) + payment.amount;
        totalPayments += payment.amount;
      });
    });

    this.paymentMethods = Object.entries(methods)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: totalPayments > 0 ? (amount / totalPayments) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount);
  }

  private calculateTopClients(): void {
    const clientData: { [key: string]: any } = {};

    this.invoices.forEach(invoice => {
      const client = this.clients.find(c => c.id === invoice.clientId);
      if (client) {
        const clientName = `${client.firstName} ${client.lastName}`;
        if (!clientData[clientName]) {
          clientData[clientName] = {
            name: clientName,
            totalSpent: 0,
            visitCount: 0,
            lastVisit: null
          };
        }
        clientData[clientName].totalSpent += invoice.amountPaid;
      }
    });

    this.visits.forEach(visit => {
      const client = this.clients.find(c => c.id === visit.clientId);
      if (client) {
        const clientName = `${client.firstName} ${client.lastName}`;
        if (clientData[clientName]) {
          clientData[clientName].visitCount++;
          if (!clientData[clientName].lastVisit ||
              new Date(visit.visitDate) > new Date(clientData[clientName].lastVisit)) {
            clientData[clientName].lastVisit = visit.visitDate;
          }
        }
      }
    });

    this.topClients = Object.values(clientData)
      .sort((a: any, b: any) => b.totalSpent - a.totalSpent)
      .slice(0, 10);
  }

  private calculateServiceMetrics(): void {
    // Average completion time
    const completedInterventions = this.interventions.filter(i => i.actualDuration);
    this.serviceMetrics.averageCompletionTime = completedInterventions.length > 0 ?
      completedInterventions.reduce((sum, i) => sum + (i.actualDuration || 0), 0) / completedInterventions.length : 0;

    // Repeat customers
    const clientVisitCounts: { [key: string]: number } = {};
    this.visits.forEach(visit => {
      clientVisitCounts[visit.clientId] = (clientVisitCounts[visit.clientId] || 0) + 1;
    });

    const repeatCustomers = Object.values(clientVisitCounts).filter(count => count > 1).length;
    this.serviceMetrics.repeatCustomers = this.clients.length > 0 ?
      (repeatCustomers / this.clients.length) * 100 : 0;
  }

  getMaxMonthlyRevenue(): number {
    return Math.max(...this.monthlyRevenue.map(m => m.revenue), 1);
  }

  getMaxCategoryCount(): number {
    return Math.max(...this.diagnosticCategories.map(c => c.count), 1);
  }

  exportToPDF(): void {
    this.notificationService.showSuccess('PDF export feature coming soon');
  }

  exportToCSV(): void {
    this.notificationService.showSuccess('CSV export feature coming soon');
  }
}