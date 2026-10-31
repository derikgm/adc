import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { timeoutInterceptor } from '../interceptors/timeout.interceptor';
import { ProductosPreviewComponent } from '../components/sections/productos-preview.component';
import { SERVIDOR } from '../services/productos.service';
import { TiendaPageComponent } from './tienda.page';

describe('Vistas de la tienda', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    // Vitest ejecuta los ficheros en el mismo proceso: limpiamos el TestBed
    // hermanado antes de montar el nuestro.
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [ProductosPreviewComponent, TiendaPageComponent],
      providers: [
        // Router a secas: las vistas usan routerLink (los tests no enrutan).
        provideRouter([]),
        provideHttpClient(withInterceptors([timeoutInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  /** Responde a /adc/productos con 7 productos repartidos en 2 secciones. */
  function responderConSieteProductos() {
    http.expectOne(`${SERVIDOR}/adc/productos`).flush({
      secciones: [
        { id: 1, nombre: 'equipos' },
        { id: 2, nombre: 'aseo' },
      ],
      productos: [
        { id: 1, nombre: 'Taladro percutor', precio: 3000, imagen_url: 'a.jpg', moneda: 'CUP', seccion: 'equipos', seccion_id: 1 },
        { id: 2, nombre: 'Compresor', precio: 20, imagen_url: null, moneda: 'USD', seccion: 'equipos', seccion_id: 1 },
        { id: 3, nombre: 'Amperímetro', precio: 15, imagen_url: null, moneda: 'CUP', seccion: 'equipos', seccion_id: 1 },
        { id: 4, nombre: 'Pinza amperométrica', precio: 25, imagen_url: null, moneda: 'USD', seccion: 'equipos', seccion_id: 1 },
        { id: 5, nombre: 'Cable calibre 10', precio: 90, imagen_url: null, moneda: 'CUP', seccion: 'equipos', seccion_id: 1 },
        { id: 6, nombre: 'Termomagnética', precio: 12, imagen_url: null, moneda: 'USD', seccion: 'equipos', seccion_id: 1 },
        { id: 7, nombre: 'Extintor', precio: 8, imagen_url: null, moneda: 'USD', seccion: 'aseo', seccion_id: 2 },
      ],
    });
  }

  it('la vista previa del home enseña 5 productos y el botón a /tienda', () => {
    const fixture = TestBed.createComponent(ProductosPreviewComponent);
    fixture.detectChanges();
    responderConSieteProductos();
    fixture.detectChanges();

    const raiz: HTMLElement = fixture.nativeElement;
    expect(raiz.querySelectorAll('app-producto-card').length).toBe(5);
    expect(raiz.textContent).toContain('Taladro percutor');
    expect(raiz.textContent).toContain('3000 CUP');
    expect(raiz.textContent).toContain('20 USD');
    expect(raiz.querySelector('a[href="/tienda"]')).toBeTruthy();
  });

  it('la página /tienda muestra spinner, secciones y precios con moneda', () => {
    const fixture = TestBed.createComponent(TiendaPageComponent);
    fixture.detectChanges();

    const raiz: HTMLElement = fixture.nativeElement;
    expect(raiz.querySelector('app-cargando')).toBeTruthy();
    expect(raiz.textContent).toContain('Obteniendo datos del servidor');

    responderConSieteProductos();
    fixture.detectChanges();

    expect(raiz.querySelector('app-cargando')).toBeNull();
    expect(raiz.querySelectorAll('app-producto-card').length).toBe(7);
    expect(
      [...raiz.querySelectorAll('h2')].map((h) => h.textContent?.trim()),
    ).toEqual(['equipos', 'aseo']);

    // Los chips usan el router con fragment, como el header, y el ancla lleva
    // el id del servidor para que dos nombres que se normalizan igual
    // («Aseo»/«aseo») no colisionen.
    const chipEquipos = raiz.querySelector(
      'nav a[href="/tienda#seccion-equipos-1"]',
    );
    expect(chipEquipos).toBeTruthy();
    // Sin ancla nativa: ya no queda ningún href="#seccion-…".
    expect(raiz.querySelector('nav a[href="#seccion-equipos"]')).toBeNull();
    expect(raiz.querySelector('[id="seccion-equipos-1"]')).toBeTruthy();
    expect(raiz.querySelector('[id="seccion-aseo-2"]')).toBeTruthy();

    expect(raiz.textContent).toContain('Extintor');
    expect(raiz.textContent).toContain('8 USD');
  });

  it('agrupa al final los productos sin sección y no pinta secciones vacías', () => {
    const fixture = TestBed.createComponent(TiendaPageComponent);
    fixture.detectChanges();

    http.expectOne(`${SERVIDOR}/adc/productos`).flush({
      secciones: [
        { id: 1, nombre: 'equipos' },
        { id: 3, nombre: 'vacia' },
      ],
      productos: [
        {
          id: 1,
          nombre: 'Taladro',
          precio: 3000,
          imagen_url: null,
          moneda: 'CUP',
          seccion: 'equipos',
          seccion_id: 1,
        },
        {
          id: 9,
          nombre: 'Sin clasificar',
          precio: 5,
          imagen_url: null,
          moneda: 'CUP',
          seccion: null,
          seccion_id: null,
        },
      ],
    });
    fixture.detectChanges();

    const raiz: HTMLElement = fixture.nativeElement;
    expect(
      [...raiz.querySelectorAll('h2')].map((h) => h.textContent?.trim()),
    ).toEqual(['equipos', 'Sin sección']);
    expect(raiz.textContent).toContain('Sin clasificar');
  });

  it('pinta las subcategorías anidadas dentro de su categoría principal', () => {
    const fixture = TestBed.createComponent(TiendaPageComponent);
    fixture.detectChanges();

    http.expectOne(`${SERVIDOR}/adc/productos`).flush({
      secciones: [
        { id: 1, nombre: 'electronico', padre_id: null },
        { id: 2, nombre: 'neveras', padre_id: 1 },
        { id: 3, nombre: 'ventiladores', padre_id: 1 },
        { id: 4, nombre: 'aseo', padre_id: null },
      ],
      productos: [
        { id: 1, nombre: 'Cable', precio: 5, imagen_url: null, moneda: 'CUP', seccion: 'electronico', seccion_id: 1 },
        { id: 2, nombre: 'Nevera No Frost', precio: 900, imagen_url: null, moneda: 'CUP', seccion: 'neveras', seccion_id: 2 },
        { id: 3, nombre: 'Ventilador', precio: 20, imagen_url: null, moneda: 'USD', seccion: 'ventiladores', seccion_id: 3 },
        { id: 4, nombre: 'Extintor', precio: 8, imagen_url: null, moneda: 'USD', seccion: 'aseo', seccion_id: 4 },
      ],
    });
    fixture.detectChanges();

    const raiz: HTMLElement = fixture.nativeElement;

    // Título grande por categoría y subtítulo por subcategoría.
    expect(
      [...raiz.querySelectorAll('h2')].map((h) => h.textContent?.trim()),
    ).toEqual(['electronico', 'aseo']);

    // El bloque de la categoría contiene al de sus subcategorías, cada una con
    // solo sus productos. Las tarjetas también usan h3, así que se comprueba
    // dentro de su propio bloque.
    const electronico = raiz.querySelector('[id="seccion-electronico-1"]');
    const subcategorias = [
      ...(electronico?.querySelectorAll(':scope > div[id^="seccion-"]') ?? []),
    ];
    expect(
      subcategorias.map((bloque) => bloque.querySelector('h3')?.textContent?.trim()),
    ).toEqual(['neveras', 'ventiladores']);
    expect(electronico?.querySelector('[id="seccion-neveras-2"]')).toBeTruthy();
    expect(electronico?.querySelector('[id="seccion-ventiladores-3"]')).toBeTruthy();
    expect(electronico?.querySelectorAll('app-producto-card').length).toBe(3);
    expect(raiz.querySelector('[id="seccion-neveras-2"]')?.textContent).toContain(
      'Nevera No Frost',
    );
    // Las subcategorías no se repiten fuera de su categoría.
    expect(
      raiz.querySelector('[id="seccion-aseo-4"]')?.querySelector('[id="seccion-neveras-2"]'),
    ).toBeNull();

    // El acceso rápido lista categorías; las subcategorías se ven dentro.
    expect(raiz.querySelector('nav a[href="/tienda#seccion-electronico-1"]')).toBeTruthy();
    expect(raiz.querySelector('nav a[href="/tienda#seccion-neveras-2"]')).toBeNull();
  });
});
