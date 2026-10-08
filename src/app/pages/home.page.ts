import { Component } from '@angular/core';
import { HeroComponent } from '../components/sections/hero.component';
import { InstalacionesComponent } from '../components/sections/instalaciones.component';
import { ServiciosComponent } from '../components/sections/servicios.component';
import { ContactoComponent } from '../components/sections/contacto.component';
import { ProductosPreviewComponent } from '../components/sections/productos-preview.component';

/** Página de inicio: lo que antes pintaba `app.ts` dentro del router-outlet. */
@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    HeroComponent,
    InstalacionesComponent,
    ProductosPreviewComponent,
    ServiciosComponent,
    ContactoComponent,
  ],
  template: `
    <app-hero />
    <app-instalaciones />
    <app-productos-preview />
    <app-servicios />
    <app-contacto />
  `,
})
export class HomePageComponent {}
