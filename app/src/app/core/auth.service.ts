import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { ApiService } from './api.service';
import { AuthResponse, PixKeyType, User } from './models';

const TOKEN_KEY = 'kitty.token';
const USER_KEY = 'kitty.user';

function read<T>(key: string): T | null {
  try { const v = localStorage.getItem(key); return v ? (JSON.parse(v) as T) : null; } catch { return null; }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ApiService);
  private router = inject(Router);

  readonly user = signal<User | null>(read<User>(USER_KEY));
  readonly token = signal<string | null>(read<string>(TOKEN_KEY));
  readonly isLoggedIn = computed(() => !!this.token());

  login(email: string, password: string) { return this.api.login({ email, password }).pipe(tap((r) => this.store(r))); }
  register(name: string, email: string, password: string, pix?: { type: PixKeyType; key: string }) {
    const body = { name, email, password, ...(pix ? { pixKeyType: pix.type, pixKey: pix.key } : {}) };
    return this.api.register(body).pipe(tap((r) => this.store(r)));
  }

  updateProfile(body: { pixKeyType: PixKeyType | null; pixKey: string | null }) {
    return this.api.updateProfile(body).pipe(tap((u) => {
      this.user.set(u);
      try { localStorage.setItem(USER_KEY, JSON.stringify(u)); } catch { /* noop */ }
    }));
  }

  private store(r: AuthResponse) {
    this.token.set(r.accessToken);
    this.user.set(r.user);
    try {
      localStorage.setItem(TOKEN_KEY, JSON.stringify(r.accessToken));
      localStorage.setItem(USER_KEY, JSON.stringify(r.user));
    } catch { /* storage unavailable: session lives in memory only */ }
  }

  logout(redirect = true) {
    this.token.set(null);
    this.user.set(null);
    try { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); } catch { /* noop */ }
    if (redirect) this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
