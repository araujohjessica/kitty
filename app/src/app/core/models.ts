export type SplitType = 'EQUAL' | 'EXACT' | 'PERCENT';
export type CategoryKey = 'FOOD' | 'TRANSPORT' | 'HOME' | 'LEISURE' | 'TRAVEL' | 'SHOPPING' | 'HEALTH' | 'OTHER';

export type PixKeyType = 'CPF' | 'EMAIL' | 'PHONE' | 'RANDOM';
export type SettlementStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED';

export interface User { id: string; name: string; email: string; pixKeyType: PixKeyType | null; pixKey: string | null }
export interface AuthResponse { accessToken: string; user: User }

export interface Member { id: string; name: string; email: string; pixKeyType: PixKeyType | null; pixKey: string | null; role: 'OWNER' | 'MEMBER'; joinedAt: string }
export interface GroupSummary {
  id: string; name: string; emoji: string; currency: string;
  memberCount: number; members: { id: string; name: string }[];
  totalCents: number; myBalanceCents: number;
}
export interface GroupDetail {
  id: string; name: string; emoji: string; currency: string; inviteCode: string; createdBy: string; members: Member[];
}
export interface InvitePreview { name: string; emoji: string; memberCount: number }

export interface Share { userId: string; name: string; amountCents: number }
export interface Expense {
  id: string; groupId: string; description: string; amountCents: number; category: CategoryKey;
  date: string; splitType: SplitType; payer: { id: string; name: string }; shares: Share[];
}
export interface ExpensePayload {
  description: string; amountCents: number; category: CategoryKey; date: string; paidBy: string;
  splitType: SplitType; participants: { userId: string; value?: number }[];
}

export interface BalanceRow { userId: string; name: string; balanceCents: number }
export interface Suggestion { from: { id: string; name: string }; to: { id: string; name: string }; amountCents: number }
export interface Balances { totalCents: number; balances: BalanceRow[]; suggestions: Suggestion[] }

export interface Settlement {
  id: string; fromUser: string; toUser: string; amountCents: number; date: string;
  status: SettlementStatus; note: string | null; hasReceipt: boolean; receiptMime: string | null;
  createdBy: string | null; confirmedAt: string | null;
  from: { id: string; name: string }; to: { id: string; name: string };
}
