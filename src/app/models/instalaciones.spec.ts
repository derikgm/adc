import { describe, expect, it } from 'vitest';
import {
  MONEDA_POR_DEFECTO,
  normalizarInstalacion,
  normalizarInstalaciones,
} from './instalaciones';

describe('Modelo de instalaciones', () => {
  describe('normalizarInstalacion', () => {
    it('normaliza moneda, precio y descripción', () => {
      const instalacion = normalizarInstalacion({
        id: 7,
        nombre_servicio: 'Paneles solares',
        precio: 18500,
        moneda: 'cup',
        imagen_url: 'https://cdn/adc/panel.jpg',
        descripcion: ['Instalación desde temprano', 'Con garantía'],
      });

      expect(instalacion).toEqual({
        id: 7,
        nombre_servicio: 'Paneles solares',
        precio: 18500,
        moneda: 'CUP',
        imagen_url: 'https://cdn/adc/panel.jpg',
        descripcion: ['Instalación desde temprano', 'Con garantía'],
      });
    });

    it('asume CUP, imagen nula y descripción vacía si el servidor no los manda', () => {
      const instalacion = normalizarInstalacion({
        id: 1,
        nombre_servicio: 'Baterías',
        precio: 200,
      });

      expect(instalacion.moneda).toBe(MONEDA_POR_DEFECTO);
      expect(instalacion.imagen_url).toBeNull();
      expect(instalacion.descripcion).toEqual([]);
    });

    it('tolera precios rotos (0) y limpia la descripción', () => {
      const instalacion = normalizarInstalacion({
        id: 2,
        nombre_servicio: 'Ecoflow',
        precio: NaN,
        descripcion: ['  Con espacios  ', '', '   ', 'Otra línea'],
      });

      expect(instalacion.precio).toBe(0);
      expect(instalacion.descripcion).toEqual(['Con espacios', 'Otra línea']);
    });

    it('no falla si la descripción no es una lista', () => {
      const instalacion = normalizarInstalacion({
        id: 3,
        nombre_servicio: 'Tableros',
        precio: 10,
        descripcion: 'texto suelto',
      });

      expect(instalacion.descripcion).toEqual([]);
    });
  });

  describe('normalizarInstalaciones', () => {
    it('lee la lista del sobre { instalaciones }', () => {
      const lista = normalizarInstalaciones({
        instalaciones: [
          { id: 1, nombre_servicio: 'Paneles', precio: 1, moneda: 'CUP' },
          { id: 2, nombre_servicio: 'Cableado', precio: 2, moneda: 'USD' },
        ],
      });

      expect(lista.map((i) => i.nombre_servicio)).toEqual(['Paneles', 'Cableado']);
    });

    it('acepta también una lista suelta y datos vacíos', () => {
      expect(
        normalizarInstalaciones([
          { id: 1, nombre_servicio: 'Paneles', precio: 1, moneda: 'CUP' },
        ]).length,
      ).toBe(1);

      expect(normalizarInstalaciones(null)).toEqual([]);
      expect(normalizarInstalaciones({})).toEqual([]);
    });
  });
});
