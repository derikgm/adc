import { Component } from '@angular/core';
import { FooterComponent } from './components/footer.component';
import { HeaderComponent } from './components/header.component';
import { HeroComponent } from './components/sections/hero.component';
import { InstalacionesComponent } from './components/sections/instalaciones.component';
import { PlaceholderComponent } from './components/sections/placeholder.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    HeaderComponent,
    FooterComponent,
    HeroComponent,
    PlaceholderComponent,
    InstalacionesComponent,
  ],
  template: `
    <app-header />
    <main class="pt-16">
      <app-hero />
      <app-instalaciones />
      <app-placeholder id="tienda" title="Tienda" />
      <app-placeholder id="servicios" title="Servicios" />
      <app-placeholder id="contacto" title="Contacto" />
    </main>
    <app-footer />
  `,
})
export class App {}
