import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { Modelo, Producto } from '../models/productos';
import { ProductoCardComponent } from './producto-card.component';

function modelo(pega: Partial<Modelo> = {}): Modelo {
  return {
    id: 11,
    nombre: '240 L inverter',
    precio: 320,
    imagen_url: null,
    moneda: 'USD',
    atributos: [{ etiqueta: 'Peso', valor: '38 kg' }],
    ...pega,
  };
}

function producto(pega: Partial<Producto> = {}): Producto {
  return {
    id: 1,
    nombre: 'Taladro percutor',
    precio: 3000,
    imagen_url: 'taladro.jpg',
    moneda: 'CUP',
    seccion: 'equipos',
    seccion_id: 1,
    modelos: [],
    ...pega,
  };
}

describe('ProductoCard', () => {
  let fixture: ComponentFixture<ProductoCardComponent>;

  beforeEach(() => {
    TestBed.resetTestingModule();
    // La tarjeta enlaza con la ficha, así que necesita el router montado.
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    fixture = TestBed.createComponent(ProductoCardComponent);
  });

  /** Monta la tarjeta con un producto dado y devuelve su DOM. */
  function montar(prod: Producto): HTMLElement {
    fixture.componentRef.setInput('producto', prod);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('pinta la imagen, el nombre y el precio con su moneda', () => {
    const raiz = montar(producto());

    const img: HTMLImageElement | null = raiz.querySelector('img');
    expect(img).toBeTruthy();
    expect(img!.getAttribute('src')).toBe('taladro.jpg');
    expect(img!.getAttribute('alt')).toBe('Taladro percutor');
    expect(img!.getAttribute('loading')).toBe('lazy');

    expect(raiz.textContent).toContain('Taladro percutor');
    expect(raiz.textContent).toContain('3000 CUP');
  });

  it('la moneda CUP es dorada y las demás azules', () => {
    const cup = montar(producto({ moneda: 'CUP' }));
    const precioCup: HTMLElement | null = cup.querySelector('p.font-bold');
    expect(precioCup!.className).toContain('text-gold-300');

    const usd = montar(producto({ moneda: 'USD', precio: 20 }));
    const precioUsd: HTMLElement | null = usd.querySelector('p.font-bold');
    expect(precioUsd!.className).toContain('text-navy-300');
  });

  it('sin imagen usa el placeholder con el rayo, sin romper la cuadrícula', () => {
    const raiz = montar(producto({ imagen_url: null }));

    expect(raiz.querySelector('img')).toBeNull();
    expect(raiz.querySelector('div.aspect-\\[4\\/3\\] svg')).toBeTruthy();
    // El texto del producto sigue visible aunque no haya foto.
    expect(raiz.textContent).toContain('Taladro percutor');
  });

  it('si la imagen falla al cargar, la sustituye por el placeholder', () => {
    const raiz = montar(producto({ imagen_url: 'caducada.jpg' }));
    expect(raiz.querySelector('img')).toBeTruthy();

    raiz.querySelector('img')!.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(raiz.querySelector('img')).toBeNull();
    expect(raiz.querySelector('div.aspect-\\[4\\/3\\] svg')).toBeTruthy();
    expect(raiz.textContent).toContain('3000 CUP');
  });

  it('si cambia la URL de la imagen, se reintenta cargarla', () => {
    montar(producto());
    raizDe(fixture).querySelector('img')!.dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(raizDe(fixture).querySelector('img')).toBeNull();

    // Otro producto con foto distinta: se vuelve a intentar la imagen.
    fixture.componentRef.setInput(
      'producto',
      producto({ nombre: 'Compresor', imagen_url: 'compresor.jpg' }),
    );
    fixture.detectChanges();

    const img: HTMLImageElement | null = raizDe(fixture).querySelector('img');
    expect(img).toBeTruthy();
    expect(img!.getAttribute('src')).toBe('compresor.jpg');
    expect(img!.getAttribute('alt')).toBe('Compresor');
  });

  it('enlaza con la ficha del producto', () => {
    const raiz = montar(producto({ id: 37 }));
    const enlace = raiz.querySelector('a');

    expect(enlace?.getAttribute('href')).toContain('/producto/37');
    expect(enlace?.getAttribute('aria-label')).toBe('Ver Taladro percutor');
  });

  it('con modelos avisa cuántos hay y pinta el precio del más barato', () => {
    const raiz = montar(
      producto({
        precio: 999,
        moneda: 'USD',
        modelos: [modelo({ precio: 420 }), modelo({ id: 12, precio: 320 })],
      }),
    );

    expect(raiz.textContent).toContain('2 modelos');
    // El de la publicación (999) no se pinta: manda el modelo más barato.
    expect(raiz.textContent).toContain('320 USD');
    expect(raiz.textContent).not.toContain('999');
    // Precios distintos → «desde», que es lo que decide en el teléfono.
    expect(raiz.textContent).toContain('desde');
  });

  it('sin modelos ni «desde» ni aviso, y un solo modelo no lleva la etiqueta', () => {
    expect(montar(producto()).textContent).not.toContain('desde');
    expect(montar(producto({ modelos: [modelo()] })).textContent).not.toContain('1 modelos');
  });

  it('todos los modelos al mismo precio: precio suelto, sin «desde»', () => {
    const raiz = montar(
      producto({ modelos: [modelo({ precio: 320 }), modelo({ id: 12, precio: 320 })] }),
    );

    expect(raiz.textContent).toContain('320 USD');
    expect(raiz.textContent).not.toContain('desde');
  });

  it('si la publicación no tiene foto, se usa la del primer modelo con ella', () => {
    const raiz = montar(
      producto({
        imagen_url: null,
        modelos: [
          modelo({ id: 12, imagen_url: null }),
          modelo({ id: 13, imagen_url: 'modelo.jpg' }),
        ],
      }),
    );

    const img = raiz.querySelector('img');
    expect(img?.getAttribute('src')).toBe('modelo.jpg');
  });
});

function raizDe(fixture: ComponentFixture<ProductoCardComponent>): HTMLElement {
  return fixture.nativeElement as HTMLElement;
}