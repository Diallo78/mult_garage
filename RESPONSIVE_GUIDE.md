# Guide de Responsivité - Multi-Garage

## 🎯 Vue d'ensemble

Ce guide explique comment utiliser les nouvelles classes responsives ajoutées à l'application Multi-Garage pour une expérience optimale sur mobile, tablette et desktop.

## 📱 Breakpoints

### Breakpoints Tailwind personnalisés

```css
xs: 375px    /* Petit mobile */
sm: 480px    /* Mobile */
md: 768px    /* Tablette portrait */
lg: 1024px   /* Tablette paysage */
xl: 1280px   /* Desktop */
2xl: 1440px  /* Grand écran */
3xl: 1920px  /* Très grand écran */
```

## 🎨 Classes Utilitaires Responsives

### 1. Conteneurs Responsifs

```html
<!-- Conteneur avec padding/margin adaptatif -->
<div class="mobile-container">
  <!-- Mobile: 1rem -->
  <div class="tablet-container">
    <!-- Tablette: 1.5rem -->
    <div class="desktop-container"><!-- Desktop: 2rem --></div>
  </div>
</div>
```

### 2. Texte Responsif

```html
<!-- Taille de texte adaptative -->
<p class="mobile-text"><!-- Mobile: 0.875rem --></p>
<p class="tablet-text"><!-- Tablette: 1rem --></p>
<p class="desktop-text">
  <!-- Desktop: 1.125rem -->

  <!-- Classes Tailwind standard -->
</p>

<p class="text-xs sm:text-sm lg:text-base xl:text-lg"></p>
```

### 3. Cartes Responsives

```html
<!-- Cartes avec ombres et padding adaptatifs -->
<div class="mobile-card">
  <!-- Ombre légère, padding 1rem -->
  <div class="tablet-card">
    <!-- Ombre moyenne, padding 1.5rem -->
    <div class="desktop-card"><!-- Ombre forte, padding 2rem --></div>
  </div>
</div>
```

### 4. Grilles Responsives

```html
<!-- Grilles qui s'adaptent automatiquement -->
<div class="responsive-grid-1">
  <!-- 1 colonne sur tous les écrans -->
  <div class="responsive-grid-2">
    <!-- 1 colonne mobile, 2 colonnes tablette+ -->
    <div class="responsive-grid-3">
      <!-- 1 mobile, 2 tablette, 3 desktop -->
      <div class="responsive-grid-4"><!-- 1 mobile, 2 tablette, 3 desktop, 4 grand écran --></div>
    </div>
  </div>
</div>
```

### 5. Espacement Responsif

```html
<!-- Espacement vertical adaptatif -->
<div class="space-responsive">
  <!-- space-y-3 sm:space-y-4 lg:space-y-6 -->
  <div class="space-x-responsive"><!-- space-x-3 sm:space-x-4 lg:space-x-6 --></div>
</div>
```

### 6. Transitions

```html
<!-- Transitions avec durées différentes -->
<div class="transition-fast">
  <!-- 150ms -->
  <div class="transition-smooth">
    <!-- 300ms -->
    <div class="transition-slow"><!-- 500ms --></div>
  </div>
</div>
```

## 📱 Optimisations Mobile Spécifiques

### 1. Navigation Mobile

```html
<!-- Éléments de navigation optimisés pour mobile -->
<a class="mobile-nav-item">
  <span class="mobile-nav-icon">📊</span>
  <span class="mobile-nav-text">Dashboard</span>
</a>
```

### 2. Boutons Tactiles

```html
<!-- Boutons avec zone de clic optimisée -->
<button class="touch-target">Cliquez ici</button>
```

### 3. Tableaux Responsifs

```html
<!-- Tableaux avec scroll horizontal sur mobile -->
<div class="responsive-table-container">
  <table class="responsive-table">
    <!-- Contenu du tableau -->
  </table>
</div>
```

## 🎭 Animations Responsives

### 1. Animations d'Entrée

```html
<div class="animate-fade-in">
  <!-- Fade in 0.6s -->
  <div class="animate-slide-in">
    <!-- Slide in 0.3s -->
    <div class="animate-scale-in">
      <!-- Scale in 0.2s -->
      <div class="animate-bounce-in"><!-- Bounce in 0.5s --></div>
    </div>
  </div>
</div>
```

### 2. Transitions de Composants

```html
<!-- Transitions fluides pour les composants -->
<div class="transition-smooth">
  <!-- 300ms ease-in-out -->
  <div class="transition-fast"><!-- 200ms ease-in-out --></div>
</div>
```

## 🔧 Classes Conditionnelles

### 1. Affichage par Breakpoint

