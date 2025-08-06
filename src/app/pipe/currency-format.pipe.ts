import { Pipe, PipeTransform } from "@angular/core";

@Pipe ({
  name: 'currencyFormat',
  standalone: true,
})
export class CurrencyFormatPipe implements PipeTransform {
  transform(
    value: number,
    currencyCode: string = 'USD',
    locale: string = 'fr-FR'
  ): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      currencyDisplay: 'symbol',
      minimumFractionDigits: 0,
    }).format(value);
  }
}
