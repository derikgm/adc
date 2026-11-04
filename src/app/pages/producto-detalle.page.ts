import { Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { CargandoComponent } from '../components/cargando.component';
import { EstadoCatalogoComponent } from '../components/estado-catalogo.component';
import { NUMERO_WHATSAPP } from '../components/whatsapp-button.component';
import { Modelo, todosLosProductos } from '../models/productos';
import { ProductosService } from '../services/productos.service';
import { SeoService, URL_SITIO } from '../services/seo.service';

/**
 * Ficha de un producto (`/producto/:id`), pensada para teléfono.
 *
 * Una publicación de ADC puede tener varios **modelos** —la misma nevera en 240,
 * 340 y 420 litros, cada una con su precio, su foto y su ficha—, así que la
 * página se arma alrededor de un selector: los chips dejan elegir variante con el
 * pulgar, y con ella cambian la foto, el precio, las características y el mensaje
 * de WhatsApp que se propone.
 *
 * No se pide nada nuevo al servidor: `GET /adc/productos` ya trae los modelos
 * dentro de cada producto y `ProductosService` los tiene en memoria un minuto,
 * así que entrar desde la tienda es instantáneo.
 */

/** Clases de un chip del selector: dorado el elegido, apagado el resto. */
const CHIP = 'shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors';
const CHIP_ELEGIDO = `${CHIP} border-gold-300 bg-gold-300 text-navy-950`;
const CHIP_OTRO = `${CHIP} border-navy-700 text-navy-100 hover:border-gold-300 hover:text-gold-300`;

/** Clases de una tarjeta de la lista comparativa de modelos. */
const CARTA = 'w-full rounded-xl border p-4 text-left transition-colors';
const CARTA_ELEGIDA = `${CARTA} border-gold-300 bg-navy-900`;
const CARTA_OTRA = `${CARTA} border-navy-800 bg-navy-900/60 hover:border-gold-500/60`;

@Component({
  selector: 'app-producto-detalle-page',
  standalone: true,
  imports: [RouterLink, CargandoComponent, EstadoCatalogoComponent],
  template: `
    <section class="min-h-[60vh] bg-navy-950 py-12">
      <div class="container-adc">
        <a
          routerLink="/tienda"
          class="text-sm text-navy-300 transition-colors hover:text-gold-300"
        >
          ← Volver a la tienda
        </a>
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
        @if (producto(); as publicacion) {
          <div class="container-adc mt-6">
            <p
              class="inline-block rounded-full border border-gold-500/40 px-4 py-1 text-xs font-semibold tracking-widest text-gold-300 uppercase"
            >
              {{ publicacion.seccion ?? 'Producto' }}
            </p>
            <h1 class="mt-3 text-2xl font-bold text-white md:text-4xl">
              {{ publicacion.nombre }}
            </h1>

            <div class="mt-6 grid gap-6 md:grid-cols-2 md:gap-10">
              <!-- La foto del modelo elegido; si no tiene, la de la publicación. -->
              <div class="overflow-hidden rounded-xl border border-navy-800 bg-navy-900/60">
                @if (mostrarImagen()) {
                  <img
                    [src]="imagenActiva() ?? undefined"
                    [alt]="nombreDeFoto()"
                    decoding="async"
                    (error)="sustituirPorPlaceholder()"
                    class="aspect-square w-full object-cover"
                  />
                } @else {
                  <div class="grid aspect-square place-items-center bg-navy-950">
                    <svg
                      class="h-16 w-16 text-navy-800"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M13 2 4.5 13.5H11L9.5 22 19 10h-6.5L13 2z" />
                    </svg>
                  </div>
                }
              </div>

              <div class="flex flex-col gap-5">
                @if (modelos().length > 1) {
                  <div>
                    <p class="text-sm font-medium text-navy-300">Elige un modelo</p>
                    <div
                      class="mt-2 flex gap-2 overflow-x-auto pb-1"
                      role="group"
                      aria-label="Modelos disponibles"
                    >
                      @for (modelo of modelos(); track modelo.id; let i = $index) {
                        <button
                          type="button"
                          (click)="elegir(i)"
                          [attr.aria-pressed]="i === indice()"
                          [class]="chip(i)"
                        >
                          {{ modelo.nombre }}
                        </button>
                      }
                    </div>
                  </div>
                }

                <p
                  class="text-3xl font-bold md:text-4xl"
                  [class.text-gold-300]="esCup()"
                  [class.text-navy-300]="!esCup()"
                >
                  {{ precio().valor }} {{ precio().moneda }}
                </p>

                @if (atributos().length) {
                  <dl
                    class="grid gap-x-6 rounded-xl border border-navy-800 bg-navy-900/60 p-4 sm:grid-cols-2"
                  >
                    @for (atributo of atributos(); track atributo.etiqueta) {
                      <div
                        class="flex justify-between gap-3 border-b border-navy-800/60 py-2 last:border-0"
                      >
                        <dt class="text-sm text-navy-300">{{ atributo.etiqueta }}</dt>
                        <dd class="text-right text-sm font-medium text-white">
                          {{ atributo.valor }}
                        </dd>
                      </div>
                    }
                  </dl>
                }

                <a
                  [href]="enlaceWhatsapp()"
                  target="_blank"
                  rel="noopener"
                  class="inline-flex items-center justify-center gap-2 rounded-md bg-gold-300 px-6 py-3 font-semibold text-navy-950 transition-colors hover:bg-gold-400"
                >
                  <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path
                      d="M19.05 4.91A9.816 9.816 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91c0-2.65-1.03-5.14-2.9-7.01z"
                    />
                  </svg>
                  Preguntar por WhatsApp
                </a>

                <p class="text-xs text-navy-400">
                  Escríbenos y confirmamos el precio y la disponibilidad antes de
                  la entrega.
                </p>
              </div>
            </div>

            <!-- En móvil la lista hace de tabla comparativa: los precios de todos
                 a la vista, sin tener que ir picando chip a chip. -->
            @if (modelos().length > 1) {
              <div class="mt-10">
                <h2 class="text-lg font-semibold text-white">
                  Modelos de {{ publicacion.nombre }}
                </h2>
                <ul class="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  @for (modelo of modelos(); track modelo.id; let i = $index) {
                    <li>
                      <button
                        type="button"
                        (click)="elegir(i)"
                        [attr.aria-pressed]="i === indice()"
                        [class]="carta(i)"
                      >
                        <span class="block font-semibold text-white">
                          {{ modelo.nombre }}
                        </span>
                        <span class="mt-1 block text-sm font-bold text-navy-200">
                          {{ modelo.precio }} {{ modelo.moneda }}
                        </span>
                        @if (resumen(modelo)) {
                          <span class="mt-2 block text-xs text-navy-300">
                            {{ resumen(modelo) }}
                          </span>
                        }
                      </button>
                    </li>
                  }
                </ul>
              </div>
            }
          </div>
        } @else {
          <div class="container-adc mt-6">
            <p class="text-lg font-semibold text-white">
              Este producto ya no está publicado.
            </p>
            <p class="mt-2 text-navy-300">
              Puede que lo hayamos quitado de la tienda o que el enlace esté mal
              escrito.
            </p>
            <a
              routerLink="/tienda"
              class="mt-4 inline-block rounded-md bg-gold-300 px-5 py-2 font-semibold text-navy-950 transition-colors hover:bg-gold-400"
            >
              Ver la tienda
            </a>
          </div>
        }
      }
    </section>
  `,
})
export class ProductoDetallePageComponent {
  readonly productos = inject(ProductosService);

  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  /** El id de la URL, o `null` mientras no se haya leído. */
  readonly id = signal<number | null>(null);

  /** Qué modelo está seleccionado, por posición en la lista del servidor. */
  readonly indice = signal(0);

  private readonly imagenFallida = signal(false);

  constructor() {
    // De `/producto/5` a `/producto/6` el router reutiliza el componente y solo
    // cambian los parámetros: la selección y la foto de antes no valen para el
    // producto nuevo.
    this.route.paramMap
      .pipe(
        map((paramMap) => Number(paramMap.get('id'))),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((id) => {
        this.id.set(Number.isFinite(id) ? id : null);
        this.indice.set(0);
        this.imagenFallida.set(false);
      });

    const seo = inject(SeoService);
    this.productos.cargar();

    effect(() => {
      const publicacion = this.producto();
      const modelos = this.modelos();

      seo.fijar({
        titulo: publicacion ? `${publicacion.nombre} · ADC` : 'Producto · ADC',
        descripcion: publicacion
          ? `${publicacion.nombre}${
              modelos.length > 1 ? `: ${modelos.length} modelos con su precio y sus características` : ''
            }. Material eléctrico con entrega.`
          : 'Producto no disponible en la tienda de ADC.',
        ruta: `/producto/${this.id() ?? ''}`,
        imagen: publicacion?.imagen_url ?? `${URL_SITIO}/assets/images/hero.jpg`,
        jsonLd: publicacion
          ? {
              '@context': 'https://schema.org',
              '@type': 'Product',
              name: publicacion.nombre,
              // Sin modelos es una sola oferta; con ellos, una por variante, que
              // es como Google lee un producto con capacidades distintas.
              offers: modelos.length
                ? modelos.map((modelo) => ({
                    '@type': 'Offer',
                    name: modelo.nombre,
                    price: modelo.precio,
                    priceCurrency: modelo.moneda,
                  }))
                : {
                    '@type': 'Offer',
                    price: publicacion.precio,
                    priceCurrency: publicacion.moneda,
                  },
            }
          : undefined,
      });
    });
  }

  /** La publicación buscada por id, en el catálogo que ya está en memoria. */
  readonly producto = computed(() => {
    const catalogo = this.productos.catalogo();
    const id = this.id();

    if (!catalogo || id === null) return null;

    return todosLosProductos(catalogo).find((producto) => producto.id === id) ?? null;
  });

  readonly modelos = computed<Modelo[]>(() => this.producto()?.modelos ?? []);

  /**
   * El modelo seleccionado. Se cae al primero si la lista se quedó corta (un
   * catálogo refrescado, un modelo borrado desde el panel) con el índice atrás.
   */
  readonly modelo = computed<Modelo | null>(() => {
    const lista = this.modelos();
    if (!lista.length) return null;

    return lista[Math.min(this.indice(), lista.length - 1)] ?? lista[0];
  });

  readonly precio = computed(() => {
    const modelo = this.modelo();
    if (modelo) return { valor: modelo.precio, moneda: modelo.moneda };

    const publicacion = this.producto();

    return { valor: publicacion?.precio ?? 0, moneda: publicacion?.moneda ?? 'CUP' };
  });

  /** CUP dorado, lo demás azul del logo — el mismo reparto que en las tarjetas. */
  readonly esCup = computed(() => this.precio().moneda === 'CUP');

  readonly atributos = computed(() => this.modelo()?.atributos ?? []);

  readonly imagenActiva = computed(
    () => this.modelo()?.imagen_url ?? this.producto()?.imagen_url ?? null,
  );

  readonly mostrarImagen = computed(
    () => Boolean(this.imagenActiva()) && !this.imagenFallida(),
  );

  /** El `alt` de la foto: si es la de un modelo, que lo diga. */
  readonly nombreDeFoto = computed(() => {
    const publicacion = this.producto();
    const modelo = this.modelo();

    if (!publicacion) return '';

    return modelo ? `${publicacion.nombre} — ${modelo.nombre}` : publicacion.nombre;
  });

  /**
   * El mensaje de WhatsApp ya escrito, con el modelo y el precio que se están
   * mirando: quien recibe no tiene que preguntar de qué habló el cliente.
   */
  readonly enlaceWhatsapp = computed(() => {
    const publicacion = this.producto();

    if (!publicacion) return `https://wa.me/${NUMERO_WHATSAPP}`;

    const modelo = this.modelo();
    const { valor, moneda } = this.precio();
    const texto =
      `Hola, me interesa ${publicacion.nombre}` +
      (modelo ? ` — ${modelo.nombre}` : '') +
      ` (${valor} ${moneda}). ¿Tienen disponibilidad?`;

    return `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(texto)}`;
  });

  elegir(indice: number): void {
    this.indice.set(indice);
    // Otro modelo puede tener otra foto: se vuelve a intentar si había fallado.
    this.imagenFallida.set(false);
  }

  chip(indice: number): string {
    return indice === this.indice() ? CHIP_ELEGIDO : CHIP_OTRO;
  }

  carta(indice: number): string {
    return indice === this.indice() ? CARTA_ELEGIDA : CARTA_OTRA;
  }

  /** Dos características en una línea, para comparar modelos de un vistazo. */
  resumen(modelo: Modelo): string {
    return modelo.atributos
      .slice(0, 2)
      .map((atributo) => `${atributo.etiqueta}: ${atributo.valor}`)
      .join(' · ');
  }

  sustituirPorPlaceholder(): void {
    this.imagenFallida.set(true);
  }
}
