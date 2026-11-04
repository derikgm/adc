import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';
import { timeoutInterceptor } from '../interceptors/timeout.interceptor';
import { SERVIDOR } from '../services/productos.service';
import { ProductoDetallePageComponent } from './producto-detalle.page';

/**
 * La ficha se monta siempre igual: router vacío (los tests no enrutan), HTTP de
 * verdad contra un `HttpTestingController` y un `ActivatedRoute` falso que trae
 * el id de la URL. No hay más endpoint que `GET /adc/productos`, así que la
 * página solo espera esa respuesta.
 */
const NEVERA = {
  id: 5,
  nombre: 'Nevera No Frost 250 L',
  precio: 320,
  moneda: 'USD',
  imagen_url: null,
  seccion: 'neveras',
  seccion_id: 3,
  modelos: [
    {
      id: 21,
      nombre: '240 L inverter',
      precio: 320,
      moneda: 'USD',
      imagen_url: 'nevera-240.png',
      atributos: { Peso: '38 kg', Ruido: '41 dB', Garantía: '1 año' },
    },
    {
      id: 22,
      nombre: '340 L inverter',
      precio: 420,
      moneda: 'USD',
      imagen_url: 'nevera-340.png',
      atributos: { Peso: '45 kg' },
    },
    {
      id: 23,
      nombre: '420 L frost free',
      precio: 510,
      moneda: 'USD',
      imagen_url: null,
      atributos: {},
    },
  ],
};

/** Publicación de una sola variante: lo que había antes de los modelos. */
const BREAKER = {
  id: 11,
  nombre: 'Breaker bifásico 40 A',
  precio: 22,
  moneda: 'USD',
  imagen_url: 'breaker.jpg',
  seccion: 'electricos',
  seccion_id: 8,
};

const CATALOGO = {
  secciones: [
    { id: 3, nombre: 'neveras' },
    { id: 8, nombre: 'electricos' },
  ],
  productos: [NEVERA, BREAKER],
};

