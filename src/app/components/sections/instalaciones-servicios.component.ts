import { Component, computed, inject } from '@angular/core';
import { InstalacionCardComponent } from '../instalacion-card.component';
import { InstalacionesService } from '../../services/instalaciones.service';

/**
 * Sección «Servicios de instalación» del home: las instalaciones que ofrece ADC
 * (paneles solares, Ecoflow, baterías…) como tarjetas con imagen, precio y su
 * lista de puntos (todo.md, punto 3).
 *
 * Va justo debajo de `app-instalaciones` (la cinta de la brigada), que sigue
 * siendo la que ancla el menú. Aquí los datos salen de `GET /adc/instalaciones`.
 *
 * La sección **no se pinta hasta que el servidor devuelve al menos una
 * instalación**. Si la lista viene vacía o falla la petición, el componente
 * queda oculto entero —cabecera incluida— para no enseñar un hueco vacío al
 * cliente. Por eso aquí no hay spinner ni mensaje de error: mientras se carga
 * (o si no hay nada), se ve como si la sección no existiera.
 */
@Component({
  selector: 'app-instalaciones-servicios',
  standalone: true,
  imports: [InstalacionCardComponent],
  template: `
    @if (hayInstalaciones()) {
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

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            @for (instalacion of lista(); track instalacion.id) {
              <app-instalacion-card [instalacion]="instalacion" />
            }
          </div>
        </div>
      </section>
    }
  `,
})
export class InstalacionesServiciosComponent {
  readonly instalaciones = inject(InstalacionesService);

  /** La lista, ya sin `null`: vacía mientras carga o si no hay ninguna. */
  readonly lista = computed(() => this.instalaciones.instalaciones() ?? []);

  readonly hayInstalaciones = computed(() => this.lista().length > 0);

  constructor() {
    // Intenta traerlas del servidor al montar; si vuelven (o ya están) y hay
    // alguna, el `@if` pinta la sección.
    this.instalaciones.cargar();
  }
}
