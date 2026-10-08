import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { HeroComponent } from './hero.component';

describe('Hero', () => {
  beforeEach(() => {
    // Vitest ejecuta los ficheros en el mismo proceso: limpiamos el TestBed
    // hermanado antes de montar el nuestro.
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HeroComponent],
      providers: [provideRouter([])],
    });
  });

  afterEach(() => TestBed.resetTestingModule());

  it('usa hero.jpg como fondo de toda la sección', () => {
    const fixture = TestBed.createComponent(HeroComponent);
    fixture.detectChanges();

    const seccion: HTMLElement = fixture.nativeElement.querySelector('section');
    expect(seccion.className).toContain('relative');
    expect(seccion.className).toContain('overflow-hidden');
    // Offset tras el header fijo de 64 px (accesibilidad A-7).
    expect(seccion.className).toContain('scroll-mt-16');

    const foto: HTMLImageElement | null = seccion.querySelector(':scope > img');
    expect(foto).toBeTruthy();
    expect(foto!.getAttribute('src')).toBe('assets/images/hero.jpg');
    // Cubre la sección entera, sin contenedor propio ni ratio fijo.
    expect(foto!.className).toContain('absolute inset-0');
    expect(foto!.className).toContain('object-cover');
    expect(foto!.className).not.toContain('aspect-');
    // Decorativa: no debe leerse por pantalla.
    expect(foto!.getAttribute('alt')).toBe('');
    expect(foto!.getAttribute('aria-hidden')).toBe('true');

    // Velo para que el texto se lea sobre la foto tan clara.
    const velo: HTMLElement | null = seccion.querySelector(
      ':scope > div.absolute',
    );
    expect(velo).toBeTruthy();
    expect(velo!.className).toContain('bg-gradient-to-t');
  });

  it('pone la información a la derecha, con fondo medio negro y sus botones', () => {
    const fixture = TestBed.createComponent(HeroComponent);
    fixture.detectChanges();

    const contenedor: HTMLElement | null =
      fixture.nativeElement.querySelector('.justify-end');
    expect(contenedor).toBeTruthy();

    const panel = contenedor!.firstElementChild as HTMLElement;
    expect(panel.className).toContain('bg-ink/75');
    expect(panel.className).toContain('max-w-xl');
    expect(panel.textContent).toContain('ADC');
    expect(panel.textContent).toContain('Ver instalaciones');
    expect(panel.textContent).toContain('Ir a la tienda');

    const enlaces = [...panel.querySelectorAll('a')].map(
      (a) => a.getAttribute('href') ?? '',
    );
    expect(enlaces).toContain('#instalaciones');
    expect(enlaces).toContain('/tienda');
  });
});
