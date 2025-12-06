import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'validation',
    pathMatch: 'full'
  },
  {
    path: 'validation',
    loadComponent: () => import('./features/validation/pages/validation-page/validation-page.component')
      .then(m => m.ValidationPageComponent),
    title: 'Validar Coordenadas'
  },
  {
    path: 'history',
    loadComponent: () => import('./features/validation/pages/history-page/history-page.component')
      .then(m => m.HistoryPageComponent),
    title: 'Historial de Validaciones'
  },
  {
    path: '**',
    redirectTo: 'validation'
  }
];
