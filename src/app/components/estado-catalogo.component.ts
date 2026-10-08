import { Component, input, output } from '@angular/core';

/**
 * Estado del catálogo cuando no hay contenido que pintar, reutilizado por la
 * vista previa del home y por `/tienda`:
 *
 * - con `error`: la tarjeta con el mensaje y su botón «Reintentar»;
 * - con `vacio` (`true`): el aviso de que todavía no hay productos publicados.
 */
@Component({
  selector: 'app-estado-catalogo',
  standalone: true,
  template: `
    @if (error(); as mensaje) {
      <div
        class="mx-auto mt-6 max-w-xl rounded-xl border border-navy-800 bg-navy-900/60 p-6 text-center"
      >
        <p class="text-navy-200">{{ mensaje }}</p>
        <button
          type="button"
          (click)="reintentar.emit()"
          class="mt-4 rounded-md bg-gold-300 px-5 py-2 font-semibold text-navy-950 transition-colors hover:bg-gold-400"
        >
          Reintentar
        </button>
      </div>
    } @else if (vacio()) {
      <p class="py-8 text-center text-navy-300">
        Todavía no hay productos publicados.
      </p>
    }
  `,
})
export class EstadoCatalogoComponent {
  readonly error = input<string | null>(null);
  readonly vacio = input(false);
  readonly reintentar = output<void>();
}