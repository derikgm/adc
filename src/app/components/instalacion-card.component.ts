import { Component, computed, effect, input, signal } from '@angular/core';
import { Instalacion } from '../models/instalaciones';

/**
 * Tarjeta de una instalación de ADC: imagen, nombre del servicio, precio con su
 * moneda y la lista de puntos de la descripción.
 *
 * Mismo tratamiento que `ProductoCardComponent`: el precio lleva siempre la
 * moneda escrita y CUP se pinta con el dorado de la marca. Si la imagen falla
 * (URL caducada o servidor caído), se cambia por el mismo hueco que usa una
 * instalación sin foto, para no enseñar el icono roto del navegador.
 */
@Component({
  selector: 'app-instalacion-card',
  standalone: true,
  template: `
    <article
      class="group flex flex-col overflow-hidden rounded-xl border border-navy-800 bg-navy-900/60 transition-all hover:-translate-y-1 hover:border-gold-500/60"
    >
      @if (mostrarImagen()) {
        <div class="aspect-[4/3] overflow-hidden bg-navy-950">
          <img
            [src]="instalacion().imagen_url ?? undefined"
            [alt]="instalacion().nombre_servicio"
            loading="lazy"
            decoding="async"
            (error)="sustituirPorPlaceholder()"
            class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      } @else {
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
          {{ instalacion().nombre_servicio }}
        </h3>

        @if (instalacion().descripcion.length) {
          <ul class="space-y-1 text-sm text-navy-200">
            @for (punto of instalacion().descripcion; track $index) {
              <li class="flex gap-2">
                <span class="text-gold-300" aria-hidden="true">•</span>
                <span>{{ punto }}</span>
              </li>
            }
          </ul>
        }

        <p
          class="mt-auto pt-2 text-lg font-bold"
          [class.text-gold-300]="esCup()"
          [class.text-navy-300]="!esCup()"
        >
          {{ instalacion().precio }} {{ instalacion().moneda }}
        </p>
      </div>
    </article>
  `,
})
export class InstalacionCardComponent {
  readonly instalacion = input.required<Instalacion>();

  /** CUP → dorado de la marca; el resto (USD y desconocidas) → azul del logo. */
  readonly esCup = computed(() => this.instalacion().moneda === 'CUP');

  private readonly urlImagen = computed(() => this.instalacion().imagen_url);
  private readonly imagenFallida = signal(false);

  /** Sigue pintando la foto solo si hay URL y no ha fallado al cargar. */
  readonly mostrarImagen = computed(
    () => Boolean(this.urlImagen()) && !this.imagenFallida(),
  );

  constructor() {
    // Si cambia la URL (otra instalación o lista refrescada), se reintenta.
    effect(() => {
      this.urlImagen();
      this.imagenFallida.set(false);
    });
  }

  sustituirPorPlaceholder(): void {
    this.imagenFallida.set(true);
  }
}
