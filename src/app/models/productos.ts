/**
 * Modelo de catálogo de la tienda.
 *
 * El servidor `https://derikgm-msf-nestjs.wasmer.app` expone:
 *
 *   GET /adc/productos → {
 *     productos: [
 *       { id, nombre, precio, moneda, imagen_url, seccion_id, seccion }
 *     ],
 *     secciones: [ { id, nombre, padre_id } ]
 *   }
 *
 * La tienda agrupa cada producto por su `seccion` y ordena los grupos según la
 * lista `secciones`, que es el orden que ha puesto el panel de administración.
 * `padre_id` dice si esa sección es una categoría principal (`null`) o una
 * subcategoría colgando de otra; de ahí sale `categorias`.
 */

/** Producto tal y como llega del servidor, con todo aún sin normalizar. */
export interface ProductoServidor {
  id: number;
  nombre: string;
  precio: number;
  imagen_url?: string | null;
  moneda?: string | null;
  /**
   * Sección del producto. `GET /adc/productos` manda el nombre (`"electronico"`)
   * y `GET /delys/dulces` manda la sección entera (`{ id, nombre }`): se
   * entienden las dos formas, y si no viene nada queda `null`.
   */
  seccion?: string | { id?: number; nombre?: string } | null;
  seccion_id?: number | null;
}

/** Producto ya listo para pintar. */
export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  imagen_url: string | null;
  moneda: string;
  /** Nombre de la sección a la que pertenece; `null` si está sin asignar. */
  seccion: string | null;
  /** Id de esa sección, por si hay que enlazar con ella. */
  seccion_id: number | null;
}

/** Catálogo agrupado por secciones. */
export interface Catalogo {
  /** Orden en que el servidor quiere que se muestren las secciones. */
  secciones: string[];
  /** Productos de cada sección, usando el mismo nombre que en `secciones`. */
  productos: Record<string, Producto[]>;
  /**
   * Las mismas secciones pero en árbol: categorías principales con sus
   * subcategorías colgando. Se saca de `padre_id`, que el servidor manda en
   * `secciones`; cuando no lo manda (respolds antiguos, `/delys/dulces`) todo
   * queda como categoría principal y el árbol equivale a la lista plana.
   */
  categorias: Categoria[];
}

/**
 * Una categoría de la tienda. `productos` son solo los asignados a ella misma;
 * los de las subcategorías viven en `subcategorias`, sin subir al padre.
 */
export interface Categoria {
  id: number | null;
  nombre: string;
  productos: Producto[];
  subcategorias: Categoria[];
}

/**
 * Moneda asumida cuando el servidor no manda ninguna. Los precios que vienen
 * sin moneda (por ejemplo los del respaldo `/delys/dulces`) están en pesos
 * cubanos.
 */
export const MONEDA_POR_DEFECTO = 'CUP';

/**
 * Rótulo del grupo de los productos que llegan sin sección asignada. Mejor
 * salir etiquetados en la tienda que desaparecer del catálogo.
 */
export const SECCION_SIN_SECCION = 'Sin sección';

/** Normaliza un producto suelto: precio numérico, moneda y sección listas. */
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
    seccion: nombreDeSeccion(bruto.seccion),
    seccion_id: typeof bruto.seccion_id === 'number' ? bruto.seccion_id : null,
  };
}

/**
 * Convierte la respuesta de `GET /adc/productos` en un catálogo.
 *
 * Quién manda es el servidor: el **orden** lo dicta la lista `secciones` y la
 * **pertenencia** la `seccion` de cada producto. De ahí salen tres reglas:
 *
 * - Se agrupa por la sección del producto, no por las claves del objeto: así no
 *   se pierde ninguno aunque su sección no figure en la lista.
 * - Las secciones que no lleven ningún producto no se pintan (pasaba ya antes),
 *   salvo la categoría principal de una subcategoría que sí los tenga.
 * - Lo que sobre de orden (una sección que llega por producto pero no en la
 *   lista) se queda al final, y los productos sin sección van agrupados en
 *   `SECCION_SIN_SECCION`.
 */
