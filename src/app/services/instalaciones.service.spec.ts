import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { timeoutInterceptor } from '../interceptors/timeout.interceptor';
import { InstalacionesService } from './instalaciones.service';
import { SERVIDOR } from './productos.service';

describe('InstalacionesService', () => {
  let service: InstalacionesService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([timeoutInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(InstalacionesService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('carga las instalaciones y las deja normalizadas', () => {
    service.cargar();
    expect(service.cargando()).toBe(true);

    http.expectOne(`${SERVIDOR}/adc/instalaciones`).flush({
      instalaciones: [
        {
          id: 1,
          nombre_servicio: 'Paneles solares',
          precio: 3000,
          moneda: 'CUP',
          imagen_url: null,
          descripcion: ['Instalación rápida'],
        },
      ],
    });

    expect(service.cargando()).toBe(false);
    expect(service.error()).toBeNull();
    expect(service.instalaciones()?.[0].nombre_servicio).toBe('Paneles solares');
    expect(service.instalaciones()?.[0].descripcion).toEqual(['Instalación rápida']);
  });

  it('ante un error avisa y deja reintentar', () => {
    service.cargar();
    http
      .expectOne(`${SERVIDOR}/adc/instalaciones`)
      .flush('boom', { status: 500, statusText: 'Server Error' });

    expect(service.cargando()).toBe(false);
    expect(service.error()).toBe(
      'No se pudieron obtener las instalaciones del servidor.',
    );

    service.cargar();
    http.expectOne(`${SERVIDOR}/adc/instalaciones`);
  });

  it('la segunda vista no vuelve a pedir nada (están frescas)', () => {
    service.cargar();
    http
      .expectOne(`${SERVIDOR}/adc/instalaciones`)
      .flush({ instalaciones: [{ id: 1, nombre_servicio: 'Paneles', precio: 1, moneda: 'CUP' }] });

    service.cargar();
    http.expectNone(`${SERVIDOR}/adc/instalaciones`);
    expect(service.instalaciones()?.length).toBe(1);
  });

  it('pasado un minuto, la próxima llamada vuelve a pedirlas', () => {
    vi.useFakeTimers();
    try {
      service.cargar();
      http
        .expectOne(`${SERVIDOR}/adc/instalaciones`)
        .flush({ instalaciones: [{ id: 1, nombre_servicio: 'Paneles', precio: 1, moneda: 'CUP' }] });

      service.cargar();
      http.expectNone(`${SERVIDOR}/adc/instalaciones`);

      vi.advanceTimersByTime(60_001);
      service.cargar();
      expect(service.cargando()).toBe(true);
      http
        .expectOne(`${SERVIDOR}/adc/instalaciones`)
        .flush({ instalaciones: [{ id: 2, nombre_servicio: 'Ecoflow', precio: 2, moneda: 'USD' }] });

      expect(service.instalaciones()?.[0].nombre_servicio).toBe('Ecoflow');
    } finally {
      vi.useRealTimers();
    }
  });
});
