import { describe, expect, it } from 'vitest';
import { formatMoney, parseToCents, splitEqual, splitPercent } from './money';

const sum = (shares: Record<string, number>) => Object.values(shares).reduce((a, b) => a + b, 0);
const norm = (s: string) => s.replace(/\s/g, ' ');

describe('splitEqual', () => {
  it('splits evenly and gives leftover cents deterministically by id', () => {
    expect(splitEqual(1000, ['b', 'a', 'c'])).toEqual({ a: 334, b: 333, c: 333 });
  });

  it('ignores duplicated participants', () => {
    expect(splitEqual(500, ['a', 'a', 'b'])).toEqual({ a: 250, b: 250 });
  });

  it('returns nothing when there are no participants', () => {
    expect(splitEqual(1000, [])).toEqual({});
  });

  it('never loses or creates a cent', () => {
    for (const total of [1, 7, 99, 1001, 123457]) {
      for (const n of [1, 2, 3, 7]) {
        const ids = Array.from({ length: n }, (_, i) => `u${i}`);
        expect(sum(splitEqual(total, ids))).toBe(total);
      }
    }
  });
});

describe('splitPercent', () => {
  it('splits by percentage', () => {
    expect(splitPercent(1000, { a: 50, b: 50 })).toEqual({ a: 500, b: 500 });
  });

  it('uses the largest remainder for awkward percentages', () => {
    expect(splitPercent(1000, { a: 33.33, b: 33.33, c: 33.34 })).toEqual({ a: 333, b: 333, c: 334 });
  });

  it('breaks ties by id', () => {
    expect(splitPercent(1, { b: 50, a: 50 })).toEqual({ a: 1, b: 0 });
  });

  it('always adds up to the total', () => {
    for (const total of [1, 99, 1000, 98765]) {
      expect(sum(splitPercent(total, { a: 12.5, b: 37.5, c: 50 }))).toBe(total);
    }
  });
});

describe('formatMoney', () => {
  it('formats cents as BRL', () => {
    expect(norm(formatMoney(12345))).toBe('R$ 123,45');
  });

  it('shows negative values with a minus sign', () => {
    expect(norm(formatMoney(-500))).toBe('−R$ 5,00');
  });

  it('can show an explicit sign', () => {
    expect(norm(formatMoney(500, 'BRL', { sign: true }))).toBe('+R$ 5,00');
    expect(norm(formatMoney(0, 'BRL', { sign: true }))).toBe('R$ 0,00');
  });
});

describe('parseToCents', () => {
  it('accepts a comma as decimal separator', () => {
    expect(parseToCents('12,5')).toBe(1250);
    expect(parseToCents('1.234,56')).toBe(123456);
  });

  it('accepts a dot as decimal separator', () => {
    expect(parseToCents('12.5')).toBe(1250);
    expect(parseToCents('12.50')).toBe(1250);
  });

  it('treats a dot followed by three digits as a thousands separator', () => {
    expect(parseToCents('1.234')).toBe(123400);
  });

  it('ignores currency symbols and spaces', () => {
    expect(parseToCents('R$ 10')).toBe(1000);
  });

  it('returns 0 for invalid input', () => {
    expect(parseToCents('')).toBe(0);
    expect(parseToCents('abc')).toBe(0);
  });
});