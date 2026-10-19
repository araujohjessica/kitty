import { Component, computed, input, model } from '@angular/core';

const SYMBOL: Record<string, string> = { BRL: 'R$', USD: 'US$', EUR: '€' };

/** Big currency input that works in integer cents (type 1-2-9-9-0 → 129,90). */
@Component({
  selector: 'k-amount',
  template: `
    <div class="amt">
      <span class="sym">{{ symbol() }}</span>
      <input inputmode="numeric" autocomplete="off" [value]="display()" (input)="onInput($event)" placeholder="0,00" aria-label="Valor" />
    </div>
  `,
  styles: `
    .amt { display: flex; align-items: baseline; justify-content: center; gap: 8px; padding: 6px 0; }
    .sym { font-size: 22px; font-weight: 700; color: var(--k-muted); }
    input { width: 100%; max-width: 260px; border: 0; background: transparent; outline: none; text-align: left; color: var(--k-text);
      font: 800 46px var(--ion-font-family); letter-spacing: -0.04em; min-width: 0; }
    input::placeholder { color: var(--k-muted); opacity: .35; }
    :host(.sm) input { font-size: 34px; }
  `,
})
export class AmountFieldComponent {
  cents = model(0);
  currency = input('BRL');
  symbol = computed(() => SYMBOL[this.currency()] ?? this.currency());
  display = computed(() => (this.cents() ? (this.cents() / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''));

  onInput(ev: Event) {
    const el = ev.target as HTMLInputElement;
    const digits = el.value.replace(/\D/g, '').slice(0, 9);
    const cents = digits ? parseInt(digits, 10) : 0;
    this.cents.set(cents);
    el.value = this.display(); // keep the mask in sync even when the model value didn't change
  }
}
