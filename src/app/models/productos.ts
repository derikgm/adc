/**
 * Modelo de catálogo de la tienda.
 *
 * El servidor `https://derikgm-msf-nestjs.wasmer.app` expone:
 *
 *   GET /adc/productos → {
 *     productos: [
 *       { id, nombre, precio, moneda, imagen_url, seccion_id, seccion }
 *     ],
 *     secciones: [ { id, nombre } ]
 *   }
 *
 * La tienda agrupa cada producto por su `seccion` y ordena los grupos según la
 * lista `secciones`, que es el orden que ha puesto el panel de administración.
 */

/** Producto tal y como llega del servidor, con todo aún sin normalizar. */
export interface ProductoServidor {
  id: number;
  nombre: string;
  precio: number;
  imagen_url?: string | null;
  imagen_bytes?: number | null;
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
 * - Las secciones que no lleven ningún producto no se pintan (pasaba ya antes).
 * - Lo que sobre de orden (una sección que llega por producto pero no en la
 *   lista) se queda al final, y los productos sin sección van agrupados en
 *   `SECCION_SIN_SECCION`.
 */
export function normalizarCatalogoADC(datos: unknown): Catalogo {
  const bruto = (datos ?? {}) as Record<string, unknown>;

  const anunciadas: string[] = Array.isArray(bruto['secciones'])
    ? (bruto['secciones'] as unknown[])
        .map(nombreDeSeccion)
        .filter((nombre): nombre is string => nombre !== null)
    : [];

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

  const secciones = [
    ...anunciadas.filter((nombre) => grupos.has(nombre)),
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

  return { secciones, productos };
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
