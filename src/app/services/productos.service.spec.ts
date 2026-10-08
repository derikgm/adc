import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { timeoutInterceptor } from '../interceptors/timeout.interceptor';
import { ProductosService, SERVIDOR } from './productos.service';

describe('ProductosService', () => {
  let service: ProductosService;
  let http: HttpTestingController;

  beforeEach(() => {
    // Vitest ejecuta los ficheros en el mismo proceso: limpiamos el TestBed
    // hermanado antes de montar el nuestro.
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        // Igual que en app.config.ts: el interceptor de 30 s va en todas las
        // peticiones, así que los tests lo deben llevar también.
        provideHttpClient(withInterceptors([timeoutInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(ProductosService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('ante un 404 enseña el error y no se cuela el catálogo de Delys', () => {
    service.cargar();
    expect(service.cargando()).toBe(true);

    http
      .expectOne(`${SERVIDOR}/adc/productos`)
      .flush({ message: 'Not Found' }, { status: 404, statusText: 'Not Found' });

    // Ya no existe el respaldo a /delys/dulces: el endpoint de ADC está
    // programado, y enseñar productos de otro negocio es peor que un error.
    http.expectNone(`${SERVIDOR}/delys/dulces`);

    expect(service.cargando()).toBe(false);
    expect(service.error()).toBe('No se pudieron obtener los datos del servidor.');
    expect(service.primerosProductos(5).length).toBe(0);
  });

  it('propaga el error, avisa y deja reintentar', () => {
    service.cargar();
    http
      .expectOne(`${SERVIDOR}/adc/productos`)
      .flush('boom', { status: 500, statusText: 'Server Error' });

    expect(service.cargando()).toBe(false);
    expect(service.error()).toBe('No se pudieron obtener los datos del servidor.');

    service.cargar();
    http.expectOne(`${SERVIDOR}/adc/productos`);
  });

  it('la segunda vista no vuelve a pedir nada (el catálogo es fresco)', () => {
    service.cargar();
    http
      .expectOne(`${SERVIDOR}/adc/productos`)
      .flush({
        secciones: [{ id: 1, nombre: 'luz' }],
        productos: [
          {
            id: 2,
            nombre: 'Foco',
            precio: 10,
            moneda: 'USD',
            imagen_url: null,
            seccion: 'luz',
            seccion_id: 1,
          },
        ],
      });

    expect(service.cargando()).toBe(false);
    service.cargar();
    http.expectNone(`${SERVIDOR}/adc/productos`);
    expect(service.primerosProductos(5)[0].moneda).toBe('USD');
  });

  it('pasado un minuto, la próxima llamada vuelve a pedir el catálogo', () => {
    vi.useFakeTimers();
    try {
      service.cargar();
      http.expectOne(`${SERVIDOR}/adc/productos`).flush({
        secciones: [{ id: 1, nombre: 'luz' }],
        productos: [
          {
            id: 2,
            nombre: 'Foco',
            precio: 10,
            moneda: 'USD',
            imagen_url: null,
            seccion: 'luz',
            seccion_id: 1,
          },
        ],
      });

      // Recién cargado: aún fresco, no se vuelve a pedir.
      service.cargar();
      http.expectNone(`${SERVIDOR}/adc/productos`);

      // Con el TTL (60 s) superado, la llamada sí refresca.
      vi.advanceTimersByTime(60_001);
      service.cargar();
      expect(service.cargando()).toBe(true);
      http
        .expectOne(`${SERVIDOR}/adc/productos`)
        .flush({
          secciones: [{ id: 1, nombre: 'luz' }],
          productos: [
            {
              id: 3,
              nombre: 'Foco LED',
              precio: 12,
              moneda: 'CUP',
              imagen_url: null,
              seccion: 'luz',
              seccion_id: 1,
            },
          ],
        });

      expect(service.cargando()).toBe(false);
      expect(service.primerosProductos(5)[0].nombre).toBe('Foco LED');
    } finally {
      vi.useRealTimers();
    }
  });

  it('corta la petición a los 30 segundos y lo cuenta en el mensaje', () => {
    vi.useFakeTimers();
    try {
      service.cargar();
      http.expectOne(`${SERVIDOR}/adc/productos`);

      vi.advanceTimersByTime(30_000);

      expect(service.cargando()).toBe(false);
      expect(service.error()).toBe(
        'El servidor tardó más de 30 segundos en responder. Inténtalo de nuevo.',
      );
    } finally {
      vi.useRealTimers();
    }
  });
});
