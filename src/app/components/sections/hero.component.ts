import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section id="inicio" class="bg-ink">
      <div
        class="container-adc grid gap-10 py-16 md:grid-cols-5 md:items-center md:gap-14 md:py-24"
      >
        <!-- Información: 2 de 5 columnas (40 %) -->
        <div class="md:col-span-2">
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
              routerLink="/tienda"
              class="rounded-md border border-navy-700 px-6 py-3 font-semibold text-white transition-colors hover:border-gold-300 hover:text-gold-300"
            >
              Ir a la tienda
            </a>
          </div>
        </div>

        <!-- Foto: 3 de 5 columnas (60 %). La foto es muy clara y brillante, así
             que dos degradados la funden con el fondo negro del hero por el borde
             que toca el texto y por abajo. No usar mix-blend-mode (ver styles.css). -->
        <div class="md:col-span-3">
          <div
            class="relative overflow-hidden rounded-2xl border border-navy-800"
          >
            <img
              src="assets/images/hero.jpg"
              alt="Instalación eléctrica de ADC"
              width="1920"
              height="1440"
              fetchpriority="high"
              class="aspect-[4/3] w-full object-cover"
            />
            <div
              class="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink via-ink/20 to-transparent"
            ></div>
            <div
              class="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent"
            ></div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class HeroComponent {}
