import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home.page';
import { ProductoDetallePageComponent } from './pages/producto-detalle.page';
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
  {
    // La ficha de una publicación: `/producto/5`. El título lo cambia la propia
    // página con `SeoService`, que pone el nombre del producto.
    path: 'producto/:id',
    component: ProductoDetallePageComponent,
    title: 'Producto · ADC',
  },
  { path: '**', redirectTo: '' },
];
