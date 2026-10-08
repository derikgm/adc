import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { HeaderComponent } from './header.component';

describe('Header', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [provideRouter([])],
    });
  });

  afterEach(() => TestBed.resetTestingModule());

  it('abre y cierra el menú móvil, con aria-label y aria-controls dinámicos', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();

    const raiz: HTMLElement = fixture.nativeElement;
    const boton: HTMLButtonElement | null = raiz.querySelector('button');
    expect(boton).toBeTruthy();
    expect(boton!.getAttribute('aria-label')).toBe('Abrir menú');
    expect(boton!.getAttribute('aria-expanded')).toBe('false');

    // Abrir: el menú se pinta, el botón cambia de etiqueta y apunta al panel.
    boton!.click();
    fixture.detectChanges();

    expect(boton!.getAttribute('aria-label')).toBe('Cerrar menú');
    expect(boton!.getAttribute('aria-expanded')).toBe('true');
    expect(boton!.getAttribute('aria-controls')).toBe('menu-movil');

    const menu: HTMLElement | null = raiz.querySelector('nav#menu-movil');
    expect(menu).toBeTruthy();
    expect(menu!.tagName.toLowerCase()).toBe('nav');
    expect(menu!.getAttribute('aria-label')).toBe('Menú móvil');
    expect(menu!.textContent).toContain('Servicios');

    // Cerrar: el panel desaparece y el botón vuelve a «Abrir menú».
    boton!.click();
    fixture.detectChanges();

    expect(raiz.querySelector('nav#menu-movil')).toBeNull();
    expect(boton!.getAttribute('aria-label')).toBe('Abrir menú');
    expect(boton!.getAttribute('aria-expanded')).toBe('false');
  });

  it('Escape cierra el menú móvil', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();

    const boton: HTMLButtonElement | null =
      fixture.nativeElement.querySelector('button');
    boton!.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('nav#menu-movil')).toBeTruthy();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('nav#menu-movil')).toBeNull();
  });
});