```html
<!-- Éléments visibles uniquement sur certains écrans -->
<div class="mobile-hidden">
  <!-- Caché sur mobile -->
  <div class="tablet-hidden">
    <!-- Caché sur tablette -->
    <div class="desktop-hidden">
      <!-- Caché sur desktop -->

      <div class="mobile-block">
        <!-- Affiché en block sur mobile -->
        <div class="tablet-flex">
          <!-- Affiché en flex sur tablette -->
          <div class="desktop-block"><!-- Affiché en block sur desktop --></div>
        </div>
      </div>
    </div>
  </div>
</div>
```

### 2. Utilisation avec ngClass

```typescript
// Dans vos composants Angular
<div [ngClass]="{
  'mobile-container': true,
  'lg:desktop-container': isLargeScreen
}">
```

## 📋 Exemples Pratiques

### 1. Formulaire Responsif

```html
<div class="card mobile-card">
  <h2 class="mobile-heading mb-4">Nouveau Client</h2>

  <div class="space-responsive">
    <div class="form-group">
      <label class="form-label">Nom</label>
      <input class="form-input" type="text" />
    </div>

    <div class="form-group">
      <label class="form-label">Email</label>
      <input class="form-input" type="email" />
    </div>
  </div>

  <div class="flex flex-col sm:flex-row gap-3 mt-6">
    <button class="btn-primary flex-1">Enregistrer</button>
    <button class="btn-secondary flex-1">Annuler</button>
  </div>
</div>
```

### 2. Dashboard Responsif

```html
<div class="mobile-container">
  <h1 class="mobile-heading mb-6">Tableau de Bord</h1>

  <div class="responsive-grid-2 lg:responsive-grid-4 gap-4">
    <div class="card mobile-card">
      <h3 class="mobile-text font-semibold">Clients</h3>
      <p class="text-2xl font-bold text-primary-600">1,234</p>
    </div>

    <div class="card mobile-card">
      <h3 class="mobile-text font-semibold">Véhicules</h3>
      <p class="text-2xl font-bold text-primary-600">2,567</p>
    </div>

    <div class="card mobile-card">
      <h3 class="mobile-text font-semibold">Interventions</h3>
      <p class="text-2xl font-bold text-primary-600">89</p>
    </div>

    <div class="card mobile-card">
      <h3 class="mobile-text font-semibold">Chiffre d'affaires</h3>
      <p class="text-2xl font-bold text-primary-600">€45,678</p>
    </div>
  </div>
</div>
```

### 3. Navigation Mobile

```html
<!-- Sidebar responsive -->
<div class="fixed inset-y-0 left-0 z-sidebar w-72 bg-gray-800 transform transition-all duration-300 ease-in-out shadow-xl lg:relative lg:translate-x-0 lg:w-64 lg:min-h-screen lg:shadow-none">
  <!-- Header -->
  <div class="p-4 border-b border-gray-700">
    <div class="flex items-center justify-between">
      <h2 class="text-lg sm:text-xl font-semibold text-white">Navigation</h2>
      <button class="lg:hidden text-gray-400 hover:text-white p-1 rounded">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>

  <!-- Navigation -->
  <nav class="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-120px)]">
    <a class="mobile-nav-item" routerLink="/dashboard">
      <span class="mobile-nav-icon">📊</span>
      <span class="mobile-nav-text">Dashboard</span>
    </a>
  </nav>
</div>
```

## 🚀 Bonnes Pratiques

### 1. Mobile-First

- Commencez toujours par concevoir pour mobile
- Utilisez les classes `sm:`, `md:`, `lg:` pour améliorer progressivement
- Testez sur de vrais appareils mobiles

### 2. Performance

- Utilisez `transition-fast` pour les interactions fréquentes
- Évitez les animations complexes sur mobile
- Optimisez les images pour mobile

### 3. Accessibilité

- Utilisez `touch-target` pour les boutons sur mobile
- Assurez-vous que la taille de texte est lisible sur tous les écrans
- Testez la navigation au clavier

### 4. Tests

- Testez sur différents appareils et navigateurs
- Vérifiez la lisibilité sur petits écrans
- Testez les interactions tactiles

## 🔍 Dépannage

### Problèmes Courants

1. **Sidebar qui ne se ferme pas sur mobile**

   - Vérifiez que `closeSidebarOnMobile()` est appelé
   - Assurez-vous que `isSidebarOpen` est correctement géré

2. **Grilles qui ne s'adaptent pas**

   - Vérifiez l'ordre des classes CSS
   - Utilisez `responsive-grid-*` pour une gestion automatique

3. **Animations qui ne fonctionnent pas**
   - Vérifiez que les classes d'animation sont bien définies
   - Assurez-vous que Tailwind est recompilé

## 📚 Ressources

- [Documentation Tailwind CSS](https://tailwindcss.com/docs)
- [Guide des breakpoints](https://tailwindcss.com/docs/responsive-design)
- [Animations CSS](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations)

---

**Note**: Ces classes sont optimisées pour l'application Multi-Garage et peuvent nécessiter des ajustements selon vos besoins spécifiques.
