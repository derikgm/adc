import { Component, computed, effect, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Producto } from '../models/productos';

/**
 * Tarjeta de producto: imagen, nombre y precio con su moneda.
 *
 * El precio lleva siempre la moneda escrita («3000 CUP», «20 USD») para que
 * el cliente sepa de qué está hablando, y cada moneda se pinta con un color:
 * CUP con el dorado de la marca y todo lo demás (USD y monedas desconocidas)
 * con el azul eléctrico del logo (todo.md, punto 2.2).
 *
 * Cuando la publicación tiene modelos se avisa («3 modelos») y el precio que se
 * ve es el del modelo más barato, delante de la palabra «desde»: en el teléfono
 * lo que decide es el piso de precio, y el resto se ve al entrar.
 *
 * Si la imagen falla (URL caducada o servidor caído), se sustituye por el
 * mismo placeholder que usa un producto sin foto, para no enseñar el icono
 * roto del navegador.
 *
 * Toda la tarjeta es un enlace a la ficha del producto: en el teléfono se toca
 * con el pulgar sobre la foto y se abre, sin necesitar un botón aparte.
 */
@Component({
  selector: 'app-producto-card',
  standalone: true,
  imports: [RouterLink],
  template: `
    <a
      [routerLink]="['/producto', producto().id]"
      [attr.aria-label]="'Ver ' + producto().nombre"
      class="block"
    >
      <article
        class="group relative flex h-full flex-col overflow-hidden rounded-xl border border-navy-800 bg-navy-900/60 transition-all hover:-translate-y-1 hover:border-gold-500/60"
      >
      >
        @if (modelos().length > 1) {
          <span
            class="absolute left-2 top-2 rounded-full bg-navy-950/85 px-2 py-0.5 text-[11px] font-semibold text-gold-300"
          >
            {{ modelos().length }} modelos
          </span>
        }

        @if (mostrarImagen()) {
          <div class="aspect-[4/3] overflow-hidden bg-navy-950">
            <img
              [src]="urlImagen() ?? undefined"
              [alt]="producto().nombre"
              loading="lazy"
              decoding="async"
              (error)="sustituirPorPlaceholder()"
              class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        } @else {
          <!-- Sin imagen (o imagen rota): hueco del mismo tamaño para que la
               cuadrícula no se desalinee, con el rayo del logo de fondo. -->
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
            @if (precio().desde) {
              <span class="text-xs font-medium text-navy-300">desde</span>
            }
            {{ precio().valor }} {{ precio().moneda }}
          </p>
        </div>
      </article>
    </a>
  `,
})
export class ProductoCardComponent {
  readonly producto = input.required<Producto>();

  readonly modelos = computed(() => this.producto().modelos);

  /**
   * El precio que se muestra: el del modelo más barato si la publicación tiene
   * variantes —con «desde» cuando no todos cuestan igual—, y el de la propia
   * publicación si se vende como un solo producto.
   */
  readonly precio = computed(() => {
    const publicacion = this.producto();

    if (!this.modelos().length) {
      return { valor: publicacion.precio, moneda: publicacion.moneda, desde: false };
    }

    const barato = this.modelos().reduce((menor, m) => (m.precio < menor.precio ? m : menor));

    return {
      valor: barato.precio,
      moneda: barato.moneda,
      desde: this.modelos().some((m) => m.precio !== barato.precio),
    };
  });

  /** CUP → dorado de la marca; el resto (USD y desconocidas) → azul del logo. */
  readonly esCup = computed(() => this.precio().moneda === 'CUP');

  /** La foto de la publicación, o la de un modelo si ella no tiene. */
  readonly urlImagen = computed(
    () =>
      this.producto().imagen_url ??
      this.modelos().find((modelo) => modelo.imagen_url)?.imagen_url ??
      null,
  );
  private readonly imagenFallida = signal(false);

  /** Sigue pintando la foto solo si hay URL y no ha fallado al cargar. */
  readonly mostrarImagen = computed(
    () => Boolean(this.urlImagen()) && !this.imagenFallida(),
  );

  constructor() {
    // Si cambia la URL (otro producto o catálogo refrescado), se reintenta.
    effect(() => {
      this.urlImagen();
      this.imagenFallida.set(false);
    });
  }

  sustituirPorPlaceholder(): void {
    this.imagenFallida.set(true);
  }
}