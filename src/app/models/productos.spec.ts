import { describe, expect, it } from 'vitest';
import {
  normalizarCatalogoADC,
  normalizarCatalogoRespaldo,
  todosLosProductos,
} from './productos';

describe('modelo del catálogo', () => {
  it('arma el árbol de categorías y subcategorías de la respuesta actual', () => {
    const catalogo = normalizarCatalogoADC({
      productos: [
        { id: 1, nombre: 'Nevera', precio: 250, moneda: 'USD', seccion_id: 3 },
        { id: 2, nombre: 'Ventilador', precio: 31000, moneda: 'CUP', seccion_id: 8 },
      ],
      secciones: [
        { id: 3, nombre: 'electrodomesticos', padre_id: null },
        { id: 8, nombre: 'neveras', padre_id: 3 },
      ],
    });

    expect(catalogo.secciones).toHaveLength(1);
    expect(catalogo.secciones[0].nombre).toBe('electrodomesticos');
    expect(catalogo.secciones[0].productos.map((p) => p.nombre)).toEqual(['Nevera']);
    expect(catalogo.secciones[0].subsecciones[0].nombre).toBe('neveras');
    expect(catalogo.secciones[0].subsecciones[0].productos.map((p) => p.nombre)).toEqual([
      'Ventilador',
    ]);
    expect(todosLosProductos(catalogo).map((p) => p.id)).toEqual([1, 2]);
  });

  it('no pierde los productos sin sección: los agrupa en «otros»', () => {
    const catalogo = normalizarCatalogoADC({
      productos: [
        { id: 1, nombre: 'Suelto', precio: 10, moneda: 'CUP' },
        { id: 2, nombre: 'De sección borrada', precio: 20, moneda: 'CUP', seccion_id: 99 },
      ],
      secciones: [{ id: 3, nombre: 'electrodomesticos', padre_id: null }],
    });

    // La categoría vacía no se pinta, pero «otros» sí.
    expect(catalogo.secciones).toHaveLength(1);
    expect(catalogo.secciones[0].nombre).toBe('otros');
    expect(catalogo.secciones[0].productos).toHaveLength(2);
  });

  it('sigue entendiendo el formato antiguo por claves', () => {
    const catalogo = normalizarCatalogoADC({
      secciones: ['equipos', 'aseo'],
      equipos: [{ id: 1, nombre: 'Taladro', precio: 3000, moneda: 'CUP' }],
      aseo: [{ id: 2, nombre: 'Extintor', precio: 8, moneda: 'USD' }],
    });

    expect(catalogo.secciones.map((s) => s.nombre)).toEqual(['equipos', 'aseo']);
    expect(catalogo.secciones[1].productos[0].moneda).toBe('USD');
  });

  it('normaliza el respaldo de Delys como una sola categoría plana', () => {
    const catalogo = normalizarCatalogoRespaldo({
      dulces: [{ id: 1, nombre: 'Charolas', precio: 1000 }],
    });

    expect(catalogo.secciones).toHaveLength(1);
    expect(catalogo.secciones[0].nombre).toBe('dulces');
    expect(catalogo.secciones[0].subsecciones).toEqual([]);
    expect(catalogo.secciones[0].productos[0].moneda).toBe('CUP');
  });
});
