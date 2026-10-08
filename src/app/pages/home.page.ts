import { Component } from '@angular/core';
import { HeroComponent } from '../components/sections/hero.component';
import { InstalacionesComponent } from '../components/sections/instalaciones.component';
import { ServiciosComponent } from '../components/sections/servicios.component';
import { ContactoComponent } from '../components/sections/contacto.component';
import { ProductosPreviewComponent } from '../components/sections/productos-preview.component';
import { SeoService, URL_SITIO } from '../services/seo.service';

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
export class HomePageComponent {
  constructor(seo: SeoService) {
    seo.fijar({
      titulo: 'ADC · Artículos y servicios eléctricos',
      descripcion:
        'ADC: suministro de material eléctrico, instalación de paneles y tableros, brigada de montaje, mantenimiento y kits completos. Escríbenos por WhatsApp.',
      ruta: '/',
      imagen: `${URL_SITIO}/assets/images/hero.jpg`,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'Store',
        name: 'ADC',
        description:
          'Artículos y servicios eléctricos: material eléctrico, instalaciones, brigada y mantenimiento.',
        url: `${URL_SITIO}/`,
        telephone: '59061926',
        sameAs: `https://wa.me/59061926`,
      },
    });
  }
}