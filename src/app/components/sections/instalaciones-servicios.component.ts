import { Component, computed, inject } from '@angular/core';
import { CargandoComponent } from '../cargando.component';
import { EstadoCatalogoComponent } from '../estado-catalogo.component';
import { InstalacionCardComponent } from '../instalacion-card.component';
import { InstalacionesService } from '../../services/instalaciones.service';

/**
 * Sección «Servicios de instalación» del home: las instalaciones que ofrece ADC
 * (paneles solares, Ecoflow, baterías…) como tarjetas con imagen, precio y su
 * lista de puntos (todo.md, punto 3).
 *
 * Va justo debajo de `app-instalaciones` (la cinta de la brigada), que sigue
 * siendo la que ancla el menú. Aquí los datos salen de `GET /adc/instalaciones`.
 */
@Component({
  selector: 'app-instalaciones-servicios',
  standalone: true,
  imports: [CargandoComponent, EstadoCatalogoComponent, InstalacionCardComponent],
  template: `
    <!-- Mismo fondo que app-instalaciones para que las dos se lean como una
         sola: primero la brigada y, debajo, los servicios que ofrece. -->
    <section id="instalaciones-servicios" class="scroll-mt-16 bg-navy-900 py-20">
      <div class="container-adc">
        <div class="mb-10 text-center">
          <p
            class="mb-3 inline-block rounded-full border border-gold-500/40 px-4 py-1 text-xs font-semibold tracking-widest text-gold-300 uppercase"
          >
            Instalaciones
          </p>
          <h2 class="text-3xl font-bold text-white md:text-4xl">
            Servicios de instalación
          </h2>
          <p class="mx-auto mt-3 max-w-2xl text-navy-200">
            Lo que instalamos, con su precio a la vista. Pídelo por WhatsApp y
            coordinamos la visita.
          </p>
        </div>

        @if (instalaciones.cargando()) {
          <app-cargando />
        } @else if (instalaciones.error()) {
          <app-estado-catalogo
            [error]="instalaciones.error()"
            (reintentar)="instalaciones.cargar()"
          />
        } @else if (hayInstalaciones()) {
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            @for (instalacion of instalaciones.instalaciones(); track instalacion.id) {
              <app-instalacion-card [instalacion]="instalacion" />
            }
          </div>
        } @else {
          <p class="py-8 text-center text-navy-300">
            Todavía no hay instalaciones publicadas.
          </p>
        }
      </div>
    </section>
  `,
})
export class InstalacionesServiciosComponent {
  readonly instalaciones = inject(InstalacionesService);

  readonly hayInstalaciones = computed(
    () => (this.instalaciones.instalaciones()?.length ?? 0) > 0,
  );

  constructor() {
    this.instalaciones.cargar();
  }
}
