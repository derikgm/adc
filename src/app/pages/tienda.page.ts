import { Component, computed, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CargandoComponent } from '../components/cargando.component';
import { EstadoCatalogoComponent } from '../components/estado-catalogo.component';
import { ProductoCardComponent } from '../components/producto-card.component';
import { Producto, todosLosProductos } from '../models/productos';
import { ProductosService } from '../services/productos.service';
import { SeoService, URL_SITIO } from '../services/seo.service';

/** Sección con el id con el que el servidor la distingue (para las anclas). */
interface SeccionConId {
  nombre: string;
  id: number | null;
}

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
  imports: [
    RouterLink,
    CargandoComponent,
    EstadoCatalogoComponent,
    ProductoCardComponent,
  ],
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
          <app-estado-catalogo
            [error]="productos.error()"
            (reintentar)="productos.cargar()"
          />
        </div>
      } @else {
        @if (secciones().length > 1) {
          <!-- Acceso rápido a cada sección; se queda pegado bajo el header. -->
          <nav
            class="sticky top-16 z-40 mt-8 border-y border-navy-800 bg-navy-950/95 backdrop-blur"
            aria-label="Secciones del catálogo"
          >
            <div class="container-adc flex gap-2 overflow-x-auto py-3">
              @for (seccion of secciones(); track seccion.nombre) {
                <a
                  [routerLink]="'/tienda'"
                  [fragment]="idSeccion(seccion)"
                  class="shrink-0 rounded-full border border-navy-700 px-4 py-1.5 text-sm font-medium text-navy-100 capitalize transition-colors hover:border-gold-300 hover:text-gold-300"
                >
                  {{ seccion.nombre }}
                </a>
              }
            </div>
          </nav>
        }

        <div class="container-adc mt-8">
          @for (seccion of secciones(); track seccion.nombre) {
            <div class="mb-12 scroll-mt-36" [id]="idSeccion(seccion)">
              <h2 class="mb-4 text-2xl font-bold text-white capitalize">
                {{ seccion.nombre }}
              </h2>

              @if (productosDe(seccion.nombre).length) {
                <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  @for (producto of productosDe(seccion.nombre); track producto.id) {
                    <app-producto-card [producto]="producto" />
                  }
                </div>
              } @else {
                <p class="text-navy-300">No hay productos en esta sección.</p>
              }
            </div>
          }

          @if (!secciones().length) {
            <app-estado-catalogo [vacio]="true" />
          }

          <p class="mb-4 text-center text-sm text-navy-300">
            ¿Necesitas más información?
            <a
              routerLink="/"
              fragment="contacto"
              class="text-navy-200 transition-colors hover:text-gold-300"
            >
              Contacta con nosotros
            </a>
            y te ayudamos.
          </p>
        </div>
      }
    </section>
  `,
})
export class TiendaPageComponent {
  readonly productos = inject(ProductosService);

  /** Secciones en orden del servidor, con el id con el que distingue cada una. */
  readonly secciones = computed<SeccionConId[]>(() => {
    const catalogo = this.productos.catalogo();
    if (!catalogo) return [];

    return catalogo.secciones.map((nombre) => ({
      nombre,
      // El catálogo agrupa por nombre; cualquier producto del grupo sirve para
      // recuperar el id (dos secciones con el mismo nombre comparten id).
      id: catalogo.productos[nombre]?.[0]?.seccion_id ?? null,
    }));
  });

  constructor() {
    const seo = inject(SeoService);
    this.productos.cargar();

    // SEO de la tienda: cuando el catálogo llega (o se refresca), se actualizan
    // el canonical, el Open Graph y el JSON-LD de tipo ItemList.
    effect(() => {
      const catalogo = this.productos.catalogo();
      seo.fijar({
        titulo: 'Tienda · ADC',
        descripcion:
          'Todos los productos de ADC: material eléctrico, herramientas, paneles solares y más, con precios y moneda. Agrupados por secciones.',
        ruta: '/tienda',
        imagen: `${URL_SITIO}/assets/images/hero.jpg`,
        jsonLd: catalogo
          ? ({
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              name: 'Tienda · ADC',
              itemListElement: todosLosProductos(catalogo).map(
                (producto, posicion) => ({
                  '@type': 'Product',
                  position: posicion + 1,
                  name: producto.nombre,
                  offers: {
                    '@type': 'Offer',
                    price: producto.precio,
                    priceCurrency: producto.moneda,
                  },
                }),
              ),
            } satisfies object)
          : undefined,
      });
    });
  }

  productosDe(seccion: string): Producto[] {
    return this.productos.catalogo()?.productos[seccion] ?? [];
  }

  /**
   * Identificador de ancla de la sección: en minúsculas, sin acentos y sin
   * espacios, con el id del servidor al final. El sufijo `-id` evita que dos
   * secciones «Aseo» y «aseo» (que se normalizan igual) compartan ancla.
   */
  idSeccion(seccion: SeccionConId): string {
    const limpio = seccion.nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const base = `seccion-${limpio}`;
    return seccion.id == null ? base : `${base}-${seccion.id}`;
  }
}
