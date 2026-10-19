import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  AlertController, IonContent, IonFab, IonFabButton, IonFabList, IonRefresher, IonRefresherContent, ModalController, ViewWillEnter,
} from '@ionic/angular';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { GroupSummary } from '../../core/models';
import { AvatarComponent } from '../../shared/avatar.component';
import { MoneyPipe } from '../../shared/money.pipe';
import { NewGroupModal } from '../new-group/new-group.modal';

@Component({
  selector: 'app-groups',
  imports: [IonContent, IonFab, IonFabButton, IonFabList, IonRefresher, IonRefresherContent, RouterLink, AvatarComponent, MoneyPipe],
  templateUrl: './groups.page.html',
  styleUrl: './groups.page.scss',
})
export class GroupsPage implements ViewWillEnter {
  private api = inject(ApiService);
  private router = inject(Router);
  private modal = inject(ModalController);
  private alert = inject(AlertController);
  user = inject(AuthService).user;

  groups = signal<GroupSummary[] | null>(null);
  error = signal(false);

  firstName = computed(() => (this.user()?.name ?? '').split(' ')[0]);
  // Balances can be in different currencies; the hero summarises the main one.
  currency = computed(() => this.groups()?.[0]?.currency ?? 'BRL');
  owed = computed(() => (this.groups() ?? []).filter((g) => g.currency === this.currency()).reduce((s, g) => s + Math.max(g.myBalanceCents, 0), 0));
  owe = computed(() => (this.groups() ?? []).filter((g) => g.currency === this.currency()).reduce((s, g) => s + Math.max(-g.myBalanceCents, 0), 0));
  greeting = (() => { const h = new Date().getHours(); return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'; })();

  ionViewWillEnter() { this.load(); }

  load(done?: () => void) {
    this.api.groups().subscribe({
      next: (g) => { this.groups.set(g); this.error.set(false); done?.(); },
      error: () => { this.error.set(true); this.groups.update((g) => g ?? []); done?.(); },
    });
  }

  refresh(ev: CustomEvent) { this.load(() => (ev.target as HTMLIonRefresherElement).complete()); }

  async newGroup() {
    const m = await this.modal.create({ component: NewGroupModal, breakpoints: [0, 0.8], initialBreakpoint: 0.8, cssClass: 'sheet' });
    await m.present();
    const { data, role } = await m.onWillDismiss();
    if (role === 'created') this.router.navigate(['/groups', data.id]);
  }

  async joinByCode() {
    const a = await this.alert.create({
      header: 'Entrar em um grupo',
      message: 'Digite o código de convite que você recebeu.',
      inputs: [{ name: 'code', placeholder: 'EX: K7P2QX9M', attributes: { maxlength: 16, autocapitalize: 'characters' } }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Continuar', handler: (v) => { const c = (v.code ?? '').trim(); if (c) this.router.navigate(['/join', c.toUpperCase()]); } },
      ],
    });
    await a.present();
  }

  trackId = (_: number, g: GroupSummary) => g.id;
}
