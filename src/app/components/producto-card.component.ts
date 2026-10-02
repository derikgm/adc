import { Component, computed, input } from '@angular/core';
import { Producto } from '../models/productos';

/**
 * Tarjeta de producto: imagen, nombre y precio con su moneda.
 *
 * El precio lleva siempre la moneda escrita («3000 CUP», «20 USD») para que
 * el cliente sepa de qué está hablando, y cada moneda se pinta con un color:
 * CUP con el dorado de la marca y todo lo demás (USD y monedas desconocidas)
 * con el azul eléctrico del logo (todo.md, punto 2.2).
 */
@Component({
  selector: 'app-producto-card',
  standalone: true,
  template: `
    <article
      class="group flex flex-col overflow-hidden rounded-xl border border-navy-800 bg-navy-900/60 transition-all hover:-translate-y-1 hover:border-gold-500/60"
    >
      @if (producto().imagen_url) {
        <div class="aspect-[4/3] overflow-hidden bg-navy-950">
          <img
            [src]="producto().imagen_url"
            [alt]="producto().nombre"
            loading="lazy"
            decoding="async"
            class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      } @else {
        <!-- Sin imagen: hueco del mismo tamaño para que la cuadrícula no se
             desalinee, con el rayo del logo de fondo. -->
        <div class="grid aspect-[4/3] place-items-center bg-navy-950">
          <svg
            class="h-10 w-10 text-navy-800"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M13 2 4.5 13.5H11L9.5 22 19 10h-6.5L13 2z" />
          </svg>
        </div>
      }

      <div class="flex flex-1 flex-col gap-2 p-4">
        <h3 class="line-clamp-2 font-semibold leading-snug text-white">
          {{ producto().nombre }}
        </h3>
        <p
          class="mt-auto text-lg font-bold"
          [class.text-gold-300]="esCup()"
          [class.text-navy-300]="!esCup()"
        >
          {{ producto().precio }} {{ producto().moneda }}
        </p>
      </div>
    </article>
  `,
})
export class ProductoCardComponent {
  readonly producto = input.required<Producto>();

  /** CUP → dorado de la marca; el resto (USD y desconocidas) → azul del logo. */
  readonly esCup = computed(() => this.producto().moneda === 'CUP');
}
