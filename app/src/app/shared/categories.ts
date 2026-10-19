import { CategoryKey } from '../core/models';

export const CATEGORIES: Record<CategoryKey, { label: string; emoji: string; color: string }> = {
  FOOD:      { label: 'Comida',     emoji: '🍔', color: '#ff9f43' },
  TRANSPORT: { label: 'Transporte', emoji: '🚕', color: '#4dabf7' },
  HOME:      { label: 'Casa',       emoji: '🏠', color: '#845ef7' },
  LEISURE:   { label: 'Lazer',      emoji: '🎉', color: '#ff6b9d' },
  TRAVEL:    { label: 'Viagem',     emoji: '✈️', color: '#22b8cf' },
  SHOPPING:  { label: 'Compras',    emoji: '🛍️', color: '#e599f7' },
  HEALTH:    { label: 'Saúde',      emoji: '💊', color: '#51cf66' },
  OTHER:     { label: 'Outros',     emoji: '🧾', color: '#868e96' },
};
export const CATEGORY_KEYS = Object.keys(CATEGORIES) as CategoryKey[];
