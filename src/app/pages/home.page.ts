import { Component } from '@angular/core';
import { HeroComponent } from '../components/sections/hero.component';
import { InstalacionesComponent } from '../components/sections/instalaciones.component';
import { PlaceholderComponent } from '../components/sections/placeholder.component';
import { ProductosPreviewComponent } from '../components/sections/productos-preview.component';

/** Página de inicio: lo que antes pintaba `app.ts` dentro del router-outlet. */
@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    HeroComponent,
    InstalacionesComponent,
    ProductosPreviewComponent,
    PlaceholderComponent,
  ],
  template: `
    <app-hero />
    <app-instalaciones />
    <app-productos-preview />
    <app-placeholder id="servicios" title="Servicios" />
    <app-placeholder id="contacto" title="Contacto" />
  `,
})
export class HomePageComponent {}
