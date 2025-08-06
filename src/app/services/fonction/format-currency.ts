export class FormatCurrency {
  static formatCurrency(
    amount: number,
    currencyCode: string = 'USD',
    locale?: string
  ): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      currencyDisplay: 'symbol',
      minimumFractionDigits: 0,
    }).format(amount);
  }
}