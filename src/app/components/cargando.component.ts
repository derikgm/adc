import { Component } from '@angular/core';

/**
 * Spinner que se muestra mientras la página espera al servidor.
 *
 * El hosting del servidor es Free y duerme el programa, así que la primera
 * petición puede tardar bastante: mientras tanto se gira este spinner con su
 * mensaje (todo.md, punto 2.1).
 */
@Component({
  selector: 'app-cargando',
  standalone: true,
  template: `
    <div
      class="flex flex-col items-center justify-center gap-3 py-10"
      role="status"
      aria-live="polite"
    >
      <svg
        class="h-10 w-10 animate-spin text-gold-300"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <p class="text-sm font-medium text-navy-200">Obteniendo datos del servidor…</p>
    </div>
  `,
})
export class CargandoComponent {}
