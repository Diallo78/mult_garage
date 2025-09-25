import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../../firebase.config';
import { Garage } from '../../models/garage.model';
import { AuthService } from '../../services/auth.service';
import { GarageDataService } from '../../services/garage-data.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-liste-setting',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `

    <div *ngIf="isLoading" class="flex justify-center items-center h-[60vh]">
      <div class="animate-pulse flex flex-col items-center">
        <div
          class="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-500"
        ></div>
        <p class="mt-4 text-gray-600">Chargement de votre espace...</p>
      </div>
    </div>

    <div *ngIf="!isLoading">
      <div class="p-6 bg-gray-50 min-h-screen">
        <div class="max-w-7xl mx-auto">
          <!-- En-tête avec animation -->
          <div class="mb-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:shadow-xl">
            <h1 class="text-3xl font-bold text-white mb-2">Liste des Garages</h1>
            <p class="text-blue-100">Gérez tous vos garages depuis cette interface</p>
          </div>

          <!-- Carte contenant le tableau -->
          <div class="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <!-- Barre de recherche (visuelle uniquement) -->
            <div class="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div class="relative w-64">
                <input type="text" placeholder="Rechercher un garage..." class="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                <div class="absolute left-3 top-2.5 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <div>
                <span class="text-sm text-gray-500">Total: {{ garages.length }} garage(s)</span>
              </div>
            </div>

            <!-- Tableau avec design amélioré -->
            <div class="overflow-x-auto">
              <table class="min-w-full">
                <thead>
                  <tr class="bg-gray-100 border-b border-gray-200">
                    <th class="py-4 px-6 text-left font-semibold text-gray-700 uppercase tracking-wider">Nom</th>
                    <th class="py-4 px-6 text-left font-semibold text-gray-700 uppercase tracking-wider">Adresse</th>
                    <th class="py-4 px-6 text-left font-semibold text-gray-700 uppercase tracking-wider">Téléphone</th>
                    <th class="py-4 px-6 text-left font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                    <th class="py-4 px-6 text-center font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr *ngFor="let garage of garages; let i = index"
                      class="hover:bg-blue-50 transition-colors duration-150 ease-in-out"
                      [ngClass]="{'bg-gray-50': i % 2 === 0}">
                    <td class="py-4 px-6 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                          {{ garage.name.charAt(0).toUpperCase() }}
                        </div>
                        <div class="ml-4">
                          <div class="text-sm font-medium text-gray-900">{{ garage.name }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="py-4 px-6 whitespace-nowrap text-sm text-gray-700">{{ garage.address }}</td>
                    <td class="py-4 px-6 whitespace-nowrap text-sm text-gray-700">{{ garage.phone }}</td>
                    <td class="py-4 px-6 whitespace-nowrap text-sm text-gray-700">
                      <a href="mailto:{{ garage.email }}" class="text-blue-600 hover:text-blue-800 hover:underline">{{ garage.email }}</a>
                    </td>
                    <td class="py-4 px-6 whitespace-nowrap text-center">
                      <button
                        [routerLink]="['/garage/detail', garage.id]"
                        class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-md flex items-center mx-auto">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Voir
                      </button>
                    </td>
                  </tr>
                  <tr *ngIf="garages.length === 0">
                    <td colspan="5" class="py-8 text-center">
                      <div class="flex flex-col items-center justify-center text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <p class="text-lg font-medium">Aucun garage trouvé</p>
                        <p class="text-sm mt-1">Ajoutez un nouveau garage pour commencer</p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination (visuelle uniquement) -->
            <div class="px-4 py-3 bg-gray-50 border-t border-gray-200 sm:px-6">
              <div class="flex items-center justify-between">
                <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p class="text-sm text-gray-700">
                      Affichage de <span class="font-medium">{{ garages.length }}</span> garage(s)
                    </p>
                  </div>
                  <div>
                    <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <a  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                        <span class="sr-only">Précédent</span>
                        <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                      </a>
                      <a  class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-blue-50 text-sm font-medium text-blue-600 hover:bg-blue-100">
                        1
                      </a>
                      <a  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                        <span class="sr-only">Suivant</span>
                        <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                        </svg>
                      </a>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  </div>
  `,
})
export class ListeSettingComponent implements OnInit {
  garages: Garage[] = [];
  isLoading = false;

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly garageService: GarageDataService,
  ) {}

  ngOnInit(): void {
    const user  = this.authService.getCurrentUser() as User;
    if (user?.role === 'SuperAdmin') {
      this.loadGarages();
    }
    else{
      this.loadGarage(user)
    }
  }

  async loadGarages(): Promise<void> {
    try {
      this.isLoading = true
      const garagesRef = collection(db, 'garages');
      const garagesSnapshot = await getDocs(garagesRef);


      this.garages = garagesSnapshot.docs.map(doc => {
        const data = doc.data();

        return {
          id: doc.id,
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
      });
    } catch (error) {
      console.error('Erreur lors du chargement des garages:', error);
    } finally { this.isLoading = false}
  }

  async loadGarage(user: User): Promise<void> {
    try {
      this.isLoading = true;

      const data = await this.garageService.getById<Garage>('garages', user.garageId) as Garage;

      // On peut directement affecter le garage récupéré
      this.garages = [
        {
          id: user.garageId, // l’ID est déjà connu via user.garageId
          name: data['name'],
          address: data['address'],
          phone: data['phone'],
          email: data['email'],
          website: data['website'],
          logo: data['logo'],
          description: data['description'],
          businessHours: data['businessHours'],
          createdAt: data['createdAt'],
          updatedAt: data['updatedAt'],
        } as Garage,
      ];

    } catch (error) {
      console.error('Erreur lors du chargement du garage unique:', error);
    } finally {
      this.isLoading = false;
    }
  }


}