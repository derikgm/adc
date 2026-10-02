/**
 * Modelo de catálogo de la tienda.
 *
 * El servidor `https://derikgm-msf-nestjs.wasmer.app` expone:
 *   GET /adc/productos → { "secciones": ["equipos", ...], "equipos": [...], ... }
 *
 * Mientras esa ruta no exista (404) se usa `GET /delys/dulces` como respaldo,
 * que devuelve { "dulces": [Producto...] }.
 */

/** Producto tal y como llega del servidor, con todo aún sin normalizar. */
export interface ProductoServidor {
  id: number;
  nombre: string;
  precio: number;
  imagen_url?: string | null;
  imagen_bytes?: number | null;
  moneda?: string | null;
}

/** Producto ya listo para pintar. */
export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  imagen_url: string | null;
  moneda: string;
}

/** Catálogo agrupado por secciones. */
export interface Catalogo {
  /** Orden en que el servidor quiere que se muestren las secciones. */
  secciones: string[];
  /** Productos de cada sección, usando el mismo nombre que en `secciones`. */
  productos: Record<string, Producto[]>;
}

/**
 * Moneda asumida cuando el servidor no manda ninguna. Los precios que vienen
 * sin moneda (catálogo de practica /delys/dulces) están en pesos cubanos.
 */
export const MONEDA_POR_DEFECTO = 'CUP';

/** Normaliza un producto suelto: precio numérico y moneda en mayúsculas. */
export function normalizarProducto(bruto: ProductoServidor): Producto {
  const precio = Number(bruto.precio);
  const moneda = String(bruto.moneda ?? '')
    .trim()
    .toUpperCase();

  return {
    id: Number(bruto.id),
    nombre: String(bruto.nombre ?? 'Producto'),
    precio: Number.isFinite(precio) ? precio : 0,
    imagen_url: bruto.imagen_url || null,
    moneda: moneda || MONEDA_POR_DEFECTO,
  };
}

/** Convierte la respuesta de `GET /adc/productos` en un catálogo. */
export function normalizarCatalogoADC(datos: unknown): Catalogo {
  const bruto = (datos ?? {}) as Record<string, unknown>;
  const listado = (valor: unknown): ProductoServidor[] =>
    Array.isArray(valor) ? (valor as ProductoServidor[]) : [];

  // La lista oficial de secciones manda; si el servidor no la manda, se toman
  // las claves que tengan una lista de productos.
  const anunciadas = listado(bruto['secciones']).map((nombre) => String(nombre));
  const porClave = Object.keys(bruto).filter(
    (clave) => clave !== 'secciones' && Array.isArray(bruto[clave]),
  );
  const secciones = [...anunciadas, ...porClave.filter((c) => !anunciadas.includes(c))];

  const productos: Record<string, Producto[]> = {};
  const visibles: string[] = [];

  for (const seccion of secciones) {
    const items = listado(bruto[seccion]).map(normalizarProducto);
    if (!items.length) continue; // no pintar secciones vacías
    productos[seccion] = items;
    visibles.push(seccion);
  }

  return { secciones: visibles, productos };
}

/** Convierte la respuesta de `GET /delys/dulces` en un catálogo de una sección. */
export function normalizarCatalogoRespaldo(datos: unknown): Catalogo {
  const bruto = (datos ?? {}) as Record<string, unknown>;
  const lista = Array.isArray(bruto['dulces'])
    ? (bruto['dulces'] as ProductoServidor[])
    : [];

  const productos = lista.map(normalizarProducto);

  return {
    secciones: productos.length ? ['dulces'] : [],
    productos: { dulces: productos },
  };
}

/** Todos los productos del catálogo, en el orden de las secciones. */
export function todosLosProductos(catalogo: Catalogo): Producto[] {
  return catalogo.secciones.flatMap((seccion) => catalogo.productos[seccion] ?? []);
}
