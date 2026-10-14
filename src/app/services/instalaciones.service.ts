import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Instalacion, normalizarInstalaciones } from '../models/instalaciones';
import { SERVIDOR } from './productos.service';

const MENSAJE_TIEMPO_AGOTADO =
  'El servidor tardó más de 30 segundos en responder. Inténtalo de nuevo.';
const MENSAJE_ERROR = 'No se pudieron obtener las instalaciones del servidor.';

/** Milisegundos que aguantan las instalaciones en memoria antes de repedirlas. */
const TIEMPO_DE_VIDA = 60_000;

/**
 * Carga y guarda las instalaciones (servicios) de ADC.
 *
 * Mismo patrón que `ProductosService`: es único para toda la app, la primera
 * carga espera al servidor —de ahí el spinner— y el resultado se queda en
 * memoria, así que no se vuelve a pedir en cada render. Los errores quedan como
 * estado para que la vista pinte el mensaje y su botón de reintento.
 *
 * Solo se pide `GET /adc/instalaciones`, que es público.
 */
@Injectable({ providedIn: 'root' })
export class InstalacionesService {
  private readonly http = inject(HttpClient);

  readonly instalaciones = signal<Instalacion[] | null>(null);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);

  /** Instante (Date.now()) en que se guardó lo que hay en memoria. */
  private cargadoEn = 0;

  /**
   * (Re)carga las instalaciones. No hace nada si hay una petición en curso, o
   * si ya están cargadas y frescas (menos de un minuto), para que la vista lo
   * pueda llamar en su constructor sin duplicar peticiones.
   */
  cargar(): void {
    if (this.cargando()) return;
    if (this.instalaciones() && Date.now() - this.cargadoEn < TIEMPO_DE_VIDA) return;

    this.cargando.set(true);
    this.error.set(null);

    this.pedirInstalaciones().subscribe({
      next: (instalaciones) => {
        this.instalaciones.set(instalaciones);
        this.cargadoEn = Date.now();
        this.cargando.set(false);
      },
      error: (error) => {
        this.error.set(mensajeDeError(error));
        this.cargando.set(false);
      },
    });
  }

  private pedirInstalaciones(): Observable<Instalacion[]> {
    return this.http
      .get<unknown>(`${SERVIDOR}/adc/instalaciones`)
      .pipe(map(normalizarInstalaciones));
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
