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
    <app-header />
    <main class="pt-16">
      <router-outlet />
    </main>
    <app-footer />
    <app-whatsapp-button />
  `,
})
export class App {}
