import { TestBed } from '@angular/core/testing';
import { signal, type WritableSignal } from '@angular/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InstalacionesServiciosComponent } from './instalaciones-servicios.component';
import { InstalacionesService } from '../../services/instalaciones.service';
import type { Instalacion } from '../../models/instalaciones';

/** Una instalación de ejemplo, ya normalizada. */
function instalacion(nombre: string): Instalacion {
  return {
    id: 1,
    nombre_servicio: nombre,
    precio: 3000,
    moneda: 'CUP',
    imagen_url: null,
    descripcion: [],
  };
}

describe('InstalacionesServicios', () => {
  // El servicio real hace peticiones HTTP; aquí basta con sus señales y el
  // espía de `cargar()`, que es lo único que toca el componente.
  let servicio: {
    instalaciones: WritableSignal<Instalacion[] | null>;
    cargando: WritableSignal<boolean>;
    error: WritableSignal<string | null>;
    cargar: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
    servicio = {
      instalaciones: signal<Instalacion[] | null>(null),
      cargando: signal(false),
      error: signal<string | null>(null),
      cargar: vi.fn(),
    };
    TestBed.configureTestingModule({
      imports: [InstalacionesServiciosComponent],
      providers: [{ provide: InstalacionesService, useValue: servicio }],
    });
  });

  afterEach(() => TestBed.resetTestingModule());

  function crear() {
    const fixture = TestBed.createComponent(InstalacionesServiciosComponent);
    fixture.detectChanges();
    return fixture;
  }

  const seccion = (fixture: ReturnType<typeof crear>) =>
    fixture.nativeElement.querySelector('section#instalaciones-servicios') as
      | HTMLElement
      | null;

  it('pide las instalaciones al servidor al montarse', () => {
    crear();

    expect(servicio.cargar).toHaveBeenCalled();
  });

  it('no pinta nada mientras carga (ni spinner ni cabecera)', () => {
    servicio.cargando.set(true);

    const fixture = crear();

    expect(seccion(fixture)).toBeNull();
  });

  it('queda oculta si el servidor no devuelve ninguna instalación', () => {
    servicio.instalaciones.set([]);

    const fixture = crear();

    expect(seccion(fixture)).toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain('Servicios de instalación');
    expect(fixture.nativeElement.textContent).not.toContain('Todavía no hay');
  });

  it('queda oculta si la petición falla', () => {
    servicio.error.set('No se pudieron obtener las instalaciones del servidor.');

    const fixture = crear();

    expect(seccion(fixture)).toBeNull();
  });

  it('se muestra con las instalaciones del servidor', () => {
    servicio.instalaciones.set([instalacion('Paneles solares')]);

    const fixture = crear();
    const caja = seccion(fixture);

    expect(caja).toBeTruthy();
    expect(caja!.textContent).toContain('Servicios de instalación');
    expect(caja!.textContent).toContain('Paneles solares');
  });
});