export function normalizarCatalogoADC(datos: unknown): Catalogo {
  const bruto = (datos ?? {}) as Record<string, unknown>;

  const anuncio = Array.isArray(bruto['secciones'])
    ? (bruto['secciones'] as unknown[]).map(leerSeccion)
    : [];

  const anunciadas = anuncio
    .map((seccion) => seccion.nombre)
    .filter((nombre): nombre is string => nombre !== null);

  const listado = Array.isArray(bruto['productos'])
    ? (bruto['productos'] as ProductoServidor[])
    : [];

  const grupos = new Map<string, Producto[]>();
  const sueltos: Producto[] = [];

  for (const producto of listado.map(normalizarProducto)) {
    if (!producto.seccion) {
      sueltos.push(producto);
      continue;
    }

    const grupo = grupos.get(producto.seccion);
    if (grupo) grupo.push(producto);
    else grupos.set(producto.seccion, [producto]);
  }

  // Categorías que sí se pintan aunque no lleven productos propios: aquellas de
  // las que cuelga alguna subcategoría con productos. Sin esto, «electronico»
  // desaparecía de la tienda y sus subcategorías quedaban huérfanas.
  const padresConProductos = new Set<number>();
  for (const seccion of anuncio) {
    if (seccion.nombre !== null && seccion.padreId !== null && grupos.has(seccion.nombre)) {
      padresConProductos.add(seccion.padreId);
    }
  }

  const secciones = [
    ...anuncio
      .filter(
        (seccion) =>
          seccion.nombre !== null &&
          (grupos.has(seccion.nombre) ||
            (seccion.id !== null && padresConProductos.has(seccion.id))),
      )
      .map((seccion) => seccion.nombre as string),
    ...[...grupos.keys()].filter((nombre) => !anunciadas.includes(nombre)),
  ];

  const productos: Record<string, Producto[]> = {};
  for (const nombre of secciones) productos[nombre] = grupos.get(nombre) ?? [];

  if (sueltos.length) {
    if (!secciones.includes(SECCION_SIN_SECCION)) secciones.push(SECCION_SIN_SECCION);
    productos[SECCION_SIN_SECCION] = [
      ...(productos[SECCION_SIN_SECCION] ?? []),
      ...sueltos,
    ];
  }

  return { secciones, productos, categorias: armarCategorias(anuncio, secciones, productos) };
}

/**
 * Arma el árbol de categorías y subcategorías respetando `orden`, que es la
 * lista —ya filtrada— que decidió la normalización.
 *
 * La pertenencia se resuelve por **nombre** porque los grupos están indexados
 * así. Si el `padre_id` apunta a una sección que no está en la lista, o a otra
 * subcategoría, el nodo se queda como categoría principal: en la web nunca debe
 * desaparecer un producto por tener un enlace raro.
 */
function armarCategorias(
  anuncio: SeccionLeida[],
  orden: string[],
  productos: Record<string, Producto[]>,
): Categoria[] {
  const nombrePorId = new Map<number, string>();
  for (const seccion of anuncio) {
    if (seccion.id !== null && seccion.nombre !== null) nombrePorId.set(seccion.id, seccion.nombre);
  }

  const padrePorNombre = new Map<string, string>();
  for (const seccion of anuncio) {
    if (seccion.nombre === null || seccion.padreId === null) continue;
    const padre = nombrePorId.get(seccion.padreId);
    if (padre && padre !== seccion.nombre) padrePorNombre.set(seccion.nombre, padre);
  }

  const nodos = new Map<string, Categoria>();
  for (const nombre of orden) {
    const idAnunciado = anuncio.find((seccion) => seccion.nombre === nombre)?.id ?? null;
    // Sin id en la lista se recupera de un producto del grupo (valen el mismo).
    const grupo = productos[nombre] ?? [];
    const id = idAnunciado ?? grupo[0]?.seccion_id ?? null;
    nodos.set(nombre, { id, nombre, productos: grupo, subcategorias: [] });
  }

  const raices: Categoria[] = [];
  for (const nombre of orden) {
    const nodo = nodos.get(nombre)!;
    const nombreDelPadre = padrePorNombre.get(nombre);
    const padre = nombreDelPadre ? nodos.get(nombreDelPadre) : undefined;

    // Un nivel nada más: si el padre es a su vez subcategoría, se pinta suelto.
    if (padre && !padrePorNombre.has(padre.nombre)) padre.subcategorias.push(nodo);
    else raices.push(nodo);
  }

  return raices;
}

/** Sección de la lista `secciones`, con el enlace a su padre ya leído. */
interface SeccionLeida {
  nombre: string | null;
  id: number | null;
  padreId: number | null;
}

/** Lee una sección anunciada, venga como nombre suelto o como objeto. */
function leerSeccion(valor: unknown): SeccionLeida {
  const numero = (campo: string): number | null => {
    if (typeof valor !== 'object' || valor === null) return null;
    const bruto = (valor as Record<string, unknown>)[campo];
    return typeof bruto === 'number' ? bruto : null;
  };

  return {
    nombre: nombreDeSeccion(valor),
    id: numero('id'),
    padreId: numero('padre_id') ?? numero('parent_id'),
  };
}

/**
 * Nombre de la sección, venga como venga. Si no hay ninguno, `null`.
 */
function nombreDeSeccion(valor: unknown): string | null {
  if (typeof valor === 'string') return valor.trim() || null;

  if (typeof valor === 'object' && valor !== null) {
    const nombre = (valor as { nombre?: unknown }).nombre;
    if (typeof nombre === 'string') return nombre.trim() || null;
  }

  return null;
}

/** Todos los productos del catálogo, en el orden de las secciones. */
export function todosLosProductos(catalogo: Catalogo): Producto[] {
  return catalogo.secciones.flatMap((seccion) => catalogo.productos[seccion] ?? []);
}
