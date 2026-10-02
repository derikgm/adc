import { Component } from '@angular/core';

@Component({
  selector: 'app-hero',
  standalone: true,
  template: `
    <section id="inicio" class="bg-ink">
      <div class="container-adc grid gap-12 py-20 md:grid-cols-2 md:items-center md:py-28">
        <div>
          <p
            class="mb-4 inline-block rounded-full border border-gold-500/40 px-4 py-1 text-xs font-semibold tracking-widest text-gold-300 uppercase"
          >
            Artículos y servicios eléctricos
          </p>
          <h1 class="text-4xl leading-tight font-bold text-white md:text-5xl">
            ADC
          </h1>
          <p class="mt-4 max-w-md text-lg text-navy-200">
            Suministro de material eléctrico, instalación de paneles y mantenimiento
            con garantía.
          </p>
          <div class="mt-8 flex flex-wrap gap-3">
            <a
              href="#instalaciones"
              class="rounded-md bg-gold-300 px-6 py-3 font-semibold text-navy-950 transition-colors hover:bg-gold-400"
            >
              Ver instalaciones
            </a>
            <a
              href="#tienda"
              class="rounded-md border border-navy-700 px-6 py-3 font-semibold text-white transition-colors hover:border-gold-300 hover:text-gold-300"
            >
              Ir a la tienda
            </a>
          </div>
        </div>

        <!-- Logo -->
        <div class="flex justify-center">
          <img
            src="assets/images/logo.jpg"
            alt="Logo ADC"
            class="w-full max-w-sm rounded-2xl"
          />
        </div>
      </div>
    </section>
  `,
})
export class HeroComponent {}
