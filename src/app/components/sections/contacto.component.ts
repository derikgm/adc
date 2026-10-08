import { Component } from '@angular/core';

const NUMERO_WHATSAPP = '59061926';

@Component({
  selector: 'app-contacto',
  standalone: true,
  template: `
    <section id="contacto" class="bg-navy-950 py-20">
      <div class="container-adc">
        <div class="mb-8 text-center">
          <p
            class="mb-3 inline-block rounded-full border border-gold-500/40 px-4 py-1 text-xs font-semibold tracking-widest text-gold-300 uppercase"
          >
            ¿Tienes una consulta?
          </p>
          <h2 class="text-3xl font-bold text-white md:text-4xl">
            Contacto
          </h2>
          <p class="mx-auto mt-3 max-w-2xl text-navy-200">
            Escríbenos por WhatsApp y te atenderemos lo antes posible. También
            puedes preguntar por precios, stock o disponibilidad.
          </p>
        </div>

        <div class="mx-auto max-w-xl rounded-xl border border-navy-800 bg-navy-900/60 p-8 text-center shadow-lg">
          <p class="mb-4 text-navy-200">
            Para consultas rápidas, te recomendamos contactarnos directamente por
            WhatsApp:
          </p>
          <a
            [href]="'https://wa.me/' + numeroWhatsapp"
            target="_blank"
            rel="noopener"
            class="inline-flex items-center gap-2 rounded-md bg-gold-300 px-6 py-3 font-semibold text-navy-950 transition-colors hover:bg-gold-400"
          >
            <svg
              class="h-5 w-5"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                d="M19.05 4.91A9.816 9.816 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91c0-2.65-1.03-5.14-2.9-7.01zm-7.01 15.24c-1.48 0-2.93-.4-4.2-1.15l-.3-.18l-3.12.82l.83-3.04l-.2-.31a8.264 8.264 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24c2.2 0 4.27.86 5.82 2.42a8.183 8.183 0 0 1 2.41 5.83c.02 4.54-3.68 8.23-8.22 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81c-.23-.08-.39-.12-.56.12c-.17.25-.64.81-.78.97c-.14.17-.29.19-.54.06c-.25-.12-1.05-.39-1.99-1.23c-.74-.66-1.23-1.47-1.38-1.72c-.14-.25-.02-.38.11-.51c.11-.11.25-.29.37-.43s.17-.25.25-.41c.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31c-.22.25-.86.85-.86 2.07c0 1.22.89 2.4 1.01 2.56c.12.17 1.75 2.67 4.23 3.74c.59.26 1.05.41 1.41.52c.59.19 1.13.16 1.56.1c.48-.07 1.47-.6 1.67-1.18c.21-.58.21-1.07.14-1.18s-.22-.16-.47-.28z"
              />
            </svg>
            Escribir por WhatsApp
          </a>
          <p class="mt-6 text-sm text-navy-400">
            WhatsApp: {{ numeroWhatsapp }}
          </p>
        </div>
      </div>
    </section>
  `,
})
export class ContactoComponent {
  readonly numeroWhatsapp = NUMERO_WHATSAPP;
}
