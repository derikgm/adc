import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './components/footer.component';
import { HeaderComponent } from './components/header.component';
import { WhatsappButtonComponent } from './components/whatsapp-button.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    HeaderComponent,
    FooterComponent,
    WhatsappButtonComponent,
    RouterOutlet,
  ],
  template: `
    <a
      href="#contenido"
      class="fixed top-2 left-2 z-[60] rounded-md bg-gold-300 px-4 py-2 font-semibold text-navy-950 -translate-y-24 focus:translate-y-0 focus:outline-none"
    >
      Saltar al contenido
    </a>
    <app-header />
    <main id="contenido" class="pt-16">
      <router-outlet />
    </main>
    <app-footer />
    <app-whatsapp-button />
  `,
})
export class App {}
