import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonSpinner } from '@ionic/angular';
import { PixKeyType } from '../../core/models';
import { PixFieldComponent } from '../../shared/pix-field.component';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../shared/toast.service';

@Component({
  selector: 'app-auth',
  imports: [IonContent, IonSpinner, FormsModule, PixFieldComponent],
  templateUrl: './auth.page.html',
  styleUrl: './auth.page.scss',
})
export class AuthPage {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);

  mode = signal<'login' | 'register'>('login');
  loading = signal(false);
  name = '';
  email = '';
  password = '';
  pixType: PixKeyType = 'CPF';
  pixKey = '';

  get valid() {
    const base = /^\S+@\S+\.\S+$/.test(this.email) && this.password.length >= 6;
    return this.mode() === 'login' ? base : base && this.name.trim().length >= 2;
  }

  submit() {
    if (!this.valid || this.loading()) return;
    this.run(this.mode() === 'login' ? this.auth.login(this.email, this.password) : this.auth.register(this.name, this.email, this.password, this.pixKey.trim() ? { type: this.pixType, key: this.pixKey.trim() } : undefined));
  }

  demo() {
    this.run(this.auth.login('demo@kitty.app', 'kitty123'));
  }

  private run(obs: ReturnType<AuthService['login']>) {
    this.loading.set(true);
    obs.subscribe({
      next: () => {
        const to = this.route.snapshot.queryParamMap.get('redirect') || '/groups';
        this.router.navigateByUrl(to, { replaceUrl: true });
      },
      error: (e) => { this.loading.set(false); this.toast.fail(e); },
    });
  }
}
