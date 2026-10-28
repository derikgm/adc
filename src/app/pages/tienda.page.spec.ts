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
      secciones: ['equipos', 'aseo'],
      equipos: [
        { id: 1, nombre: 'Taladro percutor', precio: 3000, imagen_url: 'a.jpg', moneda: 'CUP' },
        { id: 2, nombre: 'Compresor', precio: 20, imagen_url: null, moneda: 'USD' },
        { id: 3, nombre: 'Amperímetro', precio: 15, imagen_url: null, moneda: 'CUP' },
        { id: 4, nombre: 'Pinza amperométrica', precio: 25, imagen_url: null, moneda: 'USD' },
        { id: 5, nombre: 'Cable calibre 10', precio: 90, imagen_url: null, moneda: 'CUP' },
        { id: 6, nombre: 'Termomagnética', precio: 12, imagen_url: null, moneda: 'USD' },
      ],
      aseo: [
        { id: 7, nombre: 'Extintor', precio: 8, imagen_url: null, moneda: 'USD' },
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
    expect(raiz.querySelector('nav a[href="#seccion-equipos"]')).toBeTruthy();
    expect(raiz.textContent).toContain('Extintor');
    expect(raiz.textContent).toContain('8 USD');
  });

  it('agrupa las subcategorías dentro de su categoría principal', () => {
    const fixture = TestBed.createComponent(TiendaPageComponent);
    fixture.detectChanges();

    const raiz: HTMLElement = fixture.nativeElement;

    // Respuesta actual del servidor: productos y secciones con `padre_id`.
    respondeConSubcategorias();
    fixture.detectChanges();

    expect(raiz.querySelectorAll('app-producto-card').length).toBe(3);
    expect(
      [...raiz.querySelectorAll('h2')].map((h) => h.textContent?.trim()),
    ).toEqual(['electrodomesticos']);

    // La tarjeta de la subcategoría vive dentro del bloque de su categoría.
    const subcategoria = raiz.querySelector('#subcategoria-electrodomesticos-neveras');
    expect(subcategoria).toBeTruthy();
    expect(
      subcategoria!.querySelector(':scope > h3')?.textContent?.trim(),
    ).toBe('neveras');
    expect(subcategoria?.querySelectorAll('app-producto-card').length).toBe(1);
    expect(subcategoria?.textContent).toContain('Ventilador de pedestal');

    // La barra deja saltar tanto a la categoría como a la subcategoría.
    expect(raiz.querySelector('nav a[href="#seccion-electrodomesticos"]')).toBeTruthy();
    expect(
      raiz.querySelector(
        'nav a[href="#subcategoria-electrodomesticos-neveras"]',
      ),
    ).toBeTruthy();
  });

  /** Respuesta actual: una categoría principal con una subcategoría. */
  function respondeConSubcategorias() {
    http.expectOne(`${SERVIDOR}/adc/productos`).flush({
      productos: [
        { id: 1, nombre: 'Nevera', precio: 250, moneda: 'USD', seccion_id: 3 },
        { id: 2, nombre: 'Hornilla infrarrojo', precio: 33000, moneda: 'CUP', seccion_id: 3 },
        { id: 3, nombre: 'Ventilador de pedestal', precio: 31000, moneda: 'CUP', seccion_id: 8 },
      ],
      secciones: [
        { id: 3, nombre: 'electrodomesticos', padre_id: null },
        { id: 8, nombre: 'neveras', padre_id: 3 },
      ],
    });
  }
});
