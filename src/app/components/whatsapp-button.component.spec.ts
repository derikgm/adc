import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { HeaderComponent } from './header.component';
import { WhatsappButtonComponent } from './whatsapp-button.component';

describe('Botón flotante de WhatsApp', () => {
  beforeEach(() => {
    // Vitest ejecuta los ficheros en el mismo proceso: limpiamos el TestBed
    // hermanado antes de montar el nuestro.
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [WhatsappButtonComponent, HeaderComponent],
      providers: [provideRouter([])],
    });
  });

  afterEach(() => TestBed.resetTestingModule());

  it('abre WhatsApp con el número 59061926 en una pestaña nueva', () => {
    const fixture = TestBed.createComponent(WhatsappButtonComponent);
    fixture.detectChanges();

    const enlace: HTMLAnchorElement | null =
      fixture.nativeElement.querySelector('a');
    expect(enlace).toBeTruthy();
    expect(enlace!.getAttribute('href')).toBe('https://wa.me/59061926');
    expect(enlace!.getAttribute('target')).toBe('_blank');
    expect(enlace!.getAttribute('rel')).toContain('noopener');
    // Colores de la web, no el verde de WhatsApp.
    expect(enlace!.className).toContain('bg-gold-300');
    expect(enlace!.className).not.toContain('green');
    expect(enlace!.className).toContain('fixed');
  });

  it('el header ya no enseña el botón «Cotizar»', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();

    const raiz: HTMLElement = fixture.nativeElement;
    expect(raiz.textContent).not.toContain('Cotizar');
    // El menú sigue completo.
    for (const etiqueta of ['Inicio', 'Tienda', 'Servicios', 'Instalaciones', 'Contacto']) {
      expect(raiz.textContent).toContain(etiqueta);
    }
  });
});
