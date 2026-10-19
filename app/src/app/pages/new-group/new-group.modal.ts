import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonSpinner, ModalController } from '@ionic/angular';
import { ApiService } from '../../core/api.service';
import { ToastService } from '../../shared/toast.service';

const EMOJIS = ['🏖️', '🏠', '🍕', '✈️', '🎉', '🚗', '⚽', '🎬', '🏕️', '🛒', '🍻', '💼'];

@Component({
  selector: 'app-new-group',
  imports: [FormsModule, IonSpinner],
  template: `
    <div class="body">
      <div class="top"><h2 class="k-h2">Novo grupo</h2><button class="k-icon-btn plain" (click)="close()" aria-label="Fechar">✕</button></div>

      <div class="preview k-card"><span class="big">{{ emoji() }}</span><strong>{{ name || 'Nome do grupo' }}</strong></div>

      <div class="emojis">
        @for (e of emojis; track e) { <button [class.on]="emoji() === e" (click)="emoji.set(e)">{{ e }}</button> }
      </div>

      <label class="k-field"><span>Nome</span><input class="k-input" [(ngModel)]="name" placeholder="Viagem, apê, churrasco..." maxlength="50" /></label>
      <label class="k-field"><span>Moeda</span>
        <select class="k-input" [(ngModel)]="currency"><option value="BRL">Real (BRL)</option><option value="USD">Dólar (USD)</option><option value="EUR">Euro (EUR)</option></select>
      </label>

      <button class="k-btn block" [disabled]="name.trim().length < 2 || loading()" (click)="create()">
        @if (loading()) { <ion-spinner name="crescent" /> } @else { Criar grupo }
      </button>
    </div>
  `,
  styles: `
    .body { padding: 22px 20px calc(24px + env(safe-area-inset-bottom)); background: var(--k-bg); }
    .top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
    .preview { display: flex; align-items: center; gap: 14px; padding: 16px; margin-bottom: 14px; font-size: 18px; }
    .big { width: 54px; height: 54px; border-radius: 18px; display: grid; place-items: center; font-size: 30px; background: var(--k-grad-soft); }
    .emojis { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; margin-bottom: 18px; }
    .emojis button { aspect-ratio: 1; border: 2px solid transparent; border-radius: 14px; background: var(--k-surface-2); font-size: 22px; cursor: pointer; }
    .emojis button.on { border-color: var(--k-violet); background: var(--k-grad-soft); }
    select.k-input { appearance: none; }
  `,
})
export class NewGroupModal {
  private modalCtrl = inject(ModalController);
  private api = inject(ApiService);
  private toast = inject(ToastService);

  emojis = EMOJIS;
  emoji = signal(EMOJIS[0]);
  loading = signal(false);
  name = '';
  currency = 'BRL';

  close() { this.modalCtrl.dismiss(); }
  create() {
    this.loading.set(true);
    this.api.createGroup({ name: this.name.trim(), emoji: this.emoji(), currency: this.currency }).subscribe({
      next: (g) => this.modalCtrl.dismiss(g, 'created'),
      error: (e) => { this.loading.set(false); this.toast.fail(e); },
    });
  }
}
