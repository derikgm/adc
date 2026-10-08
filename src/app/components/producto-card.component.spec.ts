import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { Producto } from '../models/productos';
import { ProductoCardComponent } from './producto-card.component';

function producto(pega: Partial<Producto> = {}): Producto {
  return {
    id: 1,
    nombre: 'Taladro percutor',
    precio: 3000,
    imagen_url: 'taladro.jpg',
    moneda: 'CUP',
    seccion: 'equipos',
    seccion_id: 1,
    ...pega,
  };
}

describe('ProductoCard', () => {
  let fixture: ComponentFixture<ProductoCardComponent>;

  beforeEach(() => {
    TestBed.resetTestingModule();
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
});

function raizDe(fixture: ComponentFixture<ProductoCardComponent>): HTMLElement {
  return fixture.nativeElement as HTMLElement;
}