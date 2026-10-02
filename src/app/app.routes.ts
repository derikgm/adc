import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home.page';
import { TiendaPageComponent } from './pages/tienda.page';

/**
 * Rutas con ubicación por path (sin `#`), para que la tienda quede como
 * `{dominio}/tienda` y el enlace se pueda compartir tal cual.
 */
export const routes: Routes = [
  {
    path: '',
    component: HomePageComponent,
    title: 'ADC · Artículos y servicios eléctricos',
  },
  {
    path: 'tienda',
    component: TiendaPageComponent,
    title: 'Tienda · ADC',
  },
  { path: '**', redirectTo: '' },
];
