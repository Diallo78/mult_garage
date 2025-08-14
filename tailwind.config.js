/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    screens: {
      xs: "375px", // Petit mobile
      sm: "480px", // Mobile
      md: "768px", // Tablette portrait
      lg: "1024px", // Tablette paysage
      xl: "1280px", // Desktop
      "2xl": "1440px", // Grand écran
      "3xl": "1920px", // Très grand écran
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        transparent: "transparent",
        current: "currentColor",
        primary: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
        secondary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        accent: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
      },
      fontFamily: {
        sans: [
          "Cambria",
          "Inter", // Police moderne pour UI
          "system-ui",
          "-apple-system", // Bonne lisiibilité mobile
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          '"Noto Sans"',
          "sans-serif",
        ],
        serif: [
          // Garde tes polices serif pour desktop
          "Cambria",
          "Georgia",
          "Baskerville",
          "serif",
        ],
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out both",
        "slide-in": "slideIn 0.3s ease-out both",
        "slide-out": "slideOut 0.3s ease-in both",
        "scale-in": "scaleIn 0.2s ease-out both",
        "bounce-in": "bounceIn 0.5s ease-out both",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        slideIn: {
          "0%": { transform: "translateX(-100%)", opacity: 0 },
          "100%": { transform: "translateX(0)", opacity: 1 },
        },
        slideOut: {
          "0%": { transform: "translateX(0)", opacity: 1 },
          "100%": { transform: "translateX(-100%)", opacity: 0 },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: 0 },
          "100%": { transform: "scale(1)", opacity: 1 },
        },
        bounceIn: {
          "0%": { transform: "scale(0.3)", opacity: 0 },
          "50%": { transform: "scale(1.05)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)", opacity: 1 },
        },
      },
      spacing: {
        "mobile-padding": "1rem", // Padding par défaut mobile
        "tablet-padding": "1.5rem", // Padding par défaut tablette
        "desktop-padding": "2rem", // Padding par défaut desktop
        "mobile-margin": "1rem", // Margin par défaut mobile
        "tablet-margin": "1.5rem", // Margin par défaut tablette
        "desktop-margin": "2rem", // Margin par défaut desktop
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1" }],
        "6xl": ["3.75rem", { lineHeight: "1" }],
      },
      borderRadius: {
        xs: "0.125rem",
        sm: "0.25rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        mobile:
          "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        tablet:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        desktop:
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      },
      transitionDuration: {
        fast: "150ms",
        normal: "300ms",
        slow: "500ms",
      },
      transitionTimingFunction: {
        bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      zIndex: {
        "mobile-menu": "1000",
        sidebar: "1100",
        modal: "1200",
        tooltip: "1300",
        notification: "1400",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    // Plugin personnalisé pour les utilitaires responsifs
    function ({ addUtilities, theme }) {
      const newUtilities = {
        ".mobile-container": {
          padding: theme("spacing.mobile-padding"),
          margin: theme("spacing.mobile-margin"),
        },
        ".tablet-container": {
          padding: theme("spacing.tablet-padding"),
          margin: theme("spacing.tablet-margin"),
        },
        ".desktop-container": {
          padding: theme("spacing.desktop-padding"),
          margin: theme("spacing.desktop-margin"),
        },
        ".mobile-text": {
          fontSize: theme("fontSize.sm"),
          lineHeight: theme("fontSize.sm[1].lineHeight"),
        },
        ".tablet-text": {
          fontSize: theme("fontSize.base"),
          lineHeight: theme("fontSize.base[1].lineHeight"),
        },
        ".desktop-text": {
          fontSize: theme("fontSize.lg"),
          lineHeight: theme("fontSize.lg[1].lineHeight"),
        },
        ".mobile-card": {
          padding: theme("spacing.mobile-padding"),
          borderRadius: theme("borderRadius.lg"),
          boxShadow: theme("boxShadow.mobile"),
        },
        ".tablet-card": {
          padding: theme("spacing.tablet-padding"),
          borderRadius: theme("borderRadius.xl"),
          boxShadow: theme("boxShadow.tablet"),
        },
        ".desktop-card": {
          padding: theme("spacing.desktop-padding"),
          borderRadius: theme("borderRadius.2xl"),
          boxShadow: theme("boxShadow.desktop"),
        },
      };
      addUtilities(newUtilities);
    },
  ],
};