describe('Ficha de producto /producto/:id', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    // Vitest ejecuta los ficheros en el mismo proceso: se limpia el TestBed
    // heredado antes de montar el nuestro.
    TestBed.resetTestingModule();
  });

  /**
   * Monta la ficha del `id` dado y devuelve su DOM ya con el catálogo respondido
   * (o sin responder, para probar el spinner).
   */
  function montar(id: string, opciones: { catalogo?: unknown; responder?: boolean } = {}) {
    const { catalogo = CATALOGO, responder = true } = opciones;

    TestBed.configureTestingModule({
      imports: [ProductoDetallePageComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([timeoutInterceptor])),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ id })) },
        },
      ],
    });

    http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(ProductoDetallePageComponent);
    fixture.detectChanges();

    const peticion = http.expectOne(`${SERVIDOR}/adc/productos`);
    if (responder) {
      peticion.flush(catalogo as { secciones: unknown[]; productos: unknown[] });
    }
    fixture.detectChanges();

    return { raiz: fixture.nativeElement as HTMLElement, fixture, peticion };
  }

  /** Los chips del selector, en el orden del servidor. */
  function chips(raiz: HTMLElement): HTMLButtonElement[] {
    return Array.from(
      raiz.querySelectorAll<HTMLButtonElement>('[role="group"] button'),
    );
  }

  it('arranca con el modelo más barato a la vista y su ficha', () => {
    const { raiz } = montar('5');

    expect(raiz.textContent).toContain('Nevera No Frost 250 L');
    expect(raiz.textContent).toContain('Elige un modelo');
    expect(raiz.textContent).toContain('320 USD');
    expect(raiz.textContent).toContain('Peso');
    expect(raiz.textContent).toContain('38 kg');

    expect(chips(raiz).map((chip) => chip.textContent?.trim())).toEqual([
      '240 L inverter',
      '340 L inverter',
      '420 L frost free',
    ]);
    expect(chips(raiz)[0].getAttribute('aria-pressed')).toBe('true');
    expect(chips(raiz)[2].getAttribute('aria-pressed')).toBe('false');
  });

  it('picar otro modelo cambia el precio, la foto y la ficha', () => {
    const { raiz, fixture } = montar('5');

    expect(raiz.querySelector('img')?.getAttribute('src')).toBe('nevera-240.png');

    chips(raiz)[1].click();
    fixture.detectChanges();

    expect(raiz.textContent).toContain('420 USD');
    expect(raiz.querySelector('img')?.getAttribute('src')).toBe('nevera-340.png');
    // La ficha de arriba es solo la del modelo elegido (el ruido del 240 L no se
    // queda pegado); abajo, la lista comparativa sí muestra la de todos.
    const ficha = raiz.querySelector('dl')!;
    expect(ficha.textContent).toContain('45 kg');
    expect(ficha.textContent).not.toContain('41 dB');
    expect(raiz.textContent).toContain('Peso: 38 kg · Ruido: 41 dB');
    expect(chips(raiz)[1].getAttribute('aria-pressed')).toBe('true');
  });

  it('un modelo sin foto propia ni de la publicación deja el placeholder', () => {
    const { raiz, fixture } = montar('5');

    chips(raiz)[2].click();
    fixture.detectChanges();

    // NEVERA no tiene imagen de publicación y el 420 L tampoco: ni roto ni hueco.
    expect(raiz.querySelector('img')).toBeNull();
    expect(raiz.querySelector('div.grid.aspect-square svg')).toBeTruthy();
    expect(raiz.textContent).toContain('510 USD');
    // Sin características no se pinta la lista.
    expect(raiz.querySelector('dl')).toBeNull();
  });

  it('el WhatsApp se manda ya escrito con el modelo y el precio que se miran', () => {
    const { raiz, fixture } = montar('5');
    const enlace = raiz.querySelector('a[target="_blank"]')!;

    expect(decodeURIComponent(enlace.getAttribute('href')!)).toContain(
      'me interesa Nevera No Frost 250 L — 240 L inverter (320 USD)',
    );

    chips(raiz)[1].click();
    fixture.detectChanges();

    expect(decodeURIComponent(enlace.getAttribute('href')!)).toContain(
      '340 L inverter (420 USD)',
    );
  });

  it('la lista comparativa pinta todos los modelos y selecciona al picarla', () => {
    const { raiz, fixture } = montar('5');
    const cartas = Array.from(
      raiz.querySelectorAll<HTMLButtonElement>('ul li button'),
    );

    expect(cartas.map((carta) => carta.textContent?.replace(/\s+/g, ' ').trim())).toEqual([
      '240 L inverter 320 USD Peso: 38 kg · Ruido: 41 dB',
      '340 L inverter 420 USD Peso: 45 kg',
      '420 L frost free 510 USD',
    ]);

    cartas[2].click();
    fixture.detectChanges();

    expect(raiz.textContent).toContain('510 USD');
    expect(chips(raiz)[2].getAttribute('aria-pressed')).toBe('true');
  });

  it('una publicación sin modelos se vende tal cual, sin selector', () => {
    const { raiz } = montar('11');

    expect(raiz.textContent).toContain('Breaker bifásico 40 A');
    expect(raiz.textContent).toContain('22 USD');
    expect(raiz.textContent).not.toContain('Elige un modelo');
    expect(chips(raiz)).toHaveLength(0);
    expect(raiz.querySelector('img')?.getAttribute('src')).toBe('breaker.jpg');
    // El mensaje habla de la publicación, no de un modelo que no existe.
    expect(decodeURIComponent(raiz.querySelector('a[target="_blank"]')!.getAttribute('href')!))
      .toContain('me interesa Breaker bifásico 40 A (22 USD)');
  });

  it('un id que no está en el catálogo avisa y devuelve a la tienda', () => {
    const { raiz } = montar('999');

    expect(raiz.textContent).toContain('ya no está publicado');
    expect(raiz.querySelector('a[href="/tienda"]')).toBeTruthy();
  });

  it('mientras llega el catálogo no se grita «no está publicado»', () => {
    const { raiz, peticion } = montar('5', { responder: false });

    expect(raiz.textContent).not.toContain('ya no está publicado');
    expect(raiz.querySelector('[role="status"]')).toBeTruthy();

    peticion.flush(CATALOGO);
  });

  it('el JSON-LD declara una oferta por modelo', () => {
    montar('5');

    const guion = document.querySelector<HTMLScriptElement>('script[data-seo-jsonld]');
    expect(guion).toBeTruthy();

    const datos = JSON.parse(guion!.textContent ?? '{}');
    expect(datos['@type']).toBe('Product');
    expect(datos.name).toBe('Nevera No Frost 250 L');
    expect(datos.offers).toHaveLength(3);
    expect(datos.offers[1]).toMatchObject({
      '@type': 'Offer',
      name: '340 L inverter',
      price: 420,
      priceCurrency: 'USD',
    });

    // La pestaña del teléfono: el nombre del producto, no «Producto · ADC».
    expect(document.title).toBe('Nevera No Frost 250 L · ADC');
  });

  it('un catálogo sin la clave modelos tampoco rompe la ficha', () => {
    const { raiz } = montar('5', {
      catalogo: {
        secciones: [{ id: 3, nombre: 'neveras' }],
        productos: [{ ...NEVERA, modelos: undefined }],
      },
    });

    expect(raiz.textContent).toContain('320 USD');
    expect(raiz.textContent).not.toContain('Elige un modelo');
  });
});
