import { Component } from '@angular/core';

@Component({
  selector: 'app-servicios',
  standalone: true,
  template: `
    <section id="servicios" class="bg-navy-950 py-20">
      <div class="container-adc">
        <div class="mb-10 text-center">
          <p
            class="mb-3 inline-block rounded-full border border-gold-500/40 px-4 py-1 text-xs font-semibold tracking-widest text-gold-300 uppercase"
          >
            ¿Qué hacemos?
          </p>
          <h2 class="text-3xl font-bold text-white md:text-4xl">
            Servicios
          </h2>
          <p class="mx-auto mt-3 max-w-2xl text-navy-200">
            Ofrecemos soluciones integrales en el ámbito eléctrico: desde el
            suministro de material eléctrico certificado hasta la ejecución y el
            mantenimiento de instalaciones eléctricas.
          </p>
        </div>

        <div class="grid gap-6 md:grid-cols-3">
          <article
            class="rounded-xl border border-navy-800 bg-navy-900/60 p-6 shadow-lg"
          >
            <h3 class="text-xl font-semibold text-white">Instalaciones eléctricas</h3>
            <p class="mt-2 text-navy-200">
              Diseño, montaje y puesta en marcha de instalaciones eléctricas
              residenciales, comerciales e industriales, cumpliendo con las
              normas de seguridad vigentes.
            </p>
          </article>

          <article
            class="rounded-xl border border-navy-800 bg-navy-900/60 p-6 shadow-lg"
          >
            <h3 class="text-xl font-semibold text-white">Brigada de montaje</h3>
            <p class="mt-2 text-navy-200">
              Brigada especializada para el montaje de paneles, tableros,
              cableado, canalizaciones y acometidas, con personal técnico
              cualificado y garantía de trabajo.
            </p>
          </article>

          <article
            class="rounded-xl border border-navy-800 bg-navy-900/60 p-6 shadow-lg"
          >
            <h3 class="text-xl font-semibold text-white">
              Mantenimiento y reparaciones
            </h3>
            <p class="mt-2 text-navy-200">
              Mantenimiento preventivo y correctivo, diagnóstico de averías,
              actualización de tableros y sustitución de elementos, para
              garantizar el correcto funcionamiento de su instalación.
            </p>
          </article>
        </div>

        <div class="mt-10 grid gap-6 md:grid-cols-2">
          <article
            class="rounded-xl border border-navy-800 bg-navy-900/60 p-6 shadow-lg"
          >
            <h3 class="text-xl font-semibold text-white">
              Suministro de material eléctrico
            </h3>
            <p class="mt-2 text-navy-200">
              Proveemos material eléctrico de calidad para obras, reparaciones y
              proyectos: cables, canalizaciones, accesorios, tableros,
              dispositivos de protección y más.
            </p>
          </article>

          <article
            class="rounded-xl border border-navy-800 bg-navy-900/60 p-6 shadow-lg"
          >
            <h3 class="text-xl font-semibold text-white">
              Kits y soluciones a medida
            </h3>
            <p class="mt-2 text-navy-200">
              Kits completos para su proyecto, asesoría técnica y soluciones
              adaptadas a sus necesidades, con presupuesto claro y sin sorpresas.
            </p>
          </article>
        </div>
      </div>
    </section>
  `,
})
export class ServiciosComponent {}
