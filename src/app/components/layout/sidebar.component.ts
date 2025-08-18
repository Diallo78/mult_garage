import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { Observable, Subject } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)' }),
        animate('300ms ease-in-out', style({ transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in-out', style({ transform: 'translateX(-100%)' }))
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-in-out', style({ opacity: 1 }))
      ])
    ])
  ],
  template: `
    <!-- Overlay pour mobile -->
    <div
      *ngIf="isSidebarOpen"
      class="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
      (click)="toggleSidebar()"
      @fadeIn
    ></div>

    <!-- Toggle button visible uniquement sur mobile -->
    <button
      class="lg:hidden fixed top-20 left-4 z-50 bg-white dark:bg-gray-100 shadow-lg text-gray-800 dark:text-orange-300 hover:bg-gray-100 dark:hover:bg-gray-600 p-3 rounded-full transition-all duration-200 ease-in-out"
      (click)="toggleSidebar()"
      [class.left-4]="!isSidebarOpen"
      [class.left-72]="isSidebarOpen"
      aria-label="Toggle sidebar"
    >
      <svg
        class="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          *ngIf="!isSidebarOpen"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 6h16M4 12h16M4 18h16"
        />
        <path
          *ngIf="isSidebarOpen"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>

    <!-- Sidebar -->
    <div
      class="fixed inset-y-0 left-0 z-40 w-72 bg-gray-800 dark:bg-gray-900 text-white transform transition-all duration-300 ease-in-out shadow-xl
             lg:relative lg:translate-x-0 lg:w-64 lg:min-h-screen lg:shadow-none"
      [class.-translate-x-full]="!isSidebarOpen"
    >
    <!--       @slideInOut -->
      <!-- Header du sidebar -->
      <div class="p-4 border-b border-gray-700 dark:border-gray-800">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <!-- <img src="/assets/logo.png" alt="Logo" class="h-8 w-8" *ngIf="logoUrl" /> -->
            <h2 class="text-lg sm:text-xl font-semibold text-white">
              <!-- Multi Garage -->
               Navigation
            </h2>
          </div>
          <div class="flex items-center space-x-2">
            <button
              class="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700 transition-colors duration-200"
              (click)="toggleTheme()"
              aria-label="Toggle theme"
            >
              <svg *ngIf="isDarkTheme" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" fill-rule="evenodd" clip-rule="evenodd"></path>
              </svg>
              <svg *ngIf="!isDarkTheme" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
              </svg>
            </button>
            <!-- <button
              class="lg:hidden text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700 transition-colors duration-200"
              (click)="toggleSidebar()"
              aria-label="Close sidebar"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button> -->
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="p-4 space-y-1 overflow-y-auto overflow-x-hidden max-h-[calc(100vh-120px)]">
        <!-- Sections -->
        <div class="mb-4">
          <p class="text-xs uppercase text-gray-400 dark:text-gray-500 font-semibold mb-2 px-3">Principal</p>

          <a
            routerLink="/dashboard"
            routerLinkActive="bg-primary-600 text-white dark:bg-primary-700"
            [routerLinkActiveOptions]="{exact: true}"
            class="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-800 transition-all duration-200 ease-in-out text-sm group"
            (click)="closeSidebarOnMobile()"
          >
            <div class="flex items-center">
              <div class="mr-3 flex items-center justify-center w-8 h-8 rounded-md bg-blue-500 bg-opacity-20 text-blue-500 group-hover:bg-opacity-30 transition-all duration-200">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                </svg>
              </div>
              <span class="truncate">Dashboard</span>
            </div>
            <div *ngIf="notificationCount.dashboard > 0" class="flex-shrink-0 ml-2">
              <span class="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">{{ notificationCount.dashboard }}</span>
            </div>
          </a>

          <a
            routerLink="/clients"
            routerLinkActive="bg-primary-600 text-white dark:bg-primary-700"
            (click)="closeSidebarOnMobile()"
            class="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-800 transition-all duration-200 ease-in-out text-sm group mt-1"
            *ngIf="authService.canccessDashboard"
          >
            <div class="flex items-center">
              <div class="mr-3 flex items-center justify-center w-8 h-8 rounded-md bg-green-500 bg-opacity-20 text-green-500 group-hover:bg-opacity-30 transition-all duration-200">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
              </div>
              <span class="truncate">Clients</span>
            </div>
            <div *ngIf="notificationCount.clients > 0" class="flex-shrink-0 ml-2">
              <span class="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">{{ notificationCount.clients }}</span>
            </div>
          </a>

          <a
            routerLink="/suivi"
            routerLinkActive="bg-primary-600 text-white dark:bg-primary-700"
            (click)="closeSidebarOnMobile()"
            class="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-800 transition-all duration-200 ease-in-out text-sm group mt-1"
            *ngIf="authService.isClient"
          >
            <div class="flex items-center">
              <div class="mr-3 flex items-center justify-center w-8 h-8 rounded-md bg-purple-500 bg-opacity-20 text-purple-500 group-hover:bg-opacity-30 transition-all duration-200">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                </svg>
              </div>
              <span class="truncate">Status Véhicule</span>
            </div>
          </a>
        </div>

        <div class="mb-4">
          <p class="text-xs uppercase text-gray-400 dark:text-gray-500 font-semibold mb-2 px-3">Gestion</p>

          <a
            routerLink="/vehicles"
            routerLinkActive="bg-primary-600 text-white dark:bg-primary-700"
            (click)="closeSidebarOnMobile()"
            class="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-800 transition-all duration-200 ease-in-out text-sm group"
          >
            <div class="flex items-center">
              <div class="mr-3 flex items-center justify-center w-8 h-8 rounded-md bg-red-500 bg-opacity-20 text-red-500 group-hover:bg-opacity-30 transition-all duration-200">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                  <path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                </svg>
              </div>
              <span class="truncate">Véhicules</span>
            </div>
            <div *ngIf="notificationCount.vehicles > 0" class="flex-shrink-0 ml-2">
              <span class="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">{{ notificationCount.vehicles }}</span>
            </div>
          </a>

          <a
            routerLink="/visits"
            routerLinkActive="bg-primary-600 text-white dark:bg-primary-700"
            (click)="closeSidebarOnMobile()"
            class="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-800 transition-all duration-200 ease-in-out text-sm group mt-1"
          >
            <div class="flex items-center">
              <div class="mr-3 flex items-center justify-center w-8 h-8 rounded-md bg-yellow-500 bg-opacity-20 text-yellow-500 group-hover:bg-opacity-30 transition-all duration-200">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <span class="truncate">Visites</span>
            </div>
          </a>

          <a
            routerLink="/diagnostics"
            routerLinkActive="bg-primary-600 text-white dark:bg-primary-700"
            (click)="closeSidebarOnMobile()"
            class="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-800 transition-all duration-200 ease-in-out text-sm group mt-1"
            *ngIf="authService.canAccessDiagnostics"
          >
            <div class="flex items-center">
              <div class="mr-3 flex items-center justify-center w-8 h-8 rounded-md bg-indigo-500 bg-opacity-20 text-indigo-500 group-hover:bg-opacity-30 transition-all duration-200">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <span class="truncate">Diagnostics</span>
            </div>
          </a>
        </div>

        <div class="mb-4">
          <p class="text-xs uppercase text-gray-400 dark:text-gray-500 font-semibold mb-2 px-3">Finance</p>

          <a
            routerLink="/quotes"
          routerLinkActive="bg-primary-600 text-white dark:bg-primary-700"
          (click)="closeSidebarOnMobile()"
          class="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-800 transition-all duration-200 ease-in-out text-sm group"
        >
          <div class="flex items-center">
            <div class="mr-3 flex items-center justify-center w-8 h-8 rounded-md bg-orange-500 bg-opacity-20 text-orange-500 group-hover:bg-opacity-30 transition-all duration-200">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <span class="truncate">Devis</span>
          </div>
          <div *ngIf="notificationCount.quotes > 0" class="flex-shrink-0 ml-2">
            <span class="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">{{ notificationCount.quotes }}</span>
          </div>
        </a>

        <a
          routerLink="/interventions"
          routerLinkActive="bg-primary-600 text-white dark:bg-primary-700"
          (click)="closeSidebarOnMobile()"
          class="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-800 transition-all duration-200 ease-in-out text-sm group mt-1"
        >
          <div class="flex items-center">
            <div class="mr-3 flex items-center justify-center w-8 h-8 rounded-md bg-teal-500 bg-opacity-20 text-teal-500 group-hover:bg-opacity-30 transition-all duration-200">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </div>
            <span class="truncate">Interventions</span>
          </div>
          <div *ngIf="notificationCount.interventions > 0" class="flex-shrink-0 ml-2">
            <span class="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">{{ notificationCount.interventions }}</span>
          </div>
        </a>

        <a
          routerLink="/invoices"
          routerLinkActive="bg-primary-600 text-white dark:bg-primary-700"
          (click)="closeSidebarOnMobile()"
          class="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-800 transition-all duration-200 ease-in-out text-sm group mt-1"
        >
          <div class="flex items-center">
            <div class="mr-3 flex items-center justify-center w-8 h-8 rounded-md bg-pink-500 bg-opacity-20 text-pink-500 group-hover:bg-opacity-30 transition-all duration-200">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <span class="truncate">Factures</span>
          </div>
          <div *ngIf="notificationCount.invoices > 0" class="flex-shrink-0 ml-2">
            <span class="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">{{ notificationCount.invoices }}</span>
          </div>
        </a>

        <a
          routerLink="/payments"
          routerLinkActive="bg-primary-600 text-white dark:bg-primary-700"
          (click)="closeSidebarOnMobile()"
          class="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-800 transition-all duration-200 ease-in-out text-sm group mt-1"
        >
          <div class="flex items-center">
            <div class="mr-3 flex items-center justify-center w-8 h-8 rounded-md bg-green-500 bg-opacity-20 text-green-500 group-hover:bg-opacity-30 transition-all duration-200">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <span class="truncate">Paiements</span>
          </div>
        </a>

        <a
          routerLink="/reports"
          routerLinkActive="bg-primary-600 text-white dark:bg-primary-700"
          (click)="closeSidebarOnMobile()"
          class="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-800 transition-all duration-200 ease-in-out text-sm group mt-1"
          *ngIf="authService.canAccessReports"
        >
          <div class="flex items-center">
            <div class="mr-3 flex items-center justify-center w-8 h-8 rounded-md bg-blue-500 bg-opacity-20 text-blue-500 group-hover:bg-opacity-30 transition-all duration-200">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <span class="truncate">Rapports</span>
          </div>
        </a>
      </div>

        <div class="mb-4">
          <p class="text-xs uppercase text-gray-400 dark:text-gray-500 font-semibold mb-2 px-3">Administration</p>

          <a
            routerLink="/stockDashboard"
            routerLinkActive="bg-primary-600 text-white dark:bg-primary-700"
            (click)="closeSidebarOnMobile()"
            class="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-800 transition-all duration-200 ease-in-out text-sm group"
            *ngIf="authService.canAccessPersonnel"
          >
            <div class="flex items-center">
              <div class="mr-3 flex items-center justify-center w-8 h-8 rounded-md bg-amber-500 bg-opacity-20 text-amber-500 group-hover:bg-opacity-30 transition-all duration-200">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
              </div>
              <span class="truncate">Stocks</span>
            </div>

          </a>

          <a
            routerLink="/personnel"
            routerLinkActive="bg-primary-600 text-white dark:bg-primary-700"
            (click)="closeSidebarOnMobile()"
            class="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-800 transition-all duration-200 ease-in-out text-sm group mt-1"
            *ngIf="authService.canAccessPersonnel"
          >
            <div class="flex items-center">
              <div class="mr-3 flex items-center justify-center w-8 h-8 rounded-md bg-purple-500 bg-opacity-20 text-purple-500 group-hover:bg-opacity-30 transition-all duration-200">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <span class="truncate">Personnel</span>
            </div>
          </a>

          <a
            routerLink="/garage-setup"
            routerLinkActive="bg-primary-600 text-white dark:bg-primary-700"
            (click)="closeSidebarOnMobile()"
            class="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-800 transition-all duration-200 ease-in-out text-sm group mt-1"
            *ngIf="authService.canAccessSuperAdmin"
          >
            <div class="flex items-center">
              <div class="mr-3 flex items-center justify-center w-8 h-8 rounded-md bg-gray-500 bg-opacity-20 text-gray-500 group-hover:bg-opacity-30 transition-all duration-200">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </div>
              <span class="truncate">Configuration</span>
            </div>
          </a>
        </div>
      </nav>
    </div>
  `,
})
export class SidebarComponent implements OnInit, OnDestroy {
  currentUser$: Observable<User | null>;
  isSidebarOpen = false;
  isDarkTheme = false;
  logoUrl = '/assets/logo.png';
  private destroy$ = new Subject<void>();

  // Notification counters
  notificationCount = {
    dashboard: 0,
    clients: 2,
    vehicles: 3,
    quotes: 1,
    interventions: 0,
    invoices: 5,
    stockDashboard: 2
  };

  constructor(public authService: AuthService) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    this.isDarkTheme = savedTheme === 'dark';
    this.applyTheme();

    // Subscribe to theme changes if needed
    // this.themeService.isDarkTheme$.pipe(takeUntil(this.destroy$)).subscribe(isDark => {
    //   this.isDarkTheme = isDark;
    // });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light');
    this.applyTheme();
  }

  applyTheme(): void {
    if (this.isDarkTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebarOnMobile(): void {
    if (window.innerWidth < 1024) {
      // lg breakpoint
      this.isSidebarOpen = false;
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    if (window.innerWidth >= 1024) {
      this.isSidebarOpen = true;
    } else {
      this.isSidebarOpen = false;
    }
  }
}
