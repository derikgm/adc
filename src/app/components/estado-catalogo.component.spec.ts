import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { EstadoCatalogoComponent } from './estado-catalogo.component';

describe('Estado del catálogo', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [EstadoCatalogoComponent],
    });
  });

  afterEach(() => TestBed.resetTestingModule());

  it('muestra el error con su botón Reintentar y emite el evento', () => {
    const fixture = TestBed.createComponent(EstadoCatalogoComponent);
    fixture.componentRef.setInput('error', 'No se pudo conectar.');
    fixture.detectChanges();

    const raiz: HTMLElement = fixture.nativeElement;
    expect(raiz.textContent).toContain('No se pudo conectar.');

    const boton: HTMLButtonElement | null = raiz.querySelector('button');
    expect(boton).toBeTruthy();
    expect(boton!.textContent).toContain('Reintentar');

    let reintentos = 0;
    fixture.componentInstance.reintentar.subscribe(() => reintentos++);
    boton!.click();
    expect(reintentos).toBe(1);
  });

  it('muestra el aviso de catálogo vacío (sin botón)', () => {
    const fixture = TestBed.createComponent(EstadoCatalogoComponent);
    fixture.componentRef.setInput('vacio', true);
    fixture.detectChanges();

    const raiz: HTMLElement = fixture.nativeElement;
    expect(raiz.textContent).toContain('Todavía no hay productos publicados.');
    expect(raiz.querySelector('button')).toBeNull();
  });

  it('sin error ni vacío no pinta nada', () => {
    const fixture = TestBed.createComponent(EstadoCatalogoComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent?.trim()).toBe('');
  });
});