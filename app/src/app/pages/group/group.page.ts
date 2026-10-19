import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, IonContent, IonRefresher, IonRefresherContent, ModalController, ViewWillEnter } from '@ionic/angular';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Balances, Expense, GroupDetail, Settlement, Suggestion } from '../../core/models';
import { AvatarComponent } from '../../shared/avatar.component';
import { CATEGORIES } from '../../shared/categories';
import { MoneyPipe } from '../../shared/money.pipe';
import { ToastService } from '../../shared/toast.service';
import { ExpenseFormModal } from '../expense-form/expense-form.modal';
import { InviteModal } from '../invite/invite.modal';
import { SettleModal } from '../settle/settle.modal';

type Tab = 'expenses' | 'balances';

@Component({
  selector: 'app-group',
  imports: [IonContent, IonRefresher, IonRefresherContent, DatePipe, AvatarComponent, MoneyPipe],
  templateUrl: './group.page.html',
  styleUrl: './group.page.scss',
})
export class GroupPage implements ViewWillEnter {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private modal = inject(ModalController);
  private alert = inject(AlertController);
  private toast = inject(ToastService);
  meId = inject(AuthService).user()!.id;

  id = this.route.snapshot.paramMap.get('id')!;
  group = signal<GroupDetail | null>(null);
  expenses = signal<Expense[]>([]);
  balances = signal<Balances | null>(null);
  settlements = signal<Settlement[]>([]);
  tab = signal<Tab>('expenses');
  error = signal(false);

  cat = CATEGORIES;
  myBalance = computed(() => this.balances()?.balances.find((b) => b.userId === this.meId)?.balanceCents ?? 0);

  ionViewWillEnter() { this.load(); }

  load(done?: () => void) {
    forkJoin({
      group: this.api.group(this.id), expenses: this.api.expenses(this.id),
      balances: this.api.balances(this.id), settlements: this.api.settlements(this.id),
    }).subscribe({
      next: (r) => {
        this.group.set(r.group); this.expenses.set(r.expenses); this.balances.set(r.balances); this.settlements.set(r.settlements);
        this.error.set(false); done?.();
      },
      error: () => { this.error.set(true); done?.(); },
    });
  }

  refresh(ev: CustomEvent) { this.load(() => (ev.target as HTMLIonRefresherElement).complete()); }
  back() { this.router.navigateByUrl('/groups'); }
  name = (id: string) => (id === this.meId ? 'Você' : (this.group()?.members.find((m) => m.id === id)?.name ?? '?').split(' ')[0]);

  async openExpense(expense: Expense | null = null) {
    const m = await this.modal.create({
      component: ExpenseFormModal, componentProps: { group: this.group(), meId: this.meId, expense },
      breakpoints: [0, 1], initialBreakpoint: 1, cssClass: 'sheet',
    });
    await m.present();
    if ((await m.onWillDismiss()).role === 'saved') this.load();
  }

  async settle(s?: Suggestion) {
    const m = await this.modal.create({
      component: SettleModal,
      componentProps: { group: this.group(), meId: this.meId, from: s?.from.id ?? '', to: s?.to.id ?? '', amountCents: s?.amountCents ?? 0 },
      breakpoints: [0, 0.85], initialBreakpoint: 0.85, cssClass: 'sheet',
    });
    await m.present();
    if ((await m.onWillDismiss()).role === 'saved') { this.toast.ok('Pagamento registrado'); this.load(); }
  }

  statusLabel = { PENDING: 'Aguardando confirmação', CONFIRMED: 'Confirmado', REJECTED: 'Recusado' } as const;

  /** Opens the receipt in a new tab. The tab is opened synchronously so popup blockers allow it. */
  viewReceipt(s: Settlement) {
    const tab = window.open('', '_blank');
    this.api.receipt(s.id).subscribe({
      next: (blob) => { const url = URL.createObjectURL(blob); if (tab) tab.location.href = url; else window.open(url, '_blank'); },
      error: (e) => { tab?.close(); this.toast.fail(e); },
    });
  }

  review(s: Settlement, status: 'CONFIRMED' | 'REJECTED') {
    this.api.reviewSettlement(s.id, status).subscribe({
      next: () => { this.toast.ok(status === 'CONFIRMED' ? 'Pagamento confirmado' : 'Pagamento recusado'); this.load(); },
      error: (e) => this.toast.fail(e),
    });
  }

  attachReceipt(s: Settlement, ev: Event) {
    const f = (ev.target as HTMLInputElement).files?.[0];
    if (!f) return;
    this.api.uploadReceipt(s.id, f).subscribe({
      next: () => { this.toast.ok('Comprovante enviado'); this.load(); },
      error: (e) => this.toast.fail(e),
    });
  }

  async remove(e: Expense) {
    const a = await this.alert.create({
      header: 'Excluir despesa?', message: e.description,
      buttons: [{ text: 'Cancelar', role: 'cancel' }, {
        text: 'Excluir', role: 'destructive',
        handler: () => this.api.deleteExpense(e.id).subscribe({ next: () => this.load(), error: (err) => this.toast.fail(err) }),
      }],
    });
    await a.present();
  }

  async invite() {
    const m = await this.modal.create({
      component: InviteModal, componentProps: { group: this.group() }, breakpoints: [0, 1], initialBreakpoint: 1, cssClass: 'sheet',
    });
    await m.present();
    if ((await m.onWillDismiss()).role === 'added') this.load();
  }

  async leave() {
    const a = await this.alert.create({
      header: 'Sair do grupo?', message: 'Você precisa estar com o saldo zerado.',
      buttons: [{ text: 'Cancelar', role: 'cancel' }, {
        text: 'Sair', role: 'destructive',
        handler: () => this.api.leave(this.id).subscribe({ next: () => this.back(), error: (e) => this.toast.fail(e) }),
      }],
    });
    await a.present();
  }
}
