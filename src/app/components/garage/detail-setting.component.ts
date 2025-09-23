import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../../firebase.config';
import { Garage, GarageStatistics } from '../../models/garage.model';

@Component({
  selector: 'app-detail-setting',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-6 bg-gray-50 min-h-screen" *ngIf="garage">
      <!-- En-tête avec animation et informations principales -->
      <div class="max-w-7xl mx-auto">
        <div class="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg p-8 mb-8 transform transition-all duration-300 hover:shadow-xl">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div class="flex-1">
              <h1 class="text-3xl font-bold text-white mb-2">{{ garage.name }}</h1>
              <p class="text-blue-100 mb-4">{{ garage.address }}</p>
              <div class="flex flex-wrap gap-4 mt-2">
                <div class="flex items-center text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {{ garage.phone }}
                </div>
                <div class="flex items-center text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {{ garage.email }}
                </div>
              </div>
            </div>
            <div class="mt-4 md:mt-0 bg-white bg-opacity-20 p-4 rounded-lg backdrop-filter backdrop-blur-sm">
              <div class="text-white text-center">
                <div class="text-3xl font-bold">{{ statistics.registeredClients }}</div>
                <div class="text-sm text-blue-100">Clients enregistrés</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Cartes de statistiques -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <!-- Statistiques financières -->
          <div class="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1">
            <div class="bg-green-500 h-2"></div>
            <div class="p-6">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-semibold text-gray-800">Finances</h2>
                <div class="p-2 bg-green-100 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">Chiffre d'affaires</span>
                  <span class="font-medium text-gray-900">{{ statistics.revenue | currency:'GNF' }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">Bénéfice</span>
                  <span class="font-medium" [ngClass]="statistics.profit >= 0 ? 'text-green-600' : 'text-red-600'">
                    {{ statistics.profit | currency:'GNF' }}
                  </span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">Dépenses</span>
                  <span class="font-medium text-red-600">{{ statistics.expenses | currency:'GNF' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Devis et Factures -->
          <div class="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1">
            <div class="bg-blue-500 h-2"></div>
            <div class="p-6">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-semibold text-gray-800">Facturation</h2>
                <div class="p-2 bg-blue-100 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">Devis émis</span>
                  <span class="font-medium text-gray-900">{{ statistics.quotesIssued }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">Factures payées</span>
                  <span class="font-medium text-green-600">{{ statistics.paidInvoices }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">Factures impayées</span>
                  <span class="font-medium text-red-600">{{ statistics.unpaidInvoices }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Personnel -->
          <div class="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1">
            <div class="bg-purple-500 h-2"></div>
            <div class="p-6">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-semibold text-gray-800">Personnel</h2>
                <div class="p-2 bg-purple-100 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">Personnel</span>
                  <span class="font-medium text-gray-900">{{ statistics.staffCount }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">Clients enregistrés</span>
                  <span class="font-medium text-gray-900">{{ statistics.registeredClients }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Véhicules -->
          <div class="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1">
            <div class="bg-red-500 h-2"></div>
            <div class="p-6">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-semibold text-gray-800">Véhicules</h2>
                <div class="p-2 bg-red-100 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">Nombre total</span>
                  <span class="font-medium text-gray-900">{{ statistics.totalCars }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">En intervention</span>
                  <span class="font-medium text-orange-600">{{ statistics.carsInService }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Informations détaillées du garage -->
        <div class="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 mb-8">
          <div class="p-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Informations détaillées
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div class="space-y-4">
                  <div>
                    <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wider">Adresse</h3>
                    <p class="mt-1 text-gray-900">{{ garage.address }}</p>
                  </div>
                  <div>
                    <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wider">Contact</h3>
                    <p class="mt-1 text-gray-900">{{ garage.phone }}</p>
                    <p class="mt-1 text-gray-900">{{ garage.email }}</p>
                  </div>
                </div>
              </div>
              <div>
                <div class="space-y-4">
                  <div *ngIf="garage.website">
                    <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wider">Site web</h3>
                    <p class="mt-1 text-gray-900">{{ garage.website }}</p>
                  </div>
                  <div *ngIf="garage.description">
                    <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wider">Description</h3>
                    <p class="mt-1 text-gray-900">{{ garage.description }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Boutons d'action -->
        <div class="flex flex-wrap gap-4">
          <button
      
            routerLink="/garage/liste"
            class="bg-gray-600 hover:bg-gray-700 text-white py-2 px-6 rounded-lg flex items-center transition-all duration-200 transform hover:scale-105 hover:shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour
          </button>
          <button
            class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg flex items-center transition-all duration-200 transform hover:scale-105 hover:shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Modifier
          </button>
        </div>
      </div>
    </div>

    <div class="p-6 flex justify-center items-center min-h-screen bg-gray-50" *ngIf="!garage">
      <div class="text-center">
        <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-600 text-lg">Chargement des informations du garage...</p>
      </div>
    </div>
  `,
})
export class DetailSettingComponent implements OnInit {
  garage: Garage | null = null;
  statistics: GarageStatistics = {
    revenue: 0,
    expenses: 0,
    profit: 0,
    quotesIssued: 0,
    paidInvoices: 0,
    unpaidInvoices: 0,
    registeredClients: 0,
    staffCount: 0,
    totalCars: 0,
    carsInService: 0
  };

  constructor(private readonly route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const garageId = params.get('id');
      if (garageId) {
        this.loadGarageDetails(garageId);
      }
    });
  }

  async loadGarageDetails(garageId: string): Promise<void> {
    try {
      // Charger les informations du garage
      const garageRef = doc(db, 'garages', garageId);
      const garageSnap = await getDoc(garageRef);

      if (garageSnap.exists()) {
        const data = garageSnap.data();
        this.garage = {
          id: garageSnap.id,
          name: data['name'],
          address: data['address'],
          phone: data['phone'],
          email: data['email'],
          website: data['website'],
          logo: data['logo'],
          description: data['description'],
          businessHours: data['businessHours'],
          createdAt: data['createdAt']?.toDate(),
          updatedAt: data['updatedAt']?.toDate()
        } as Garage;

        // Charger les statistiques
        await this.loadStatistics(garageId);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des détails du garage:', error);
    }
  }

  async loadStatistics(garageId: string): Promise<void> {
    try {
      // Compter les clients
      const clientsRef = collection(db, 'clients');
      const clientsQuery = query(clientsRef, where('garageId', '==', garageId));
      const clientsSnap = await getDocs(clientsQuery);
      this.statistics.registeredClients = clientsSnap.size;

      // Compter le personnel
      const staffRef = collection(db, 'personnel');
      const staffQuery = query(staffRef, where('garageId', '==', garageId));
      const staffSnap = await getDocs(staffQuery);
      this.statistics.staffCount = staffSnap.size;

      // Compter les véhicules
      const vehiclesRef = collection(db, 'vehicles');
      const vehiclesQuery = query(vehiclesRef, where('garageId', '==', garageId));
      const vehiclesSnap = await getDocs(vehiclesQuery);
      this.statistics.totalCars = vehiclesSnap.size;

      // Compter les véhicules en intervention
      const servicesRef = collection(db, 'services');
      const activeServicesQuery = query(servicesRef,
        where('garageId', '==', garageId),
        where('status', '==', 'in_progress')
      );
      const activeServicesSnap = await getDocs(activeServicesQuery);
      this.statistics.carsInService = activeServicesSnap.size;

      // Compter les devis
      const quotesRef = collection(db, 'quotes');
      const quotesQuery = query(quotesRef, where('garageId', '==', garageId));
      const quotesSnap = await getDocs(quotesQuery);
      this.statistics.quotesIssued = quotesSnap.size;

      // Compter les factures
      const invoicesRef = collection(db, 'invoices');
      const invoicesQuery = query(invoicesRef, where('garageId', '==', garageId));
      const invoicesSnap = await getDocs(invoicesQuery);

      let paidCount = 0;
      let unpaidCount = 0;
      let totalRevenue = 0;

      invoicesSnap.forEach(doc => {
        const invoice = doc.data();
        if (invoice['status'] === 'paid') {
          paidCount++;
          totalRevenue += invoice['totalAmount'] || 0;
        } else {
          unpaidCount++;
        }
      });

      this.statistics.paidInvoices = paidCount;
      this.statistics.unpaidInvoices = unpaidCount;
      this.statistics.revenue = totalRevenue;

      // Calculer les dépenses (exemple simplifié)
      const expensesRef = collection(db, 'expenses');
      const expensesQuery = query(expensesRef, where('garageId', '==', garageId));
      const expensesSnap = await getDocs(expensesQuery);

      let totalExpenses = 0;
      expensesSnap.forEach(doc => {
        const expense = doc.data();
        totalExpenses += expense['amount'] || 0;
      });

      this.statistics.expenses = totalExpenses;
      this.statistics.profit = this.statistics.revenue - this.statistics.expenses;

    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  }

//   retoure(){
//     alert("Retour au menu principal")
//     // this.router.navigate(['/garage']);
//   }
}