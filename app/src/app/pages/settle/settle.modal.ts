import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonSpinner, ModalController } from '@ionic/angular';
import { catchError, of, switchMap } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { GroupDetail } from '../../core/models';
import { AmountFieldComponent } from '../../shared/amount-field.component';
import { AvatarComponent } from '../../shared/avatar.component';
import { formatPix, pixLabel } from '../../shared/pix';
import { ToastService } from '../../shared/toast.service';

@Component({
  selector: 'app-settle',
  imports: [FormsModule, IonSpinner, AmountFieldComponent, AvatarComponent],
  template: `
    <div class="body">
      <div class="top"><h2 class="k-h2">Acertar contas</h2><button class="k-icon-btn plain" (click)="close()" aria-label="Fechar">✕</button></div>

      <div class="flow k-card">
        <div class="who"><k-avatar [name]="nameOf(fromUser)" [size]="56" /><span>{{ label(fromUser) }}</span></div>
        <div class="arrow"><span>paga</span>→</div>
        <div class="who"><k-avatar [name]="nameOf(toUser)" [size]="56" /><span>{{ label(toUser) }}</span></div>
      </div>

      <div class="k-card amt"><k-amount [(cents)]="cents" [currency]="group.currency" /></div>

      <div class="two">
        <label class="k-field"><span>Quem paga</span>
          <select class="k-input" [(ngModel)]="fromUser">@for (m of group.members; track m.id) { <option [value]="m.id">{{ label(m.id) }}</option> }</select>
        </label>
        <label class="k-field"><span>Quem recebe</span>
          <select class="k-input" [(ngModel)]="toUser">@for (m of group.members; track m.id) { <option [value]="m.id">{{ label(m.id) }}</option> }</select>
        </label>
      </div>

      @if (iPay) {
        <div class="k-card pixbox">
          <span class="k-eyebrow">Pix de {{ label(toUser) }}</span>
          @if (receiver?.pixKey) {
            <div class="keyrow">
              <div><small class="k-muted">{{ pixType(receiver!.pixKeyType) }}</small><strong>{{ fmt(receiver!.pixKeyType, receiver!.pixKey) }}</strong></div>
              <button class="k-btn sm" (click)="copyKey()">Copiar</button>
            </div>
          } @else {
            <p class="k-muted nokey">{{ label(toUser) }} ainda não cadastrou uma chave Pix. Combine por fora e anexe o comprovante.</p>
          }
        </div>

        <label class="k-card receipt">
          <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" (change)="pick($event)" hidden />
          <span class="ic">{{ file ? '✅' : '📎' }}</span>
          <span class="rt"><strong>{{ file ? file.name : 'Anexar comprovante' }}</strong><small class="k-muted">{{ file ? 'Toque para trocar' : 'Foto ou PDF, até 5 MB (opcional)' }}</small></span>
        </label>
      }

      <button class="k-btn block" [disabled]="!valid || loading()" (click)="save()">
        @if (loading()) { <ion-spinner name="crescent" /> } @else { {{ iPay ? 'Informar pagamento' : 'Confirmar que recebi' }} }
      </button>
      <p class="note">
        @if (iPay) { O dinheiro é transferido por fora (Pix). {{ label(toUser) }} vai confirmar o recebimento e o pagamento fica no histórico do grupo. }
        @else { Você está registrando que recebeu esse valor. Fica confirmado e entra no histórico do grupo. }
      </p>
    </div>
  `,
  styles: `
    .body { padding: 22px 18px calc(24px + env(safe-area-inset-bottom)); background: var(--k-bg); }
    .top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
    .flow { display: flex; align-items: center; justify-content: space-around; padding: 20px 10px; margin-bottom: 12px; }
    .who { display: flex; flex-direction: column; align-items: center; gap: 8px; font-weight: 700; width: 96px; text-align: center; font-size: 14px; }
    .arrow { display: flex; flex-direction: column; align-items: center; font-size: 26px; color: var(--k-violet); font-weight: 800; }
    .arrow span { font-size: 11px; text-transform: uppercase; letter-spacing: .08em; color: var(--k-muted); }
    .amt { padding: 12px; margin-bottom: 16px; }
    .two { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    select.k-input { appearance: none; }
    .pixbox { padding: 14px; margin-bottom: 12px; display: flex; flex-direction: column; gap: 8px; }
    .keyrow { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    .keyrow div { display: flex; flex-direction: column; min-width: 0; }
    .keyrow strong { word-break: break-all; font-size: 16px; }
    .nokey { margin: 0; font-size: 13px; line-height: 1.5; }
    .receipt { display: flex; align-items: center; gap: 12px; padding: 14px; margin-bottom: 16px; cursor: pointer; }
    .receipt .ic { font-size: 24px; }
    .rt { display: flex; flex-direction: column; min-width: 0; }
    .rt strong { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .note { margin-top: 14px; text-align: center; font-size: 12.5px; color: var(--k-muted); line-height: 1.5; }
  `,
})
export class SettleModal implements OnInit {
  private modalCtrl = inject(ModalController);
  private api = inject(ApiService);
  private toast = inject(ToastService);

  @Input({ required: true }) group!: GroupDetail;
  @Input({ required: true }) meId!: string;
  @Input() from = '';
  @Input() to = '';
  @Input() amountCents = 0;

  loading = signal(false);
  cents = signal(0);
  fromUser = '';
  toUser = '';

  ngOnInit() {
    const ms = this.group.members;
    this.fromUser = this.from || this.meId;
    this.toUser = this.to || (ms.find((m) => m.id !== this.fromUser)?.id ?? '');
    this.cents.set(this.amountCents);
  }

  nameOf = (id: string) => this.group.members.find((m) => m.id === id)?.name ?? '?';
  label = (id: string) => (id === this.meId ? 'Você' : this.nameOf(id).split(' ')[0]);
  file: File | null = null;

  fmt = formatPix;
  pixType = pixLabel;
  get iPay() { return this.fromUser === this.meId; }
  get receiver() { return this.group.members.find((m) => m.id === this.toUser); }
  get valid() {
    const me = this.meId;
    return this.cents() > 0 && !!this.fromUser && !!this.toUser && this.fromUser !== this.toUser && (this.fromUser === me || this.toUser === me);
  }

  pick(ev: Event) {
    const f = (ev.target as HTMLInputElement).files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { this.toast.fail(null, 'O comprovante deve ter até 5 MB'); return; }
    this.file = f;
  }

  async copyKey() {
    const key = this.receiver?.pixKey;
    if (!key) return;
    try { await navigator.clipboard.writeText(key); this.toast.ok('Chave Pix copiada'); } catch { this.toast.fail(null, 'Não foi possível copiar'); }
  }

  save() {
    this.loading.set(true);
    const file = this.iPay ? this.file : null;
    this.api.settle(this.group.id, { fromUser: this.fromUser, toUser: this.toUser, amountCents: this.cents() }).pipe(
      switchMap((s) => (file
        ? this.api.uploadReceipt(s.id, file).pipe(catchError(() => {
            this.toast.fail(null, 'Pagamento informado, mas o comprovante não foi enviado. Anexe pelo histórico.');
            return of(s);
          }))
        : of(s))),
    ).subscribe({
      next: () => this.modalCtrl.dismiss(null, 'saved'),
      error: (e) => { this.loading.set(false); this.toast.fail(e); },
    });
  }
  close() { this.modalCtrl.dismiss(); }
}
