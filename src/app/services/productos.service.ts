import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, map } from 'rxjs';
import {
  Catalogo,
  Producto,
  normalizarCatalogoADC,
  todosLosProductos,
} from '../models/productos';

/** Dirección del servidor (msf-nestjs). */
export const SERVIDOR = 'https://derikgm-msf-nestjs.wasmer.app';

const MENSAJE_TIEMPO_AGOTADO =
  'El servidor tardó más de 30 segundos en responder. Inténtalo de nuevo.';
const MENSAJE_ERROR = 'No se pudieron obtener los datos del servidor.';

/**
 * Carga y guarda el catálogo de la tienda.
 *
 * Es único para toda la app (providedIn: 'root'): la primera carga espera al
 * servidor —de ahí el spinner— y el resultado se queda en memoria, así que al
 * pasar del home a `/tienda` no vuelve a esperar. Los errores quedan como
 * estado para que la vista pinte el mensaje y su botón de reintento.
 *
 * Solo se pide `GET /adc/productos`. Antes existía un respaldo que, ante un
 * `404`, caía a `GET /delys/dulces` (catálogo de práctica, de cuando esta ruta
 * no estaba programada): se quitó en cuanto el endpoint de ADC existió, porque
 * **enseñar productos de otro negocio es peor que un error**, y un error se
 * puede reintentar.
 */
@Injectable({ providedIn: 'root' })
export class ProductosService {
  private readonly http = inject(HttpClient);

  readonly catalogo = signal<Catalogo | null>(null);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);

  /** Primeros `n` productos de todo el catálogo, para la vista previa del home. */
  primerosProductos(n: number): Producto[] {
    const catalogo = this.catalogo();
    return catalogo ? todosLosProductos(catalogo).slice(0, n) : [];
  }

  /**
   * (Re)carga el catálogo. No hace nada si ya está cargado o si hay una
   * petición en curso, así que cada vista lo puede llamar en su constructor
   * sin duplicar peticiones.
   */
  cargar(): void {
    if (this.cargando() || this.catalogo()) return;

    this.cargando.set(true);
    this.error.set(null);

    this.pedirCatalogo().subscribe({
      next: (catalogo) => {
        this.catalogo.set(catalogo);
        this.cargando.set(false);
      },
      error: (error) => {
        this.error.set(mensajeDeError(error));
        this.cargando.set(false);
      },
    });
  }

  private pedirCatalogo(): Observable<Catalogo> {
    return this.http
      .get<unknown>(`${SERVIDOR}/adc/productos`)
      .pipe(map(normalizarCatalogoADC));
  }
}

/** El timeout global de 30 s llega como TimeoutError de RxJS. */
function esTiempoAgotado(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { name?: string }).name === 'TimeoutError'
  );
}

function mensajeDeError(error: unknown): string {
  return esTiempoAgotado(error) ? MENSAJE_TIEMPO_AGOTADO : MENSAJE_ERROR;
}
