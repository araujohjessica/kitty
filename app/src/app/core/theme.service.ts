import { Injectable, signal } from '@angular/core';

const KEY = 'kitty.theme';
export type ThemeMode = 'system' | 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly mode = signal<ThemeMode>('system');
  private media = window.matchMedia('(prefers-color-scheme: dark)');

  init() {
    try { this.mode.set((localStorage.getItem(KEY) as ThemeMode) || 'system'); } catch { /* noop */ }
    this.media.addEventListener('change', () => this.apply());
    this.apply();
  }

  set(mode: ThemeMode) {
    this.mode.set(mode);
    try { localStorage.setItem(KEY, mode); } catch { /* noop */ }
    this.apply();
  }

  private apply() {
    const dark = this.mode() === 'dark' || (this.mode() === 'system' && this.media.matches);
    document.documentElement.classList.toggle('ion-palette-dark', dark);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0f0e17' : '#7c5cff');
  }
}
