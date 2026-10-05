import { HttpInterceptorFn } from '@angular/common/http';
import { timeout } from 'rxjs';

/**
 * Tope máximo de espera para cualquier petición al servidor: 30 segundos
 * (todo.md, punto 3).
 *
 * Se aplica como interceptor global, así que cubre todas las peticiones que
 * salgan de `HttpClient`, presentes y futuras, sin repetir el dato en cada
 * servicio. El servidor está en un hosting Free que duerme, así que la primera
 * llamada puede tardar; a partir de los 30 s se corta y la vista pinta su
 * mensaje de error con opción a reintentar.
 */
export const TIEMPO_ESPERA_MS = 30_000;

export const timeoutInterceptor: HttpInterceptorFn = (req, siguiente) =>
  siguiente(req).pipe(timeout(TIEMPO_ESPERA_MS));
