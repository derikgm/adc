import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { timeoutInterceptor } from './interceptors/timeout.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Rutas con path (sin `#`) + anclas: al entrar con `/#contacto` o al pulsar
    // un chip de sección, la página hace scroll hasta ese punto.
    provideRouter(
      routes,
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'top',
      }),
    ),
    // 30 segundos máximo de espera para TODAS las peticiones al servidor.
    provideHttpClient(withInterceptors([timeoutInterceptor])),
  ],
};
