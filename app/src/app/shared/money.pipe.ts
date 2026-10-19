import { Pipe, PipeTransform } from '@angular/core';
import { formatMoney } from '../core/money';

@Pipe({ name: 'money' })
export class MoneyPipe implements PipeTransform {
  transform(cents: number | null | undefined, currency = 'BRL', sign = false): string {
    return formatMoney(cents ?? 0, currency, { sign });
  }
}
