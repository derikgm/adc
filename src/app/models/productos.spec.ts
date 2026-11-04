import { describe, expect, it } from 'vitest';
import {
  MONEDA_POR_DEFECTO,
  SECCION_SIN_SECCION,
  normalizarCatalogoADC,
  normalizarModelos,
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
        modelos: [],
      });
    });

    it('un producto que no manda modelos se vende como uno solo', () => {
      expect(normalizarProducto({ id: 1, nombre: 'Cable', precio: 90 }).modelos).toEqual([]);
      // `modelos: null` o un catálogo viejo tampoco rompen nada.
      expect(normalizarProducto({ id: 1, nombre: 'Cable', precio: 90, modelos: null }).modelos)
        .toEqual([]);
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

  describe('modelos de una publicación', () => {
    it('normaliza precio, moneda y foto de cada modelo', () => {
      const [modelo] = normalizarModelos([
        {
          id: 21,
          nombre: '340 L inverter',
          // `numeric` llega como texto según el driver: se convierte igual.
          precio: '420.50' as unknown as number,
          moneda: 'usd',
          imagen_url: '',
          atributos: { Peso: '45 kg' },
        },
      ]);

      expect(modelo).toEqual({
        id: 21,
        nombre: '340 L inverter',
        precio: 420.5,
        imagen_url: null,
        moneda: 'USD',
        atributos: [{ etiqueta: 'Peso', valor: '45 kg' }],
      });
    });

    it('sin moneda en el modelo asume la de casa, no la de la publicación', () => {
      const [modelo] = normalizarModelos([{ id: 1, nombre: 'Base', precio: 10 }]);

      expect(modelo.moneda).toBe(MONEDA_POR_DEFECTO);
    });

    it('la ficha se pinta como lista de pares, en el orden que manda el servidor', () => {
      const [modelo] = normalizarModelos([
        {
          id: 1,
          nombre: 'Base',
          precio: 10,
          atributos: { Ruido: '41 dB', Peso: '38 kg', Garantía: '1 año' },
        },
      ]);

      expect(modelo.atributos.map((atributo) => atributo.etiqueta)).toEqual([
        'Ruido',
        'Peso',
        'Garantía',
      ]);
    });

    it('de la ficha solo se quedan los valores de una línea', () => {
      const [modelo] = normalizarModelos([
        {
          id: 1,
          nombre: 'Base',
          precio: 10,
          atributos: {
            Consumo: 120,
            Regulable: true,
            '  ': 'nada',
            Vacío: '   ',
            Medidas: ['30 cm', '40 cm'],
            Extra: { detalle: 'anidada' },
          },
        },
      ]);

      expect(modelo.atributos).toEqual([
        { etiqueta: 'Consumo', valor: '120' },
        { etiqueta: 'Regulable', valor: 'true' },
      ]);
    });

    it('una ficha que no es objeto, y modelos que no son lista, no revientan', () => {
      expect(normalizarModelos(undefined)[0]).toBeUndefined();
      expect(normalizarModelos({ 0: 'no es lista' })).toEqual([]);

      const [modelo] = normalizarModelos([{ id: 1, nombre: 'Base', precio: 10, atributos: 'Peso: 38' }]);
      expect(modelo.atributos).toEqual([]);
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

  describe('categorias con subcategorías', () => {
    const CATALOGO_ANIDADO = {
      secciones: [
        { id: 1, nombre: 'electronico', padre_id: null },
        { id: 2, nombre: 'neveras', padre_id: 1 },
        { id: 3, nombre: 'ventiladores', padre_id: 1 },
      ],
      productos: [
        { id: 1, nombre: 'Cable', precio: 5, moneda: 'CUP', seccion: 'electronico', seccion_id: 1 },
        { id: 2, nombre: 'Nevera No Frost', precio: 900, moneda: 'CUP', seccion: 'neveras', seccion_id: 2 },
        { id: 3, nombre: 'Ventilador', precio: 20, moneda: 'USD', seccion: 'ventiladores', seccion_id: 3 },
      ],
    };

    it('cuelga cada subcategoría de su categoría, sin subir productos al padre', () => {
      const [electronico] = normalizarCatalogoADC(CATALOGO_ANIDADO).categorias;

      expect(electronico.nombre).toBe('electronico');
      expect(electronico.productos.map((p) => p.nombre)).toEqual(['Cable']);
      expect(electronico.subcategorias.map((s) => s.nombre)).toEqual(['neveras', 'ventiladores']);
      expect(electronico.subcategorias[0].productos.map((p) => p.nombre)).toEqual([
        'Nevera No Frost',
      ]);
      expect(electronico.subcategorias[1].productos.map((p) => p.nombre)).toEqual(['Ventilador']);
    });

    it('pinta la categoría aunque no tenga productos propios', () => {
      const sinProductosPropios = {
        ...CATALOGO_ANIDADO,
        productos: CATALOGO_ANIDADO.productos.filter((p) => p.seccion !== 'electronico'),
      };
      const catalogo = normalizarCatalogoADC(sinProductosPropios);

      // «electronico» sigue ahí porque es el contenedor de sus subcategorías.
      expect(catalogo.secciones).toEqual(['electronico', 'neveras', 'ventiladores']);
      expect(catalogo.categorias.map((c) => c.nombre)).toEqual(['electronico']);
      expect(catalogo.categorias[0].productos).toEqual([]);
    });

    it('trata como raíz lo que cuelga de una sección que no está en la lista', () => {
      const catalogo = normalizarCatalogoADC({
        secciones: [{ id: 2, nombre: 'neveras', padre_id: 999 }],
        productos: [
          { id: 2, nombre: 'Nevera No Frost', precio: 900, moneda: 'CUP', seccion: 'neveras', seccion_id: 2 },
        ],
      });

      expect(catalogo.categorias.map((c) => c.nombre)).toEqual(['neveras']);
      expect(catalogo.categorias[0].subcategorias).toEqual([]);
    });

    it('se queda en una lista cuando el servidor no manda padre_id', () => {
      // Respold heredado y `/delys/dulces`: no hay árbol que armar.
      const catalogo = normalizarCatalogoADC({
        secciones: [
          { id: 1, nombre: 'electronico' },
          { id: 2, nombre: 'neveras' },
          { id: 3, nombre: 'ventiladores' },
        ],
        productos: CATALOGO_ANIDADO.productos,
      });

      expect(catalogo.categorias.map((c) => c.nombre)).toEqual([
        'electronico',
        'neveras',
        'ventiladores',
      ]);
      expect(catalogo.categorias.every((c) => c.subcategorias.length === 0)).toBe(true);
    });
  });
});