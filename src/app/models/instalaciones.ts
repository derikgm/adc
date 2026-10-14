/**
 * Modelo de las instalaciones (servicios) de ADC.
 *
 * El servidor `https://derikgm-msf-nestjs.wasmer.app` expone:
 *
 *   GET /adc/instalaciones → {
 *     instalaciones: [
 *       { id, nombre_servicio, precio, moneda, imagen_url, descripcion: string[] }
 *     ]
 *   }
 *
 * Es una tabla propia de ADC (no vive en el catálogo compartido), así que aquí
 * no hay secciones: cada instalación es un servicio suelto con su precio y una
 * lista de puntos de descripción.
 */

/** Instalación tal y como llega del servidor, con todo aún sin normalizar. */
export interface InstalacionServidor {
  id: number;
  nombre_servicio?: string | null;
  precio?: number | null;
  moneda?: string | null;
  imagen_url?: string | null;
  descripcion?: unknown;
}

/** Instalación ya lista para pintar. */
export interface Instalacion {
  id: number;
  nombre_servicio: string;
  precio: number;
  /** Código de la moneda en la que se lee `precio` (`CUP`, `USD`…). */
  moneda: string;
  imagen_url: string | null;
  /** Un texto por punto. Puede ir vacía. */
  descripcion: string[];
}

/**
 * Moneda asumida cuando el servidor no manda ninguna. Igual que en el catálogo:
 * los precios sin moneda están en pesos cubanos.
 */
export const MONEDA_POR_DEFECTO = 'CUP';

/** Normaliza una instalación suelta: precio numérico, moneda y descripción. */
export function normalizarInstalacion(bruto: InstalacionServidor): Instalacion {
  const precio = Number(bruto.precio);
  const moneda = String(bruto.moneda ?? '')
    .trim()
    .toUpperCase();

  return {
    id: Number(bruto.id),
    nombre_servicio: String(bruto.nombre_servicio ?? 'Instalación'),
    precio: Number.isFinite(precio) ? precio : 0,
    moneda: moneda || MONEDA_POR_DEFECTO,
    imagen_url: bruto.imagen_url || null,
    descripcion: lineasDe(bruto.descripcion),
  };
}

/**
 * Convierte la respuesta de `GET /adc/instalaciones` en una lista.
 *
 * Se tolera que el servidor mande las instalaciones de otra forma (sin el sobre
 * `{ instalaciones }`, o con la lista suelta): lo que importa es no romper la
 * página si el contrato cambia de forma menor.
 */
export function normalizarInstalaciones(datos: unknown): Instalacion[] {
  const bruto = (datos ?? {}) as Record<string, unknown>;
  const listado = Array.isArray(bruto['instalaciones'])
    ? (bruto['instalaciones'] as InstalacionServidor[])
    : Array.isArray(datos)
      ? (datos as InstalacionServidor[])
      : [];

  return listado.map(normalizarInstalacion);
}

/** Deja la descripción como lista de textos, sin entradas vacías ni espacios. */
function lineasDe(valor: unknown): string[] {
  if (!Array.isArray(valor)) return [];

  return valor
    .map((linea) => String(linea).trim())
    .filter((linea) => linea.length > 0);
}
