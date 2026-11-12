import { Routes } from '@angular/router';
import HomePage from './pages/home.page';

export const routes: Routes = [
  { path: '', component: HomePage, data: { lang: 'pt' } },
  { path: 'en', component: HomePage, data: { lang: 'en' } },
  { path: '**', redirectTo: '' },
];
