import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.Login)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [authGuard]
  },
  {
  path: 'admin/bookings',
  loadComponent: () => import('./features/admin/bookings/bookings').then(m => m.Bookings),
  canActivate: [authGuard]
  },
  {
    path: 'floorplan',
    loadComponent: () => import('./features/floorplan/floorplan').then(m => m.Floorplan),
    canActivate: [authGuard]
  },
  {
    path: 'admin/offices',
    loadComponent: () => import('./features/admin/offices/offices').then(m => m.Offices),
    canActivate: [authGuard]
  },
  {
    path: 'admin/spaces',
    loadComponent: () => import('./features/admin/spaces/spaces').then(m => m.Spaces),
    canActivate: [authGuard]
  },
  {
    path: 'admin/users',
    loadComponent: () => import('./features/admin/users/users').then(m => m.Users),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: 'login' }
];
