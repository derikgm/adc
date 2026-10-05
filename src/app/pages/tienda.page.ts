import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CargandoComponent } from '../components/cargando.component';
import { ProductoCardComponent } from '../components/producto-card.component';
import { Producto } from '../models/productos';
import { ProductosService } from '../services/productos.service';

/**
 * Página `/tienda`: catálogo completo agrupado por secciones, con una barra
 * de acceso rápido a cada sección.
 *
 * El estilo imita a https://elyerromenu.com/: barra de categorías arriba,
 * un título por sección y una cuadrícula de tarjetas con imagen, nombre y
 * precio con su moneda.
 */
@Component({
  selector: 'app-tienda-page',
  standalone: true,
  imports: [RouterLink, CargandoComponent, ProductoCardComponent],
  template: `
    <section class="bg-navy-950 py-12">
      <div class="container-adc">
        <a
          routerLink="/"
          class="text-sm text-navy-300 transition-colors hover:text-gold-300"
        >
          ← Volver al inicio
        </a>

        <p
          class="mt-6 inline-block rounded-full border border-gold-500/40 px-4 py-1 text-xs font-semibold tracking-widest text-gold-300 uppercase"
        >
          Tienda
        </p>
        <h1 class="mt-3 text-3xl font-bold text-white md:text-4xl">
          Todos nuestros productos
        </h1>
        <p class="mt-3 max-w-2xl text-navy-200">
          Elige una sección para saltar a ella. Cada precio se muestra con su
          moneda para que no queden dudas.
        </p>
      </div>

      @if (productos.cargando()) {
        <app-cargando />
      } @else if (productos.error()) {
        <div class="container-adc">
          <div
            class="mx-auto mt-6 max-w-xl rounded-xl border border-navy-800 bg-navy-900/60 p-6 text-center"
          >
            <p class="text-navy-200">{{ productos.error() }}</p>
            <button
              type="button"
              (click)="productos.cargar()"
              class="mt-4 rounded-md bg-gold-300 px-5 py-2 font-semibold text-navy-950 transition-colors hover:bg-gold-400"
            >
              Reintentar
            </button>
          </div>
        </div>
      } @else {
        @if (secciones().length > 1) {
          <!-- Acceso rápido a cada sección; se queda pegado bajo el header. -->
          <nav
            class="sticky top-16 z-40 mt-8 border-y border-navy-800 bg-navy-950/95 backdrop-blur"
          >
            <div class="container-adc flex gap-2 overflow-x-auto py-3">
              @for (seccion of secciones(); track seccion) {
                <a
                  [href]="'#' + idSeccion(seccion)"
                  class="shrink-0 rounded-full border border-navy-700 px-4 py-1.5 text-sm font-medium text-navy-100 capitalize transition-colors hover:border-gold-300 hover:text-gold-300"
                >
                  {{ seccion }}
                </a>
              }
            </div>
          </nav>
        }

        <div class="container-adc mt-8">
          @for (seccion of secciones(); track seccion) {
            <div class="mb-12 scroll-mt-36" [id]="idSeccion(seccion)">
              <h2 class="mb-4 text-2xl font-bold text-white capitalize">
                {{ seccion }}
              </h2>

              @if (productosDe(seccion).length) {
                <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  @for (producto of productosDe(seccion); track producto.id) {
                    <app-producto-card [producto]="producto" />
                  }
                </div>
              } @else {
                <p class="text-navy-300">No hay productos en esta sección.</p>
              }
            </div>
          }

          @if (!secciones().length) {
            <p class="py-8 text-center text-navy-300">
              Todavía no hay productos publicados.
            </p>
          }

          <p class="mb-4 text-center text-sm text-navy-400">
            ¿Necesitas más información? Contacta con nosotros y te ayudamos.
          </p>
        </div>
      }
    </section>
  `,
})
export class TiendaPageComponent {
  readonly productos = inject(ProductosService);

  readonly secciones = computed(
    () => this.productos.catalogo()?.secciones ?? [],
  );

  constructor() {
    this.productos.cargar();
  }

  productosDe(seccion: string): Producto[] {
    return this.productos.catalogo()?.productos[seccion] ?? [];
  }

  /**
   * Identificador de ancla de la sección: en minúsculas, sin acentos y sin
   * espacios, para que el chip funcione igual con «aseo» o «Artículos de aseo».
   */
  idSeccion(seccion: string): string {
    const limpio = seccion
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return `seccion-${limpio}`;
  }
}
