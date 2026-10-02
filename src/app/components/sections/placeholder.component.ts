import { Component, input } from '@angular/core';

@Component({
  selector: 'app-placeholder',
  standalone: true,
  template: `
    <section [id]="id()" class="bg-navy-950 py-20">
      <div class="container-adc text-center">
        <h2 class="text-3xl font-bold text-white">
          {{ title() }}
        </h2>
        <p class="mx-auto mt-3 max-w-lg text-navy-300">
          Sección placeholder. El contenido se agregará más adelante.
        </p>
      </div>
    </section>
  `,
})
export class PlaceholderComponent {
  id = input.required<string>();
  title = input.required<string>();
}
