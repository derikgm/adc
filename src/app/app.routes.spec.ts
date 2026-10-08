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

  it('redirige cualquier ruta desconocida a /', async () => {
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/esta-ruta-no-existe');
    expect(router.url).toBe('/');
  });
});