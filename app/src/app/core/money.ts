/** Mirror of the API's money helpers (api/src/common/money.ts) used for live previews. */
export type Shares = Record<string, number>;

const byId = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

export function splitEqual(total: number, userIds: string[]): Shares {
  const ids = [...new Set(userIds)].sort(byId);
  if (!ids.length) return {};
  const base = Math.floor(total / ids.length);
  const rem = total - base * ids.length;
  return Object.fromEntries(ids.map((id, i) => [id, base + (i < rem ? 1 : 0)]));
}

export function splitPercent(total: number, percents: Shares): Shares {
  const rows = Object.entries(percents)
    .sort(([a], [b]) => byId(a, b))
    .map(([id, p]) => {
      const exact = total * Math.round(p * 100);
      return { id, v: Math.floor(exact / 10000), rest: exact % 10000 };
    });
  let left = total - rows.reduce((s, r) => s + r.v, 0);
  [...rows].sort((a, b) => b.rest - a.rest || byId(a.id, b.id)).forEach((r) => { if (left > 0) { r.v++; left--; } });
  return Object.fromEntries(rows.map((r) => [r.id, r.v]));
}

export function formatMoney(cents: number, currency = 'BRL', opts: { sign?: boolean } = {}): string {
  const abs = new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(Math.abs(cents) / 100);
  if (opts.sign && cents !== 0) return `${cents > 0 ? '+' : '−'}${abs}`;
  return cents < 0 ? `−${abs}` : abs;
}

/**
 * Converts what the user typed into cents.
 * "12,5" → 1250 · "1.234,56" → 123456 · "12.5" → 1250 · "1.234" → 123400 · "R$ 10" → 1000
 * A dot is a decimal separator only when there is no comma and it has 1–2 digits after it.
 */
export function parseToCents(input: string): number {
  let s = input.trim().replace(/[^\d.,-]/g, '');
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  else if (!/^-?\d+\.\d{1,2}$/.test(s)) s = s.replace(/\./g, '');
  const n = parseFloat(s);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}