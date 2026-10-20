import { DOCUMENT } from '@angular/common';
import {
  Component,
  OnDestroy,
  HostListener,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { Producto } from '../models/productos';

/**
 * Tarjeta de producto: imagen, nombre y precio con su moneda.
 *
 * Al pulsar la tarjeta (o con Enter/Espacio) se abre un modal con la imagen
 * grande, la descripción del producto y, al final, el nombre y el precio con su
 * moneda. Si el producto no tiene descripción, el modal enseña solo nombre y
 * precio (punto 1 de todo.md).
 *
 * El precio lleva siempre la moneda escrita («3000 CUP», «20 USD») para que
 * el cliente sepa de qué está hablando, y cada moneda se pinta con un color:
 * CUP con el dorado de la marca y todo lo demás (USD y monedas desconocidas)
 * con el azul eléctrico del logo (todo.md, punto 2.2).
 *
 * Si la imagen falla (URL caducada o servidor caído), se sustituye por el
 * mismo placeholder que usa un producto sin foto, para no enseñar el icono
 * roto del navegador.
 */
@Component({
  selector: 'app-producto-card',
  standalone: true,
  template: `
    <article
      class="group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-navy-800 bg-navy-900/60 transition-all hover:-translate-y-1 hover:border-gold-500/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-300"
      role="button"
      tabindex="0"
      [attr.aria-label]="'Ver ' + producto().nombre"
      (click)="abrirModal()"
      (keydown.enter)="abrirModal()"
      (keydown.space)="abrirConTeclado($event)"
    >
      @if (mostrarImagen()) {
        <div class="aspect-[4/3] overflow-hidden bg-navy-950">
          <img
            [src]="producto().imagen_url ?? undefined"
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
          {{ producto().precio }} {{ producto().moneda }}
        </p>
      </div>
    </article>

    @if (modalAbierto()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="producto().nombre"
        (click)="cerrarModal()"
      >
        <div
          class="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-navy-700 bg-navy-900 shadow-2xl"
          (click)="$event.stopPropagation()"
        >
          <button
            type="button"
            class="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-navy-950/80 text-xl leading-none text-white transition-colors hover:bg-navy-950"
            aria-label="Cerrar"
            (click)="cerrarModal()"
          >
            ×
          </button>

          @if (mostrarImagenModal()) {
            <div class="aspect-[4/3] shrink-0 overflow-hidden bg-navy-950">
              <img
                [src]="producto().imagen_url ?? undefined"
                [alt]="producto().nombre"
                decoding="async"
                (error)="imagenModalFallida.set(true)"
                class="h-full w-full object-cover"
              />
            </div>
          }

          <div class="overflow-y-auto p-5">
            @if (producto().descripcion) {
              <p class="whitespace-pre-line text-navy-100">{{ producto().descripcion }}</p>
            }

            <!-- Al final, siempre: nombre y precio con su moneda. -->
            <div class="mt-4 border-t border-navy-700 pt-4">
              <h3 class="text-lg font-semibold leading-snug text-white">
                {{ producto().nombre }}
              </h3>
              <p
                class="mt-1 text-xl font-bold"
                [class.text-gold-300]="esCup()"
                [class.text-navy-300]="!esCup()"
              >
                {{ producto().precio }} {{ producto().moneda }}
              </p>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class ProductoCardComponent implements OnDestroy {
  private readonly documento = inject(DOCUMENT);

  readonly producto = input.required<Producto>();

  /** `true` mientras el modal de detalle está abierto. */
  readonly modalAbierto = signal(false);

  /** CUP → dorado de la marca; el resto (USD y desconocidas) → azul del logo. */
  readonly esCup = computed(() => this.producto().moneda === 'CUP');

  private readonly urlImagen = computed(() => this.producto().imagen_url);
  private readonly imagenFallida = signal(false);
  readonly imagenModalFallida = signal(false);

  /** Sigue pintando la foto solo si hay URL y no ha fallado al cargar. */
  readonly mostrarImagen = computed(
    () => Boolean(this.urlImagen()) && !this.imagenFallida(),
  );

  /** Igual que la tarjeta, pero para la foto grande del modal. */
  readonly mostrarImagenModal = computed(
    () => Boolean(this.urlImagen()) && !this.imagenModalFallida(),
  );

  constructor() {
    // Si cambia la URL (otro producto o catálogo refrescado), se reintenta.
    effect(() => {
      this.urlImagen();
      this.imagenFallida.set(false);
      this.imagenModalFallida.set(false);
    });
  }

  abrirModal(): void {
    // Al reabrir se reintenta la foto grande, por si la anterior falló.
    this.imagenModalFallida.set(false);
    this.modalAbierto.set(true);
    // El modal ocupa la pantalla: se bloquea el scroll del fondo.
    this.documento.body.style.overflow = 'hidden';
  }

  cerrarModal(): void {
    this.modalAbierto.set(false);
    this.documento.body.style.overflow = '';
  }

  /** Espacio no debe hacer scroll de la página al abrir con el teclado. */
  abrirConTeclado(evento: Event): void {
    evento.preventDefault();
    this.abrirModal();
  }

  @HostListener('document:keydown.escape')
  cerrarConEscape(): void {
    if (this.modalAbierto()) this.cerrarModal();
  }

  ngOnDestroy(): void {
    // Si se navega con el modal abierto, el fondo no se queda sin scroll.
    this.documento.body.style.overflow = '';
  }

  sustituirPorPlaceholder(): void {
    this.imagenFallida.set(true);
  }
}
