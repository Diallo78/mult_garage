# Système de Gestion Multi-Garage Automobile

Une application web professionnelle pour la gestion complète de garages automobiles, développée avec Angular 18.2.0 et Firebase.

## 🚀 Fonctionnalités

### Authentification et Multi-Garage
- Connexion sécurisée avec Firebase Auth
- Gestion des rôles : Admin, Technicien, Réception, Comptable
- Isolation complète des données par garage
- Permissions granulaires

### Gestion des Clients et Véhicules
- Base de données clients complète
- Gestion des véhicules par client
- Historique des visites
- Recherche et filtrage avancés

### Diagnostic des Véhicules
- Formulaires de diagnostic détaillés
- Catégorisation des vérifications
- Signatures électroniques
- Génération de rapports PDF

### Système de Devis
- Création automatique à partir des diagnostics
- Calcul automatique des totaux et taxes
- Signature client électronique
- Historique des modifications
- Export PDF professionnel

### Gestion des Interventions
- Suivi des tâches et durées
- Assignation des techniciens
- Gestion des pièces et main-d'œuvre
- Coûts supplémentaires

### Facturation et Paiement
- Génération automatique des factures
- Gestion des acomptes
- Méthodes de paiement multiples
- Reçus et historique

### Rapports et Statistiques
- Tableaux de bord personnalisés
- Rapports par client, véhicule, technicien
- Statistiques financières
- Export CSV/PDF

## 🛠️ Technologies Utilisées

- **Frontend:** Angular 18.2.0 avec TypeScript
- **Backend:** Firebase (Firestore, Auth, Storage)
- **Styling:** Tailwind CSS
- **PDF:** jsPDF et html2canvas
- **UI Components:** Standalone Angular Components
- **Forms:** Angular Reactive Forms

## 📦 Installation

1. Cloner le projet
2. Installer les dépendances :
   ```bash
   npm install
   ```

3. Configurer Firebase dans `src/environments/environment.ts`

4. Démarrer le serveur de développement :
   ```bash
   npm start
   ```

## 🔧 Configuration Firebase

1. Créer un projet Firebase
2. Activer Authentication (Email/Password)
3. Configurer Firestore Database
4. Configurer Storage pour les fichiers
5. Importer les règles Firestore depuis `firestore.rules`

## 🏗️ Architecture

```
src/
├── app/
│   ├── components/          # Composants UI
│   ├── services/           # Services métier
│   ├── models/             # Modèles de données
│   ├── guards/             # Guards de sécurité
│   └── utils/              # Utilitaires
├── environments/           # Configuration
└── assets/                # Ressources statiques
```

## 🔐 Sécurité

- Authentification obligatoire
- Isolation des données par garage
- Règles Firestore strictes
- Permissions basées sur les rôles
- Validation côté client et serveur

## 📱 Responsive Design

- Interface adaptée mobile et desktop
- Composants optimisés pour tablettes
- Navigation intuitive
- Expérience utilisateur fluide

## 🚦 Démarrage Rapide

1. Démarrer l'application : `npm start`
2. Créer un garage et un utilisateur admin
3. Configurer les paramètres du garage
4. Commencer à gérer les clients et véhicules

## 📄 Licence

Ce projet est sous licence MIT.

## 🤝 Support

Pour toute question ou support, contactez l'équipe de développement.


<div class="card mt-6" *ngFor="let vehicle of vehicles">
  <h3 class="text-lg font-medium text-gray-900 mb-4">État des interventions pour {{ vehicle.brand }} {{ vehicle.model }}</h3>

  <div *ngFor="let intervention of getInterventionsByVehicle(vehicle.id)" class="mb-4 border p-4 rounded-md bg-gray-50">
    <p class="text-sm text-gray-600 mb-2">
      Intervention #{{ intervention.id }} -
      <strong>Status:</strong> {{ intervention.status }} -
      <strong>Date:</strong> {{ intervention.startDate | firestoreDate | date:'short' }}
    </p>

    <div class="space-y-2">
      <div *ngFor="let task of intervention.tasks">
        <div class="flex justify-between items-start text-sm">
          <div>
            <strong [ngClass]="{
              'text-green-600': task.completed,
              'text-yellow-600': task.status === 'Suspended',
              'text-gray-700': !task.completed && task.status !== 'Suspended'
            }">
              • {{ task.description }}
            </strong>
            <span *ngIf="task.status === 'Suspended'" class="text-xs text-red-500 block mt-1 ml-2">
              ❗Suspendue : {{ task.suspendReason || 'Aucune raison fournie' }}
            </span>
          </div>
          <div class="text-xs text-gray-500">
            {{ task.completed ? '✔️ Terminé' : task.status || 'En attente' }}
          </div>
        </div>
      </div>
    </div>

  </div>

</div>

CarGest 🚘📑 → gestion complète des données garage.