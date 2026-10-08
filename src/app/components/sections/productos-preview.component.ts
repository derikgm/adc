import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CargandoComponent } from '../cargando.component';
import { EstadoCatalogoComponent } from '../estado-catalogo.component';
import { ProductoCardComponent } from '../producto-card.component';
import { ProductosService } from '../../services/productos.service';

/** Cuántos productos se enseñan en el home antes de entrar a la tienda. */
const VISTA_PREVIA = 5;

/**
 * Vista previa de la tienda en el home (section#tienda): los 5 primeros
 * productos de todo el catálogo y un botón que lleva directo a `/tienda`.
 */
@Component({
  selector: 'app-productos-preview',
  standalone: true,
  imports: [RouterLink, CargandoComponent, EstadoCatalogoComponent, ProductoCardComponent],
  template: `
    <section id="tienda" class="scroll-mt-16 bg-navy-950 py-20">
      <div class="container-adc">
        <div class="mb-10 text-center">
          <p
            class="mb-3 inline-block rounded-full border border-gold-500/40 px-4 py-1 text-xs font-semibold tracking-widest text-gold-300 uppercase"
          >
            Tienda
          </p>
          <h2 class="text-3xl font-bold text-white md:text-4xl">
            Productos
          </h2>
          <p class="mx-auto mt-3 max-w-2xl text-navy-200">
            Un vistazo a lo que tenemos disponible. En la tienda completa
            encontrarás todos los productos, agrupados por secciones.
          </p>
        </div>

        @if (productos.cargando()) {
          <app-cargando />
        } @else if (productos.error()) {
          <app-estado-catalogo
            [error]="productos.error()"
            (reintentar)="productos.cargar()"
          />
        } @else if (vistaPrevia().length) {
          <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            @for (producto of vistaPrevia(); track producto.id) {
              <app-producto-card [producto]="producto" />
            }
          </div>
        } @else {
          <app-estado-catalogo [vacio]="true" />
        }

        <div class="mt-10 text-center">
          <a
            routerLink="/tienda"
            class="inline-block rounded-md bg-gold-300 px-6 py-3 font-semibold text-navy-950 transition-colors hover:bg-gold-400"
          >
            Ver toda la tienda
          </a>
        </div>
      </div>
    </section>
  `,
})
export class ProductosPreviewComponent {
  readonly productos = inject(ProductosService);

  readonly vistaPrevia = computed(() =>
    this.productos.primerosProductos(VISTA_PREVIA),
  );

  constructor() {
    this.productos.cargar();
  }
}
