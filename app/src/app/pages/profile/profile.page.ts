import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonContent } from '@ionic/angular';
import { PixKeyType } from '../../core/models';
import { PixFieldComponent } from '../../shared/pix-field.component';
import { ToastService } from '../../shared/toast.service';
import { AuthService } from '../../core/auth.service';
import { ThemeMode, ThemeService } from '../../core/theme.service';
import { AvatarComponent } from '../../shared/avatar.component';
import { formatPix, pixLabel } from '../../shared/pix';

@Component({
  selector: 'app-profile',
  imports: [IonContent, AvatarComponent, PixFieldComponent],
  template: `
    <ion-content>
      <div class="k-page">
        <button class="k-icon-btn plain back" (click)="back()" aria-label="Voltar">←</button>
        <div class="who rise">
          <k-avatar [name]="user()?.name ?? '?'" [size]="84" />
          <h1 class="k-h1">{{ user()?.name }}</h1>
          <p class="k-muted">{{ user()?.email }}</p>
        </div>

        <div class="k-section"><h2 class="k-h2">Chave Pix</h2></div>
        <div class="k-card pix">
          @if (user()?.pixKey && !editing()) {
            <p class="k-muted lbl">{{ label(user()!.pixKeyType) }}</p>
            <strong class="val">{{ fmt(user()!.pixKeyType, user()!.pixKey) }}</strong>
            <div class="row"><button class="k-btn ghost sm" (click)="edit()">Alterar</button><button class="k-btn danger sm" (click)="remove()">Remover</button></div>
          } @else {
            <p class="k-muted lbl">Seus amigos veem essa chave na hora de te pagar.</p>
            <k-pix-field [(type)]="pixType" [(key)]="pixKey" />
            <button class="k-btn block" [disabled]="!pixKey.trim() || saving()" (click)="save()">Salvar chave</button>
          }
        </div>

        <div class="k-section"><h2 class="k-h2">Aparência</h2></div>
        <div class="k-card modes">
          @for (m of modes; track m.key) {
            <button [class.on]="theme.mode() === m.key" (click)="setTheme(m.key)">{{ m.icon }} {{ m.label }}</button>
          }
        </div>

        <button class="k-btn ghost block out" (click)="confirmLogout()">Sair da conta</button>
      </div>
    </ion-content>
  `,
  styles: `
    .back { margin-top: calc(var(--ion-safe-area-top, 0px) + 8px); font-size: 22px; }
    .who { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 12px 0 28px; }
    .modes { display: flex; padding: 6px; gap: 6px; }
    .modes button { flex: 1; height: 44px; border: 0; border-radius: 12px; background: transparent; color: var(--k-text);
      font: 600 14px var(--ion-font-family); cursor: pointer; }
    .modes button.on { background: var(--k-grad-soft); color: var(--k-violet); }
    .out { margin-top: 28px; }
    .pix { padding: 16px; display: flex; flex-direction: column; gap: 10px; margin-bottom: 8px; }
    .lbl { margin: 0; font-size: 13px; }
    .val { font-size: 18px; letter-spacing: -0.01em; word-break: break-all; }
    .row { display: flex; gap: 8px; }
  `,
})
export class ProfilePage {
  private auth = inject(AuthService);
  private router = inject(Router);
  private alert = inject(AlertController);
  private toast = inject(ToastService);
  theme = inject(ThemeService);
  user = this.auth.user;

  modes: { key: ThemeMode; label: string; icon: string }[] = [
    { key: 'system', label: 'Sistema', icon: '📱' },
    { key: 'light', label: 'Claro', icon: '☀️' },
    { key: 'dark', label: 'Escuro', icon: '🌙' },
  ];

  setTheme(mode: ThemeMode) { this.theme.set(mode); if (mode === 'system') this.back(); }

  pixType: PixKeyType = 'CPF';
  pixKey = '';
  editing = signal(false);
  saving = signal(false);
  label = pixLabel;
  fmt = formatPix;

  edit() {
    this.pixType = this.user()?.pixKeyType ?? 'CPF';
    this.pixKey = formatPix(this.user()?.pixKeyType ?? null, this.user()?.pixKey ?? null);
    this.editing.set(true);
  }

  save() {
    this.saving.set(true);
    this.auth.updateProfile({ pixKeyType: this.pixType, pixKey: this.pixKey.trim() }).subscribe({
      next: () => { this.saving.set(false); this.editing.set(false); this.pixKey = ''; this.toast.ok('Chave Pix salva'); },
      error: (e) => { this.saving.set(false); this.toast.fail(e); },
    });
  }

  remove() {
    this.auth.updateProfile({ pixKeyType: null, pixKey: null }).subscribe({
      next: () => this.toast.ok('Chave Pix removida'),
      error: (e) => this.toast.fail(e),
    });
  }

  back() { this.router.navigateByUrl('/groups'); }

  async confirmLogout() {
    const a = await this.alert.create({
      header: 'Sair da conta?',
      buttons: [{ text: 'Cancelar', role: 'cancel' }, { text: 'Sair', role: 'destructive', handler: () => this.auth.logout() }],
    });
    await a.present();
  }
}
