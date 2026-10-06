# ADC

Tienda de artículos y servicios eléctricos. Angular 22 + Tailwind CSS 4.

## Development server

```bash
npm start
```

Abre `http://localhost:4200/`. La app se recarga automáticamente al modificar archivos.

## Build

```bash
npm run build
```

Los artefactos se generan en `dist/ADC/browser/`.

## Deploy (GitHub Pages)

```bash
npm run deploy
```

Ejecuta `ng deploy`: compila en modo producción (aplicando el `baseHref` de
`build.configurations.production`) y sube `dist/ADC/browser` a la rama
`gh-pages` de este repositorio, que es la que publica GitHub Pages.

El `baseHref` es `/adc/` **en minúsculas**: con `/ADC/` la app no carga, porque el
navegador pediría los `.js` en la raíz del sitio (`derikgm.github.io/main-….js`),
GitHub Pages devolvería su 404 como `text/html` y el navegador bloquearía el módulo
con *"tipo MIME no permitido"*.

La app usa rutas con hash (`withHashLocation()`), así que no necesita un `404.html`
de respaldo para rutas profundas; aun así `angular-cli-ghpages` lo genera.

> ⚠️ Nunca publiques una carpeta `dist/` vieja: `npm run deploy` reconstruye desde el
> código actual. Si quieres estar seguro, borra `dist/` antes (`rm -rf dist`).

## Tests

```bash
npm test
```

## Estructura

```
assets/images/            # ORIGINALES del usuario (no se tocan)
├── A usar/               # logo + fotos de brigada
├── ADC Energía solar/
└── Brigada/

public/                   # favicon
src/
├── app/
│   ├── app.ts                      # Shell raíz
│   ├── app.config.ts
│   ├── app.routes.ts
│   └── components/
│       ├── header.component.ts
│       ├── footer.component.ts
│       └── sections/
│           ├── hero.component.ts
│           ├── instalaciones.component.ts
│           └── placeholder.component.ts
├── assets/
│   └── images/            # imágenes optimizadas para web (las que usa la app)
└── styles.css             # tema de color (@theme)
```

## Imágenes

Las imágenes que usa la app viven en `src/assets/images/` y son copias optimizadas
de `assets/images/A usar/`:

| Archivo         | Origen                  | Peso   |
| --------------- | ----------------------- | ------ |
| `logo.jpg`      | `Logo.jpg`              | 0.08 MB |
| `brigada-01..06.jpg` | `brigrada - 01..06.jpg` | 1.34 MB |

Optimizadas de 23 MB a 1.42 MB (redimensionadas a 1600 px, JPEG progresivo q80).
Los originales quedan intactos en `assets/images/`.

## Tema de color

Definido en `src/styles.css` con `@theme static` de Tailwind 4. Los valores
base se extrajeron del logo (`src/assets/images/logo.jpg`):

**Azules**

| Token      | Hex       | Origen                    |
| ---------- | --------- | ------------------------- |
| `navy-500` | `#0145d4` | azul eléctrico del logo   |
| `navy-800` | `#233961` | navy medio                |
| `navy-900` | `#0a162c` | navy oscuro               |
| `navy-950` | `#020d1f` | navy muy oscuro           |

**Dorados**

| Token      | Hex       | Origen                    |
| ---------- | --------- | ------------------------- |
| `gold-100` | `#fef5c0` | crema                     |
| `gold-300` | `#fedc19` | dorado vivo (acento)      |
| `gold-500` | `#c2a131` | dorado antiguo            |
| `gold-700` | `#986823` | bronce                    |

**Negro** — `ink` = `#000000`, el fondo del logo.

Uso: `bg-navy-950`, `text-gold-300`, `bg-ink`, `border-navy-800/60`.

> **Nota sobre el logo:** `logo.jpg` tiene fondo negro puro. El header, hero y
> footer usan `bg-ink` para que se funda con el fondo. No aplicar
> `mix-blend-mode: screen` al logo: apagaría los tonos navy (`#233961`,
> `#0a162c`) que son parte del diseño.
"# adc" 
