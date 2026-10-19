import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonSpinner, ModalController } from '@ionic/angular';
import { ApiService } from '../../core/api.service';
import { GroupDetail } from '../../core/models';
import { ToastService } from '../../shared/toast.service';

@Component({
  selector: 'app-invite',
  imports: [FormsModule, IonSpinner],
  template: `
    <div class="body">
      <div class="top"><h2 class="k-h2">Convidar pessoas</h2><button class="k-icon-btn plain" (click)="close()" aria-label="Fechar">✕</button></div>

      <button class="k-btn block wa" (click)="whatsapp()">💬 Convidar pelo WhatsApp</button>

      <div class="k-card box">
        <label class="k-field"><span>Pelo telefone (WhatsApp)</span>
          <input class="k-input" type="tel" inputmode="tel" [(ngModel)]="phone" placeholder="(11) 91234-5678" autocomplete="off" />
        </label>
        <button class="k-btn ghost block" [disabled]="digits().length < 10" (click)="whatsapp(digits())">Enviar convite para este número</button>
      </div>

      <div class="k-card box">
        <label class="k-field"><span>Pelo email</span>
          <input class="k-input" type="email" inputmode="email" [(ngModel)]="email" placeholder="amiga@email.com" autocomplete="off" />
        </label>
        <button class="k-btn ghost block" [disabled]="!emailOk() || loading()" (click)="addByEmail()">
          @if (loading()) { <ion-spinner name="crescent" /> } @else { Adicionar ao grupo }
        </button>
        @if (unknownEmail()) {
          <p class="hint">Essa pessoa ainda não tem conta no Kitty. <a (click)="sendEmail()">{{ sending() ? 'Enviando…' : 'Enviar convite por email' }}</a></p>
        }
      </div>

      <button class="k-btn ghost block" (click)="copy()">🔗 Copiar link de convite</button>
      <p class="code">Código: <strong>{{ group.inviteCode }}</strong></p>
    </div>
  `,
  styles: `
    .body { padding: 22px 18px calc(24px + env(safe-area-inset-bottom)); background: var(--k-bg); display: flex; flex-direction: column; gap: 12px; }
    .top { display: flex; justify-content: space-between; align-items: center; }
    .wa { background: #25d366; box-shadow: none; color: #fff; }
    .box { padding: 14px; display: flex; flex-direction: column; gap: 8px; }
    .box .k-field { margin: 0; }
    .hint { margin: 0; font-size: 13px; color: var(--k-muted); line-height: 1.5; }
    .hint a { color: var(--k-violet); font-weight: 700; cursor: pointer; }
    .code { margin: 0; text-align: center; font-size: 13px; color: var(--k-muted); }
    .code strong { letter-spacing: .08em; color: var(--k-text); }
  `,
})
export class InviteModal {
  private modalCtrl = inject(ModalController);
  private api = inject(ApiService);
  private toast = inject(ToastService);

  @Input({ required: true }) group!: GroupDetail;

  phone = '';
  email = '';
  loading = signal(false);
  unknownEmail = signal(false);
  sending = signal(false);

  get link() { return `${location.origin}/join/${this.group.inviteCode}`; }
  get text() { return `Entra no grupo "${this.group.name}" no Kitty para dividirmos as despesas: ${this.link}`; }

  digits = () => this.phone.replace(/\D/g, '');
  emailOk = () => /^\S+@\S+\.\S+$/.test(this.email.trim());

  /** Brazilian numbers without country code get 55 prepended. */
  whatsapp(number = '') {
    const n = number && (number.length <= 11 ? `55${number}` : number);
    window.open(`https://wa.me/${n}?text=${encodeURIComponent(this.text)}`, '_blank');
  }

  addByEmail() {
    this.loading.set(true);
    this.unknownEmail.set(false);
    this.api.addMember(this.group.id, this.email.trim()).subscribe({
      next: (g) => { this.toast.ok('Pessoa adicionada ao grupo'); this.modalCtrl.dismiss(g, 'added'); },
      error: (e) => {
        this.loading.set(false);
        if (e instanceof HttpErrorResponse && e.status === 404) this.unknownEmail.set(true);
        else if (e instanceof HttpErrorResponse && e.status === 409) this.toast.fail(null, 'Essa pessoa já está no grupo');
        else this.toast.fail(e);
      },
    });
  }

  sendEmail() {
    if (this.sending()) return;
    this.sending.set(true);
    this.api.inviteByEmail(this.group.id, this.email.trim()).subscribe({
      next: () => { this.sending.set(false); this.toast.ok('Convite enviado por email'); this.modalCtrl.dismiss(null, 'invited'); },
      error: (e) => { this.sending.set(false); this.toast.fail(e); },
    });
  }

  async copy() {
    try { await navigator.clipboard.writeText(this.link); this.toast.ok('Link copiado'); } catch { this.toast.fail(null, 'Não foi possível copiar'); }
  }

  close() { this.modalCtrl.dismiss(); }
}
