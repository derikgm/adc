import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="bg-ink text-navy-200">
      <div
        class="container-adc flex flex-col items-center justify-between gap-4 py-8 sm:flex-row"
      >
        <div class="flex items-center gap-3">
          <img
            src="assets/images/logo.jpg"
            alt="ADC"
            class="h-9 w-9 rounded object-contain"
          />
          <span class="text-lg font-bold text-white">ADC</span>
        </div>

        <p class="text-sm text-navy-400">
          © {{ currentYear }} ADC. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
