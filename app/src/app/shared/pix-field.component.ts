import { Component, computed, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PixKeyType } from '../core/models';
import { PIX_TYPES } from './pix';

@Component({
  selector: 'k-pix-field',
  imports: [FormsModule],
  template: `
    <div class="types">
      @for (t of types; track t.key) {
        <button type="button" [class.on]="type() === t.key" (click)="type.set(t.key)">{{ t.label }}</button>
      }
    </div>
    <input class="k-input" name="pixKey" [ngModel]="key()" (ngModelChange)="key.set($event)" [placeholder]="meta().placeholder"
           [attr.inputmode]="meta().inputmode" autocomplete="off" autocapitalize="off" />
  `,
  styles: `
    :host { display: block; }
    .types { display: flex; gap: 6px; margin-bottom: 8px; overflow-x: auto; }
    .types button { flex: none; height: 34px; padding: 0 14px; border: 0; border-radius: 999px; cursor: pointer;
      background: var(--k-surface-2); color: var(--k-muted); font: 600 13px var(--ion-font-family); }
    .types button.on { background: var(--k-grad-soft); color: var(--k-violet); }
  `,
})
export class PixFieldComponent {
  type = model<PixKeyType>('CPF');
  key = model('');
  types = PIX_TYPES;
  meta = computed(() => PIX_TYPES.find((t) => t.key === this.type())!);
}
