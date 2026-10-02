import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

interface ItemMenu {
  destino: string;
  fragmento?: string;
  label: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header class="fixed inset-x-0 top-0 z-50 bg-ink/95 backdrop-blur border-b border-navy-800">
      <nav class="container-adc flex h-16 items-center justify-between">
        <!-- Marca -->
        <a routerLink="/" fragment="inicio" class="flex items-center gap-3">
          <img
            src="assets/images/logo.jpg"
            alt="ADC"
            class="h-11 w-11 rounded-md object-contain"
          />
          <span class="text-xl font-bold tracking-wide text-white">
            ADC
          </span>
        </a>

        <!-- Menú escritorio -->
        <ul class="mx-auto hidden items-center gap-8 text-sm font-medium text-navy-100 md:flex">
          @for (item of menuItems; track item.label) {
            <li>
              <a
                [routerLink]="item.destino"
                [fragment]="item.fragmento"
                (click)="closeMenu()"
                class="transition-colors hover:text-gold-300"
                >{{ item.label }}</a
              >
            </li>
          }
        </ul>

        <!-- El CTA de contacto ya no vive en el header: ahora es el botón
             flotante de WhatsApp (app-whatsapp-button). -->

        <!-- Botón menú móvil -->
        <button
          type="button"
          (click)="toggleMenu()"
          class="grid h-10 w-10 place-items-center rounded-md text-white md:hidden"
          [attr.aria-expanded]="menuOpen()"
          aria-label="Abrir menú"
        >
          @if (menuOpen()) {
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          } @else {
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          }
        </button>
      </nav>

      <!-- Menú móvil -->
      @if (menuOpen()) {
        <div class="border-t border-navy-800 bg-ink md:hidden">
          <ul class="container-adc flex flex-col gap-1 py-4 text-navy-100">
            @for (item of menuItems; track item.label) {
              <li>
                <a
                  [routerLink]="item.destino"
                  [fragment]="item.fragmento"
                  (click)="closeMenu()"
                  class="block rounded-md px-3 py-2 transition-colors hover:bg-navy-900 hover:text-gold-300"
                  >{{ item.label }}</a
                >
              </li>
            }
          </ul>
        </div>
      }
    </header>
  `,
})
export class HeaderComponent {
  menuOpen = signal(false);

  /**
   * «Tienda» apunta a la ruta /tienda; el resto vuelven al inicio con su
   * ancla, para que el menú funcione igual desde la página de la tienda.
   */
  menuItems: ItemMenu[] = [
    { destino: '/', fragmento: 'inicio', label: 'Inicio' },
    { destino: '/tienda', label: 'Tienda' },
    { destino: '/', fragmento: 'servicios', label: 'Servicios' },
    { destino: '/', fragmento: 'instalaciones', label: 'Instalaciones' },
    { destino: '/', fragmento: 'contacto', label: 'Contacto' },
  ];

  toggleMenu() {
    this.menuOpen.update((value) => !value);
  }

  closeMenu() {
    this.menuOpen.set(false);
  }
}
