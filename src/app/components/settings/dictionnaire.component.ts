import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";

@Component({
  selector: 'app-dictionnaire',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="p-6 space-y-6">
      <h2 class="text-2xl font-bold text-gray-800 mb-4">📘 Dictionnaire des Types d’Intervention</h2>

      <!-- Part -->
      <div class="border-l-4 border-blue-500 bg-blue-50 p-4 rounded shadow">
        <h3 class="text-xl font-semibold text-blue-700 mb-2">🧩 1. Part – Pièce</h3>
        <p class="text-gray-700 mb-2">
          Ce sont les composants physiques ou pièces détachées installés ou remplacés sur le véhicule.
        </p>
        <ul class="list-disc list-inside text-gray-600">
          <li>Filtre à huile</li>
          <li>Bougies</li>
          <li>Disques de frein</li>
          <li>Batterie</li>
          <li>Thermostat</li>
        </ul>
        <p class="mt-2 text-sm text-blue-600">📦 Sortis du stock.</p>
      </div>

      <!-- Labor -->
      <div class="border-l-4 border-green-500 bg-green-50 p-4 rounded shadow">
        <h3 class="text-xl font-semibold text-green-700 mb-2">👷 2. Labor – Main-d'œuvre</h3>
        <p class="text-gray-700 mb-2">
          Il s'agit du temps de travail du mécanicien, facturé à l’heure ou par opération.
        </p>
        <ul class="list-disc list-inside text-gray-600">
          <li>Remplacement moteur → 3h × 100 000 GNF = 300 000 GNF</li>
          <li>Diagnostic électronique</li>
          <li>Montage/démontage</li>
        </ul>
        <p class="mt-2 text-sm text-green-600">💡 Non lié au stock, mais facturé.</p>
      </div>

      <!-- Service -->
      <div class="border-l-4 border-purple-500 bg-purple-50 p-4 rounded shadow">
        <h3 class="text-xl font-semibold text-purple-700 mb-2">💼 3. Service – Prestation forfaitaire</h3>
        <p class="text-gray-700 mb-2">
          Ce sont des prestations globales incluant pièces + main-d’œuvre à un tarif fixe.
        </p>
        <ul class="list-disc list-inside text-gray-600">
          <li>Révision complète</li>
          <li>Contrôle technique</li>
          <li>Nettoyage moteur</li>
          <li>Reprogrammation calculateur</li>
        </ul>
        <p class="mt-2 text-sm text-purple-600">🧾 Prix unique pour une prestation complète.</p>
      </div>
    </div>

    <div class="p-6 space-y-6">
      <h2 class="text-2xl font-bold text-gray-800 mb-4">📋 Dictionnaire des Statuts</h2>

      <!-- Pending -->
      <div class="border-l-4 border-yellow-500 bg-yellow-50 p-4 rounded shadow">
        <h3 class="text-xl font-semibold text-yellow-700 mb-2">🕓 Pending – En attente</h3>
        <p class="text-gray-700">
          Le devis a été généré, mais il n’a pas encore été accepté par le client.
        </p>
        <p class="mt-1 text-sm text-yellow-600">⏳ En attente de validation ou de retour du client.</p>
      </div>

      <!-- Accepted -->
      <div class="border-l-4 border-blue-500 bg-blue-50 p-4 rounded shadow">
        <h3 class="text-xl font-semibold text-blue-700 mb-2">✅ Accepted – Accepté</h3>
        <p class="text-gray-700">
          Le client a approuvé le devis. L’intervention peut désormais être planifiée.
        </p>
        <p class="mt-1 text-sm text-blue-600">📅 Prêt à être réalisé par l’équipe technique.</p>
      </div>

      <!-- Completed -->
      <div class="border-l-4 border-green-500 bg-green-50 p-4 rounded shadow">
        <h3 class="text-xl font-semibold text-green-700 mb-2">🏁 Completed – Terminé</h3>
        <p class="text-gray-700">
          Le travail prévu dans le devis a été réalisé avec succès.
        </p>
        <p class="mt-1 text-sm text-green-600">🔒 Intervention finalisée, facturation possible.</p>
      </div>

      <!-- Cancelled -->
      <div class="border-l-4 border-red-500 bg-red-50 p-4 rounded shadow">
        <h3 class="text-xl font-semibold text-red-700 mb-2">❌ Cancelled – Annulé</h3>
        <p class="text-gray-700">
          Le devis a été annulé, soit par le client, soit par l’atelier.
        </p>
        <p class="mt-1 text-sm text-red-600">🚫 Aucun service ne sera rendu sur ce devis.</p>
      </div>
    </div>
  `
})
export class DictionnaireComponent {}
