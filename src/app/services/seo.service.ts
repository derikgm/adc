import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Meta } from '@angular/platform-browser';

/** URL pública del sitio (GitHub Pages). */
export const URL_SITIO = 'https://derikgm.github.io/adc';

export interface PaginaSeo {
  titulo: string;
  descripcion: string;
  /** Fragmento de ruta: `/` o `/tienda`. */
  ruta: string;
  /** Imagen para los previews sociales (URL absoluta). */
  imagen?: string;
  /** Datos estructurados (schema.org) en JSON-LD. */
  jsonLd?: object;
}

/**
 * SEO por ruta: description, Open Graph, canonical y JSON-LD. Cada página
 * llama a `fijar()` desde su constructor (o un effect) y el `<head>` queda
 * coherente aunque sea una SPA sin prerendering.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly documento = inject(DOCUMENT);
  private readonly meta = inject(Meta);

  fijar(pagina: PaginaSeo): void {
    const url = URL_SITIO + (pagina.ruta === '/' ? '/' : pagina.ruta);

    this.meta.updateTag({ name: 'description', content: pagina.descripcion });
    this.meta.updateTag({ property: 'og:title', content: pagina.titulo });
    this.meta.updateTag({
      property: 'og:description',
      content: pagina.descripcion,
    });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:locale', content: 'es_ES' });
    this.meta.updateTag({ property: 'og:site_name', content: 'ADC' });
    if (pagina.imagen) {
      this.meta.updateTag({ property: 'og:image', content: pagina.imagen });
      this.meta.updateTag({ property: 'og:image:alt', content: pagina.titulo });
    }

    this.fijarCanonical(url);
    this.fijarJsonLd(pagina.jsonLd);
  }

  private fijarCanonical(url: string): void {
    let enlace = this.documento.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );
    if (!enlace) {
      enlace = this.documento.createElement('link');
      enlace.setAttribute('rel', 'canonical');
      this.documento.head.appendChild(enlace);
    }
    enlace.setAttribute('href', url);
  }

  private fijarJsonLd(datos?: object): void {
    const anterior = this.documento.querySelector<HTMLScriptElement>(
      'script[data-seo-jsonld]',
    );
    anterior?.remove();
    if (!datos) return;

    const script = this.documento.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-seo-jsonld', '');
    script.textContent = JSON.stringify(datos);
    this.documento.head.appendChild(script);
  }
}