import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import {
  AuthResponse, Balances, PixKeyType, Expense, ExpensePayload, GroupDetail, GroupSummary, InvitePreview, Settlement, User,
} from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  register(body: { name: string; email: string; password: string; pixKeyType?: PixKeyType; pixKey?: string }) { return this.http.post<AuthResponse>(`${this.base}/auth/register`, body); }
  login(body: { email: string; password: string }) { return this.http.post<AuthResponse>(`${this.base}/auth/login`, body); }
  updateProfile(body: { name?: string; pixKeyType?: PixKeyType | null; pixKey?: string | null }) { return this.http.patch<User>(`${this.base}/auth/me`, body); }
  me() { return this.http.get<User>(`${this.base}/auth/me`); }

  groups() { return this.http.get<GroupSummary[]>(`${this.base}/groups`); }
  group(id: string) { return this.http.get<GroupDetail>(`${this.base}/groups/${id}`); }
  createGroup(body: { name: string; emoji: string; currency: string }) { return this.http.post<GroupDetail>(`${this.base}/groups`, body); }
  invitePreview(code: string) { return this.http.get<InvitePreview>(`${this.base}/groups/invite/${code}`); }
  join(inviteCode: string) { return this.http.post<GroupDetail>(`${this.base}/groups/join`, { inviteCode }); }
  addMember(groupId: string, email: string) { return this.http.post<GroupDetail>(`${this.base}/groups/${groupId}/members`, { email }); }
  inviteByEmail(groupId: string, email: string) { return this.http.post<{ sent: boolean }>(`${this.base}/groups/${groupId}/invites`, { email }); }
  leave(groupId: string) { return this.http.delete(`${this.base}/groups/${groupId}/members/me`); }

  expenses(groupId: string) { return this.http.get<Expense[]>(`${this.base}/groups/${groupId}/expenses`); }
  createExpense(groupId: string, body: ExpensePayload) { return this.http.post<Expense>(`${this.base}/groups/${groupId}/expenses`, body); }
  updateExpense(id: string, body: ExpensePayload) { return this.http.patch<Expense>(`${this.base}/expenses/${id}`, body); }
  deleteExpense(id: string) { return this.http.delete(`${this.base}/expenses/${id}`); }

  balances(groupId: string) { return this.http.get<Balances>(`${this.base}/groups/${groupId}/balances`); }
  settlements(groupId: string) { return this.http.get<Settlement[]>(`${this.base}/groups/${groupId}/settlements`); }
  settle(groupId: string, body: { fromUser: string; toUser: string; amountCents: number; note?: string }) {
    return this.http.post<Settlement>(`${this.base}/groups/${groupId}/settlements`, body);
  }

  reviewSettlement(id: string, status: 'CONFIRMED' | 'REJECTED') { return this.http.patch<Settlement>(`${this.base}/settlements/${id}/review`, { status }); }
  uploadReceipt(id: string, file: File) {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<Settlement>(`${this.base}/settlements/${id}/receipt`, form);
  }
  receipt(id: string) { return this.http.get(`${this.base}/settlements/${id}/receipt`, { responseType: 'blob' }); }
}
