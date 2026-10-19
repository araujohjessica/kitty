import { Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular';
import { ThemeService } from './core/theme.service';

@Component({
  selector: 'app-root',
  imports: [IonApp, IonRouterOutlet],
  template: `<ion-app><ion-router-outlet /></ion-app>`,
})
export class AppComponent {
  constructor() {
    inject(ThemeService).init();
  }
}
