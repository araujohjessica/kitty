import { PixKeyType } from '../core/models';

export const PIX_TYPES: { key: PixKeyType; label: string; placeholder: string; inputmode: string }[] = [
  { key: 'CPF', label: 'CPF', placeholder: '000.000.000-00', inputmode: 'numeric' },
  { key: 'PHONE', label: 'Celular', placeholder: '(11) 91234-5678', inputmode: 'tel' },
  { key: 'EMAIL', label: 'E-mail', placeholder: 'voce@email.com', inputmode: 'email' },
  { key: 'RANDOM', label: 'Aleatória', placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', inputmode: 'text' },
];

export const pixLabel = (t: PixKeyType | null) => PIX_TYPES.find((x) => x.key === t)?.label ?? 'Pix';

/** Human-friendly rendering of the canonical key stored by the API. */
export function formatPix(type: PixKeyType | null, key: string | null): string {
  if (!key) return '';
  if (type === 'CPF' && key.length === 11) return `${key.slice(0, 3)}.${key.slice(3, 6)}.${key.slice(6, 9)}-${key.slice(9)}`;
  if (type === 'PHONE') {
    const d = key.replace(/\D/g, '').replace(/^55/, '');
    return d.length === 11 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}` : d.length === 10 ? `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}` : key;
  }
  return key;
}
