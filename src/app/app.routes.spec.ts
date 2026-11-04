import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { routes } from './app.routes';

describe('Rutas', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    });
  });

  afterEach(() => TestBed.resetTestingModule());

  it('define los títulos de / y /tienda', () => {
    expect(routes[0].path).toBe('');
    expect(routes[0].title).toBe('ADC · Artículos y servicios eléctricos');

    expect(routes[1].path).toBe('tienda');
    expect(routes[1].title).toBe('Tienda · ADC');
  });

  it('define la ficha de producto antes del comodín', () => {
    const ficha = routes.find((ruta) => ruta.path === 'producto/:id');

    expect(ficha?.title).toBe('Producto · ADC');
    // El comodín tiene que quedar el último: si no, `/producto/5` cae al inicio
    // y la ficha es inalcanzable.
    expect(routes.at(-1)?.path).toBe('**');
    expect(routes.indexOf(ficha!)).toBeLessThan(routes.length - 1);
  });

  it('redirige cualquier ruta desconocida a /', async () => {
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/esta-ruta-no-existe');
    expect(router.url).toBe('/');
  });
});