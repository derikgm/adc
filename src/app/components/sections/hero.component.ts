import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section id="inicio" class="relative overflow-hidden bg-ink">
      <!-- La foto es el fondo de toda la sección (decorativa: el texto ya
           cuenta qué se ve). object-center deja a los operarios en cuadro
           tanto en pantalla ancha como en móvil. -->
      <img
        src="assets/images/hero.jpg"
        alt=""
        aria-hidden="true"
        width="1920"
        height="1440"
        fetchpriority="high"
        class="absolute inset-0 h-full w-full object-cover object-center"
      />

      <!-- Velo: la foto es muy clara (cielo blanco) y el texto tiene que
           leerse. Abajo queda más oscuro para fundir con la sección
           siguiente. -->
      <div
        class="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/40 to-ink/30"
      ></div>

      <!-- Información: contenedor a la derecha, encima de la foto y con fondo
           medio negro para que no se pierda en el brillo. -->
      <div class="container-adc relative flex justify-end py-16 md:py-24">
        <div
          class="w-full max-w-xl rounded-2xl border border-navy-800/70 bg-ink/75 p-7 shadow-2xl backdrop-blur-sm md:p-9"
        >
          <p
            class="mb-4 inline-block rounded-full border border-gold-500/40 px-4 py-1 text-xs font-semibold tracking-widest text-gold-300 uppercase"
          >
            Artículos y servicios eléctricos
          </p>
          <h1 class="text-4xl leading-tight font-bold text-white md:text-5xl">
            ADC
          </h1>
          <p class="mt-4 max-w-md text-lg text-navy-200">
            Suministro de material eléctrico, instalación de paneles y montaje de kits completos
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
      </div>
    </section>
  `,
})
export class HeroComponent {}
