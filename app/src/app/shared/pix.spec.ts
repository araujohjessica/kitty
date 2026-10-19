import { describe, expect, it } from 'vitest';
import { formatPix, pixLabel } from './pix';

describe('pixLabel', () => {
  it('returns the label for a key type', () => {
    expect(pixLabel('CPF')).toBe('CPF');
    expect(pixLabel('PHONE')).toBe('Celular');
  });

  it('falls back to "Pix" when there is no type', () => {
    expect(pixLabel(null)).toBe('Pix');
  });
});

describe('formatPix', () => {
  it('formats a CPF', () => {
    expect(formatPix('CPF', '12345678901')).toBe('123.456.789-01');
  });

  it('formats mobile and landline numbers, with or without +55', () => {
    expect(formatPix('PHONE', '+5511912345678')).toBe('(11) 91234-5678');
    expect(formatPix('PHONE', '1134567890')).toBe('(11) 3456-7890');
  });

  it('keeps e-mail and random keys as they are', () => {
    expect(formatPix('EMAIL', 'voce@email.com')).toBe('voce@email.com');
    expect(formatPix('RANDOM', 'abc-123')).toBe('abc-123');
  });

  it('returns an empty string when there is no key', () => {
    expect(formatPix(null, null)).toBe('');
  });
});