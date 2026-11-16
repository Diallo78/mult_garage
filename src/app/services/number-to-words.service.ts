import { Injectable } from '@angular/core';

interface CurrencyInfo {
  singular: string;
  plural: string;
  decimalSingular?: string;
  decimalPlural?: string;
  hasDecimals: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class NumberToWordsService {
  private readonly UNITS = [
    '',
    'un',
    'deux',
    'trois',
    'quatre',
    'cinq',
    'six',
    'sept',
    'huit',
    'neuf',
    'dix',
    'onze',
    'douze',
    'treize',
    'quatorze',
    'quinze',
    'seize',
    'dix-sept',
    'dix-huit',
    'dix-neuf',
  ];

  private readonly TENS = [
    '',
    '',
    'vingt',
    'trente',
    'quarante',
    'cinquante',
    'soixante',
  ];

  private readonly CURRENCIES: Record<string, CurrencyInfo> = {
    GNF: {
      singular: 'franc guinéen',
      plural: 'francs guinéens',
      hasDecimals: false,
    },
    FG: {
      singular: 'franc guinéen',
      plural: 'francs guinéens',
      hasDecimals: false,
    },
    XOF: {
      singular: 'franc CFA',
      plural: 'francs CFA',
      hasDecimals: false,
    },
    CFA: {
      singular: 'franc CFA',
      plural: 'francs CFA',
      hasDecimals: false,
    },
    FCFA: {
      singular: 'franc CFA',
      plural: 'francs CFA',
      hasDecimals: false,
    },
    EUR: {
      singular: 'euro',
      plural: 'euros',
      decimalSingular: 'centime',
      decimalPlural: 'centimes',
      hasDecimals: true,
    },
    '€': {
      singular: 'euro',
      plural: 'euros',
      decimalSingular: 'centime',
      decimalPlural: 'centimes',
      hasDecimals: true,
    },
    USD: {
      singular: 'dollar',
      plural: 'dollars',
      decimalSingular: 'cent',
      decimalPlural: 'cents',
      hasDecimals: true,
    },
    '$': {
      singular: 'dollar',
      plural: 'dollars',
      decimalSingular: 'cent',
      decimalPlural: 'cents',
      hasDecimals: true,
    },
    CAD: {
      singular: 'dollar canadien',
      plural: 'dollars canadiens',
      decimalSingular: 'cent',
      decimalPlural: 'cents',
      hasDecimals: true,
    },
    GBP: {
      singular: 'livre sterling',
      plural: 'livres sterling',
      decimalSingular: 'penny',
      decimalPlural: 'pence',
      hasDecimals: true,
    },
  };

  /**
   * Convertit un montant numérique en toutes lettres en français avec devise.
   * Exemples :
   *   1 250 000 GNF -> "Un million deux cent cinquante mille francs guinéens"
   *   1 000 000 000 GNF -> "Un milliard de francs guinéens"
   *   1 500.50 EUR -> "Mille cinq cents euros et cinquante centimes"
   */
  toWords(amount: number | null | undefined, currencyCode = 'GNF'): string {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '';
    }

    const absAmount = Math.abs(amount);
    const currency = this.resolveCurrency(currencyCode);

    // Décomposition partie entière et partie décimale
    const integerPart = Math.floor(absAmount);
    const decimalPart = currency.hasDecimals
      ? Math.round((absAmount - integerPart) * 100)
      : 0;

    let integerWords = '';
    if (integerPart === 0) {
      integerWords = 'zéro';
    } else {
      integerWords = this.convertInteger(integerPart);
    }

    // Gestion de la liaison "de" si le nombre se termine directement par million ou milliard
    const currencyName = this.getCurrencyName(integerPart, currency);
    const needsDe = this.endsWithMillionOrMilliard(integerPart);

    let result = `${integerWords}${needsDe ? ' de ' : ' '}${currencyName}`;

    if (currency.hasDecimals && decimalPart > 0) {
      const decimalWords = this.convertInteger(decimalPart);
      const decimalName =
        decimalPart > 1 ? currency.decimalPlural : currency.decimalSingular;
      result += ` et ${decimalWords} ${decimalName}`;
    }

    // Majuscule initiale et point final
    result = result.trim();
    if (result.length > 0) {
      result = result.charAt(0).toUpperCase() + result.slice(1);
    }

    return result;
  }

