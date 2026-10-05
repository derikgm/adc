import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import {
  Catalogo,
  Producto,
  normalizarCatalogoADC,
  normalizarCatalogoRespaldo,
  todosLosProductos,
} from '../models/productos';

/** Dirección del servidor (msf-nestjs). */
export const SERVIDOR = 'https://derikgm-msf-nestjs.wasmer.app';

/**
 * `true` mientras `GET /adc/productos` siga sin existir en el servidor: se cae
 * a `GET /delys/dulces` (catálogo de practica) para poder ver la tienda ya.
 * Ponerlo en `false` en cuanto el endpoint de ADC esté programado.
 */
const USAR_RESPALDO = true;

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
    return this.http.get<unknown>(`${SERVIDOR}/adc/productos`).pipe(
      map(normalizarCatalogoADC),
      catchError((error) => this.respaldo(error)),
    );
  }

  /**
   * Respaldo: solo ante un 404, que es lo que responde el servidor mientras
   * `/adc/productos` no esté programado. El resto de fallos (500, timeout…)
   * se dejan propagar para no enseñar productos que no son de ADC.
   */
  private respaldo(error: unknown): Observable<Catalogo> {
    if (!USAR_RESPALDO || !esStatus(error, 404)) return throwError(() => error);

    return this.http
      .get<unknown>(`${SERVIDOR}/delys/dulces`)
      .pipe(map(normalizarCatalogoRespaldo));
  }
}

function esStatus(error: unknown, status: number): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { status?: number }).status === status
  );
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
