/**
 * Modelo de catálogo de la tienda.
 *
 * El servidor `https://derikgm-msf-nestjs.wasmer.app` expone:
 *   GET /adc/productos → { "productos": [Producto...], "secciones": [Seccion...] }
 *
 * Desde las subcategorías, cada sección trae `padre_id`:
 *   { "id": 3, "nombre": "electrodomesticos", "padre_id": null }
 *   { "id": 8, "nombre": "neveras", "padre_id": 3 }
 *
 * Se sigue aceptando el formato viejo `{ "secciones": ["equipos"], "equipos": [...] }`
 * (el que probaban los tests) y el respaldo `GET /delys/dulces`, que es plano.
 */

/** Sección tal y como llega del servidor. */
export interface SeccionServidor {
  id: number;
  nombre: string;
  /** `null` (o ausente) = categoría principal; un id = subcategoría. */
  padre_id?: number | null;
}

/** Producto tal y como llega del servidor, con todo aún sin normalizar. */
export interface ProductoServidor {
  id: number;
  nombre: string;
  precio: number;
  imagen_url?: string | null;
  imagen_bytes?: number | null;
  moneda?: string | null;
  /** A qué sección pertenece (para agrupar por categoría). */
  seccion_id?: number | null;
  /** Nombre de la sección; el servidor manda los dos. */
  seccion?: string | null;
}

/** Producto ya listo para pintar. */
export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  imagen_url: string | null;
  moneda: string;
  /** Sección a la que pertenece; `null` si el servidor no la manda. */
  seccion_id: number | null;
}

/** Una subcategoría con sus productos (un solo nivel, como en el servidor). */
export interface SubcategoriaCatalogo {
  id: number;
  nombre: string;
  productos: Producto[];
}

/** Una categoría principal con sus productos directos y sus subcategorías. */
export interface SeccionCatalogo {
  id: number;
  nombre: string;
  /** Productos asignados a la categoría en sí (no a una subcategoría). */
  productos: Producto[];
  subsecciones: SubcategoriaCatalogo[];
}

/** Catálogo agrupado por categorías principales. */
export interface Catalogo {
  /** Solo las categorías con algo que enseñar (productos propios o en hijas). */
  secciones: SeccionCatalogo[];
}

/**
 * Moneda asumida cuando el servidor no manda ninguna. Los precios que vienen
 * sin moneda (catálogo de practica /delys/dulces) están en pesos cubanos.
 */
export const MONEDA_POR_DEFECTO = 'CUP';

/** Nombre de la sección sintética donde caen los productos sin sección. */
export const SECCION_SIN_ASIGNAR = 'otros';

/** Normaliza un producto suelto: precio numérico, moneda y sección. */
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
    seccion_id: typeof bruto.seccion_id === 'number' ? bruto.seccion_id : null,
  };
}

/** `true` si la sección tiene algo que enseñar (propia o de sus hijas). */
function conProductos(seccion: SeccionCatalogo): boolean {
  return (
    seccion.productos.length > 0 ||
    seccion.subsecciones.some((sub) => sub.productos.length > 0)
  );
}

/**
 * Convierte la respuesta actual de `GET /adc/productos`
 * (`productos` + `secciones` con `padre_id`) en un árbol de categorías.
 */
function normalizarFormatoActual(bruto: Record<string, unknown>): Catalogo {
  const productos = Array.isArray(bruto['productos'])
    ? (bruto['productos'] as ProductoServidor[]).map(normalizarProducto)
    : [];

  const crudas = Array.isArray(bruto['secciones'])
    ? (bruto['secciones'] as SeccionServidor[])
    : [];

  const secciones: SeccionServidor[] = crudas.map((seccion) => ({
    id: Number(seccion.id),
    nombre: String(seccion.nombre ?? ''),
    padre_id: seccion.padre_id ?? null,
  }));

  const principales = secciones.filter((seccion) => (seccion.padre_id ?? null) === null);
  const hijasDe = (id: number) => secciones.filter((seccion) => seccion.padre_id === id);

  const productosDe = (id: number) =>
    productos.filter((producto) => producto.seccion_id === id);

  const arbol: SeccionCatalogo[] = principales.map((principal) => ({
    id: principal.id,
    nombre: principal.nombre,
    productos: productosDe(principal.id),
    subsecciones: hijasDe(principal.id).map((hija) => ({
      id: hija.id,
      nombre: hija.nombre,
      productos: productosDe(hija.id),
    })),
  }));

  // Ningún producto se pierde: los que no tienen sección (o apuntan a una que
  // ya no existe) van juntos a «otros».
  const idsConocidos = new Set(secciones.map((seccion) => seccion.id));
  const sueltos = productos.filter(
    (producto) => producto.seccion_id === null || !idsConocidos.has(producto.seccion_id),
  );

  if (sueltos.length) {
    arbol.push({
      id: 0,
      nombre: SECCION_SIN_ASIGNAR,
      productos: sueltos,
      subsecciones: [],
    });
  }

  return { secciones: arbol.filter(conProductos) };
}

/**
 * Formato antiguo `{ "secciones": ["equipos"], "equipos": [...] }`: cada clave
 * hermana de `secciones` es una sección plana (sin subcategorías).
 */
function normalizarFormatoPorClaves(bruto: Record<string, unknown>): Catalogo {
  const listado = (valor: unknown): ProductoServidor[] =>
    Array.isArray(valor) ? (valor as ProductoServidor[]) : [];

  const anunciadas = listado(bruto['secciones']).map((valor) => {
    if (typeof valor === 'string') return valor;
    return String((valor as unknown as SeccionServidor)?.nombre ?? valor);
  });

  const porClave = Object.keys(bruto).filter(
    (clave) =>
      clave !== 'secciones' &&
      clave !== 'productos' &&
      Array.isArray(bruto[clave]),
  );
  const nombres = [...anunciadas, ...porClave.filter((clave) => !anunciadas.includes(clave))];

  const secciones: SeccionCatalogo[] = nombres.map((nombre) => ({
    id: 0,
    nombre,
    productos: listado(bruto[nombre]).map(normalizarProducto),
    subsecciones: [],
  }));

  return { secciones: secciones.filter(conProductos) };
}

/** Convierte la respuesta de `GET /adc/productos` en un catálogo en árbol. */
export function normalizarCatalogoADC(datos: unknown): Catalogo {
  const bruto = (datos ?? {}) as Record<string, unknown>;

  return Array.isArray(bruto['productos'])
    ? normalizarFormatoActual(bruto)
    : normalizarFormatoPorClaves(bruto);
}

/** Convierte la respuesta de `GET /delys/dulces` en un catálogo de una sección. */
export function normalizarCatalogoRespaldo(datos: unknown): Catalogo {
  const bruto = (datos ?? {}) as Record<string, unknown>;
  const lista = Array.isArray(bruto['dulces'])
    ? (bruto['dulces'] as ProductoServidor[])
    : [];

  const productos = lista.map(normalizarProducto);

  return {
    secciones: productos.length
      ? [{ id: 0, nombre: 'dulces', productos, subsecciones: [] }]
      : [],
  };
}

/** Todos los productos del catálogo, en el orden de las secciones. */
export function todosLosProductos(catalogo: Catalogo): Producto[] {
  return catalogo.secciones.flatMap((seccion) => [
    ...seccion.productos,
    ...seccion.subsecciones.flatMap((sub) => sub.productos),
  ]);
}
