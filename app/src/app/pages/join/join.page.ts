import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonSpinner } from '@ionic/angular';
import { ApiService } from '../../core/api.service';
import { InvitePreview } from '../../core/models';
import { ToastService } from '../../shared/toast.service';

@Component({
  selector: 'app-join',
  imports: [IonContent, IonSpinner],
  template: `
    <ion-content>
      <div class="k-page wrap">
        @if (loading()) {
          <ion-spinner name="crescent" />
        } @else if (preview(); as p) {
          <div class="k-card box rise">
            <div class="emoji">{{ p.emoji }}</div>
            <p class="k-eyebrow">Você foi convidado para</p>
            <h1 class="k-h1">{{ p.name }}</h1>
            <p class="k-muted">{{ p.memberCount }} {{ p.memberCount === 1 ? 'pessoa' : 'pessoas' }} no grupo</p>
            <button class="k-btn block" [disabled]="joining()" (click)="join()">
              @if (joining()) { <ion-spinner name="crescent" /> } @else { Entrar no grupo }
            </button>
            <button class="k-btn ghost block" (click)="home()">Agora não</button>
          </div>
        } @else {
          <div class="k-empty"><div class="emoji">🔗</div><h3>Convite inválido</h3><p>Confira o código ou peça um novo link.</p>
            <button class="k-btn" (click)="home()">Voltar</button></div>
        }
      </div>
    </ion-content>
  `,
  styles: `
    .wrap { min-height: 100%; display: grid; place-items: center; }
    .box { width: 100%; padding: 32px 22px; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 10px; }
    .emoji { font-size: 56px; }
    .k-btn { margin-top: 8px; }
  `,
})
export class JoinPage implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);

  code = '';
  loading = signal(true);
  joining = signal(false);
  preview = signal<InvitePreview | null>(null);

  ngOnInit() {
    this.code = (this.route.snapshot.paramMap.get('code') ?? '').toUpperCase();
    this.api.invitePreview(this.code).subscribe({
      next: (p) => { this.preview.set(p); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  join() {
    this.joining.set(true);
    this.api.join(this.code).subscribe({
      next: (g) => this.router.navigate(['/groups', g.id], { replaceUrl: true }),
      error: (e) => { this.joining.set(false); this.toast.fail(e); },
    });
  }

  home() { this.router.navigateByUrl('/groups', { replaceUrl: true }); }
}
