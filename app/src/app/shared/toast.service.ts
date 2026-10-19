import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private ctrl = inject(ToastController);

  async ok(message: string) { return this.show(message, 'success'); }
  async fail(err: unknown, fallback = 'Algo deu errado. Tente novamente.') { return this.show(this.message(err, fallback), 'danger'); }

  message(err: unknown, fallback = 'Algo deu errado. Tente novamente.'): string {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 0) return 'Sem conexão com o servidor.';
      const m = err.error?.message;
      return Array.isArray(m) ? m[0] : m || fallback;
    }
    return fallback;
  }

  private async show(message: string, color: 'success' | 'danger') {
    const t = await this.ctrl.create({ message, color, duration: 2600, position: 'top', buttons: [] });
    await t.present();
  }
}