  /**
   * Convertit un entier positif (< 10^15) en texte français selon la grammaire standard.
   */
  convertInteger(n: number): string {
    if (n === 0) return 'zéro';

    const chunks: { value: number; singular: string; plural: string }[] = [
      { value: 1000000000000, singular: 'billion', plural: 'billions' },
      { value: 1000000000, singular: 'milliard', plural: 'milliards' },
      { value: 1000000, singular: 'million', plural: 'millions' },
      { value: 1000, singular: 'mille', plural: 'mille' },
      { value: 1, singular: '', plural: '' },
    ];

    let remainder = n;
    const parts: string[] = [];

    for (const chunk of chunks) {
      if (remainder >= chunk.value) {
        const count = Math.floor(remainder / chunk.value);
        remainder = remainder % chunk.value;

        if (chunk.value === 1000) {
          // Règle française : on dit "mille" et non "un mille"
          if (count === 1) {
            parts.push('mille');
          } else {
            // Note : pour les milliers, 'cent' et 'vingt' ne prennent pas de s
            // car 'mille' est un adjectif numéral invariable (ex: deux cent mille)
            const countText = this.convertHundreds(count, false);
            parts.push(`${countText} mille`);
          }
        } else if (chunk.value >= 1000000) {
          // 'million' et 'milliard' sont des noms : 'cent' et 'vingt' prennent le pluriel
          // s'ils les précèdent directement (ex: deux cents millions)
          const countText = this.convertHundreds(count, true);
          const label = count > 1 ? chunk.plural : chunk.singular;
          parts.push(`${countText} ${label}`);
        } else {
          // Moins de 1000
          if (count > 0) {
            // Ici c'est la fin du nombre, 'cent' et 'vingt' s'accordent si rien ne suit
            parts.push(this.convertHundreds(count, true));
          }
        }
      }
    }

    return parts.join(' ').trim();
  }

  /**
   * Convertit un nombre de 1 à 999.
   * @param allowPlurals indique si 'cents' et 'vingts' peuvent prendre un 's' s'ils sont multipliés et en fin de bloc
   */
  private convertHundreds(n: number, allowPlurals = true): string {
    if (n === 0) return '';
    const parts: string[] = [];

    const hundreds = Math.floor(n / 100);
    const remainder = n % 100;

    if (hundreds > 0) {
      if (hundreds === 1) {
        parts.push('cent');
      } else {
        // "deux cents" si rien ne suit et que les pluriels sont autorisés
        if (remainder === 0 && allowPlurals) {
          parts.push(`${this.UNITS[hundreds]} cents`);
        } else {
          parts.push(`${this.UNITS[hundreds]} cent`);
        }
      }
    }

    if (remainder > 0) {
      parts.push(this.convertTensAndUnits(remainder, allowPlurals));
    }

    return parts.join(' ').trim();
  }

  /**
   * Convertit un nombre de 1 à 99.
   */
  private convertTensAndUnits(n: number, allowPlurals = true): string {
    if (n < 20) {
      return this.UNITS[n];
    }

    const ten = Math.floor(n / 10);
    const unit = n % 10;

    // 20 à 69
    if (ten <= 6) {
      if (unit === 0) {
        return this.TENS[ten];
      }
      if (unit === 1) {
        return `${this.TENS[ten]} et un`;
      }
      return `${this.TENS[ten]}-${this.UNITS[unit]}`;
    }

    // 70 à 79 (soixante-dix...)
    if (ten === 7) {
      if (unit === 0) {
        return 'soixante-dix';
      }
      if (unit === 1) {
        return 'soixante et onze';
      }
      return `soixante-${this.UNITS[10 + unit]}`;
    }

    // 80 à 89 (quatre-vingt...)
    if (ten === 8) {
      if (unit === 0) {
        return allowPlurals ? 'quatre-vingts' : 'quatre-vingt';
      }
      return `quatre-vingt-${this.UNITS[unit]}`;
    }

    // 90 à 99 (quatre-vingt-dix...)
    if (ten === 9) {
      return `quatre-vingt-${this.UNITS[10 + unit]}`;
    }

    return '';
  }

  /**
   * Détecte si un nombre entier se termine directement par "million", "milliard" ou "billion"
   * (sans milliers ni unités après), ce qui requiert la liaison "de" avant la devise en français.
   * Exemple : 1 000 000 -> "un million de francs", mais 1 250 000 -> "un million deux cent cinquante mille francs".
   */
  private endsWithMillionOrMilliard(n: number): boolean {
    if (n < 1000000) return false;
    return n % 1000000 === 0;
  }

  private resolveCurrency(code: string): CurrencyInfo {
    const clean = (code || 'GNF').trim().toUpperCase();
    if (this.CURRENCIES[clean]) {
      return this.CURRENCIES[clean];
    }
    // Cas où le code n'est pas standard (ex: USD avec casse mixte ou autre)
    const normalized = Object.keys(this.CURRENCIES).find(
      (k) => k.toUpperCase() === clean
    );
    if (normalized) {
      return this.CURRENCIES[normalized];
    }

    // Repli générique
    return {
      singular: clean,
      plural: clean,
      hasDecimals: true,
      decimalSingular: 'centime',
      decimalPlural: 'centimes',
    };
  }

  private getCurrencyName(n: number, currency: CurrencyInfo): string {
    return n > 1 ? currency.plural : currency.singular;
  }
}

