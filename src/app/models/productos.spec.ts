import { describe, expect, it } from 'vitest';
import {
  MONEDA_POR_DEFECTO,
  SECCION_SIN_SECCION,
  normalizarCatalogoADC,
  normalizarProducto,
  todosLosProductos,
} from './productos';

describe('Modelo de productos', () => {
  describe('normalizarProducto', () => {
    it('normaliza precio, moneda y sección', () => {
      const producto = normalizarProducto({
        id: 7,
        nombre: 'Inversor 1500W',
        precio: 18500,
        moneda: 'cup',
        seccion: 'electronico',
        seccion_id: 4,
      });

      expect(producto).toEqual({
        id: 7,
        nombre: 'Inversor 1500W',
        precio: 18500,
        imagen_url: null,
        moneda: 'CUP',
        seccion: 'electronico',
        seccion_id: 4,
      });
    });

    it('asume CUP y sección nula cuando el servidor no envía esos campos', () => {
      const producto = normalizarProducto({ id: 1, nombre: 'Cable', precio: 90 });

      expect(producto.moneda).toBe(MONEDA_POR_DEFECTO);
      expect(producto.seccion).toBeNull();
      expect(producto.seccion_id).toBeNull();
    });

    it('tolera precios rotos (0) y mantiene el nombre vacío tal cual', () => {
      const producto = normalizarProducto({ id: 2, nombre: '', precio: NaN });

      expect(producto.precio).toBe(0);
      expect(producto.nombre).toBe('');
    });
  });

  describe('normalizarCatalogoADC', () => {
    it('agrupa por la sección respetando el orden de la lista', () => {
      const catalogo = normalizarCatalogoADC({
        secciones: [
          { id: 1, nombre: 'equipos' },
          { id: 2, nombre: 'aseo' },
        ],
        productos: [
          { id: 1, nombre: 'Taladro', precio: 3000, moneda: 'CUP', seccion: 'equipos', seccion_id: 1 },
          { id: 2, nombre: 'Extintor', precio: 8, moneda: 'USD', seccion: 'aseo', seccion_id: 2 },
        ],
      });

      expect(catalogo.secciones).toEqual(['equipos', 'aseo']);
      expect(catalogo.productos['equipos'].map((p) => p.nombre)).toEqual(['Taladro']);
      expect(catalogo.productos['aseo'].map((p) => p.nombre)).toEqual(['Extintor']);
    });

    it('entiende la sección llegando como objeto ({ id, nombre })', () => {
      const catalogo = normalizarCatalogoADC({
        secciones: [],
        productos: [
          { id: 3, nombre: 'Panel', precio: 1, moneda: 'CUP', seccion: { id: 9, nombre: 'solar' }, seccion_id: 9 },
        ],
      });

      expect(catalogo.secciones).toEqual(['solar']);
    });

    it('no pinta secciones anunciadas sin productos y agrupa los sin sección al final', () => {
      const catalogo = normalizarCatalogoADC({
        secciones: [
          { id: 1, nombre: 'equipos' },
          { id: 3, nombre: 'vacia' },
        ],
        productos: [
          { id: 1, nombre: 'Taladro', precio: 3000, moneda: 'CUP', seccion: 'equipos', seccion_id: 1 },
          { id: 2, nombre: 'Sueltillo', precio: 5, moneda: 'CUP', seccion: null, seccion_id: null },
        ],
      });

      expect(catalogo.secciones).toEqual(['equipos', SECCION_SIN_SECCION]);
      expect(catalogo.productos[SECCION_SIN_SECCION].map((p) => p.nombre)).toEqual(['Sueltillo']);
    });
  });

  describe('todosLosProductos', () => {
    it('aplana las secciones en el orden del catálogo', () => {
      const catalogo = normalizarCatalogoADC({
        secciones: [
          { id: 1, nombre: 'a' },
          { id: 2, nombre: 'b' },
        ],
        productos: [
          { id: 1, nombre: 'A1', precio: 1, moneda: 'CUP', seccion: 'a', seccion_id: 1 },
          { id: 2, nombre: 'B1', precio: 2, moneda: 'CUP', seccion: 'b', seccion_id: 2 },
          { id: 3, nombre: 'A2', precio: 3, moneda: 'CUP', seccion: 'a', seccion_id: 1 },
        ],
      });

      expect(todosLosProductos(catalogo).map((p) => p.nombre)).toEqual(['A1', 'A2', 'B1']);
    });
  });
});