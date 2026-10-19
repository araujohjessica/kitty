import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonSpinner, ModalController } from '@ionic/angular';
import { ApiService } from '../../core/api.service';
import { CategoryKey, Expense, ExpensePayload, GroupDetail, SplitType } from '../../core/models';
import { formatMoney, parseToCents, splitEqual, splitPercent } from '../../core/money';
import { AmountFieldComponent } from '../../shared/amount-field.component';
import { AvatarComponent } from '../../shared/avatar.component';
import { CATEGORIES, CATEGORY_KEYS } from '../../shared/categories';
import { ToastService } from '../../shared/toast.service';

interface Row { id: string; name: string; on: boolean; value: string }

const todayStr = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

@Component({
  selector: 'app-expense-form',
  imports: [FormsModule, IonSpinner, AmountFieldComponent, AvatarComponent],
  templateUrl: './expense-form.modal.html',
  styleUrl: './expense-form.modal.scss',
})
export class ExpenseFormModal implements OnInit {
  private modalCtrl = inject(ModalController);
  private api = inject(ApiService);
  private toast = inject(ToastService);

  @Input({ required: true }) group!: GroupDetail;
  @Input({ required: true }) meId!: string;
  @Input() expense: Expense | null = null;

  cats = CATEGORY_KEYS;
  meta = CATEGORIES;
  loading = signal(false);

  cents = signal(0);
  description = '';
  category: CategoryKey = 'FOOD';
  date = todayStr();
  paidBy = '';
  splitType: SplitType = 'EQUAL';
  rows: Row[] = [];

  ngOnInit() {
    const g = this.group;
    const e = this.expense;
    this.paidBy = e?.payer.id ?? this.meId;
    this.rows = g.members.map((m) => ({ id: m.id, name: m.name, on: e ? e.shares.some((s) => s.userId === m.id) : true, value: '' }));
    if (e) {
      this.cents.set(e.amountCents);
      this.description = e.description;
      this.category = e.category;
      this.date = e.date.slice(0, 10);
      this.splitType = e.splitType;
      if (e.splitType !== 'EQUAL') this.loadValuesFromExpense(e);
    }
  }

  private loadValuesFromExpense(e: Expense) {
    const byUser = new Map(e.shares.map((s) => [s.userId, s.amountCents]));
    if (e.splitType === 'EXACT') {
      this.rows.forEach((r) => (r.value = byUser.has(r.id) ? (byUser.get(r.id)! / 100).toFixed(2).replace('.', ',') : ''));
    } else {
      const pcts = this.rows.map((r) => (byUser.has(r.id) ? Math.round((byUser.get(r.id)! / e.amountCents) * 10000) / 100 : 0));
      const diff = Math.round((100 - pcts.reduce((a, b) => a + b, 0)) * 100) / 100;
      const first = pcts.findIndex((p) => p > 0);
      if (first >= 0) pcts[first] = Math.round((pcts[first] + diff) * 100) / 100;
      this.rows.forEach((r, i) => (r.value = pcts[i] ? String(pcts[i]).replace('.', ',') : ''));
    }
  }

  get cur() { return this.group.currency; }
  get selected() { return this.rows.filter((r) => r.on); }
  money = (c: number) => formatMoney(c, this.cur);

  setType(t: SplitType) {
    this.splitType = t;
    this.prefill();
  }

  /** When switching to EXACT/PERCENT, start from an equal split so the user only tweaks. */
  prefill() {
    const ids = this.selected.map((r) => r.id);
    if (this.splitType === 'EXACT') {
      const s = splitEqual(this.cents(), ids);
      this.rows.forEach((r) => (r.value = r.on ? (s[r.id] / 100).toFixed(2).replace('.', ',') : ''));
    } else if (this.splitType === 'PERCENT') {
      const s = splitEqual(10000, ids); // basis points
      this.rows.forEach((r) => (r.value = r.on ? String(s[r.id] / 100).replace('.', ',') : ''));
    }
  }

  toggle(r: Row) { r.on = !r.on; if (this.splitType !== 'EQUAL') this.prefill(); }

  private num(v: string) { return parseFloat((v || '0').replace(',', '.')) || 0; }

  get sumValue() {
    return this.selected.reduce((s, r) => s + (this.splitType === 'EXACT' ? parseToCents(r.value || '0') : Math.round(this.num(r.value) * 100) / 100), 0);
  }
  /** What's still missing (>0) or exceeded (<0) to make the split valid. */
  get remaining() {
    return this.splitType === 'EXACT' ? this.cents() - this.sumValue : Math.round((100 - this.sumValue) * 100) / 100;
  }

  preview(r: Row): number {
    if (!r.on) return 0;
    const ids = this.selected.map((x) => x.id);
    if (this.splitType === 'EQUAL') return splitEqual(this.cents(), ids)[r.id] ?? 0;
    if (this.splitType === 'EXACT') return parseToCents(r.value || '0');
    if (this.remaining !== 0) return Math.round((this.cents() * this.num(r.value)) / 100);
    return splitPercent(this.cents(), Object.fromEntries(this.selected.map((x) => [x.id, this.num(x.value)])))[r.id] ?? 0;
  }

  get valid() {
    if (!this.description.trim() || this.cents() <= 0 || !this.selected.length || !this.paidBy) return false;
    return this.splitType === 'EQUAL' || this.remaining === 0;
  }

  save() {
    if (!this.valid || this.loading()) return;
    const payload: ExpensePayload = {
      description: this.description.trim(),
      amountCents: this.cents(),
      category: this.category,
      date: new Date(`${this.date}T12:00:00`).toISOString(),
      paidBy: this.paidBy,
      splitType: this.splitType,
      participants: this.selected.map((r) => ({
        userId: r.id,
        ...(this.splitType === 'EXACT' ? { value: parseToCents(r.value || '0') } : this.splitType === 'PERCENT' ? { value: this.num(r.value) } : {}),
      })),
    };
    this.loading.set(true);
    const e = this.expense;
    const req = e ? this.api.updateExpense(e.id, payload) : this.api.createExpense(this.group.id, payload);
    req.subscribe({
      next: () => this.modalCtrl.dismiss(null, 'saved'),
      error: (err) => { this.loading.set(false); this.toast.fail(err); },
    });
  }

  close() { this.modalCtrl.dismiss(); }
}
