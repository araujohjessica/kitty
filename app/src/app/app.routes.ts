import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'groups' },
  { path: 'login', canActivate: [guestGuard], loadComponent: () => import('./pages/auth/auth.page').then((m) => m.AuthPage) },
  { path: 'groups', canActivate: [authGuard], loadComponent: () => import('./pages/groups/groups.page').then((m) => m.GroupsPage) },
  { path: 'groups/:id', canActivate: [authGuard], loadComponent: () => import('./pages/group/group.page').then((m) => m.GroupPage) },
  { path: 'join/:code', canActivate: [authGuard], loadComponent: () => import('./pages/join/join.page').then((m) => m.JoinPage) },
  { path: 'profile', canActivate: [authGuard], loadComponent: () => import('./pages/profile/profile.page').then((m) => m.ProfilePage) },
  { path: '**', redirectTo: 'groups' },
];
