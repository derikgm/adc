-[x] 0. Como trabajar:

Para poder trabajar lo primero sera hacer un documento llamado working.md, en dicho documento apareceran la lista de tareas por hacer.
antes de hacer cada uno de los puntos, lo recomendable es divir cada punto (segun se vaya haciendo) en varios subpuntos los cuales se guardan en working.md junto a su contexto y como se procedera. Una vez terminado, se actualiza este documento ("todo.md"), marcando como realizado el punto echo y working.md se deja en blanco o se actualiza borrando todo su contenido y suplantandolo por el paso a paso que se realizara en el siguiente punto. una vez todo echo, actualizar working.md y dejarlo vacio hasta proximas indicaciones. por su parte, ir actualizando este documento a medida que sus puntos van siendo completados. Toda esta estrategia es devido a que pueden producirse apagones y cortes de internet, y es necesario saber cual como quedo el trabajo para poder continuarlo 

-[x] 1. Agregar la foto con hero.jpg:

1. contexto:
en la direccion /mnt/6C14E0C514E092FE/Derik/Proyectos/msf-app/webs/ADC/assets/images/A usar/hero.jpg se encuentra una imagen para
ser usada como un hero en la primera seccion. Donde normalemente esta el logo en grande, se deberia de cambiar por esa imagen.
Pero hay ciertas dificultades, la imagene tiene colores muy claros y brillantes, podria chocar un poco, por lo que se recomienda poner en cierto espacio del section hero.component (digase, 50% ~ 60%) y a la izquierda o derecha colocar la informacion o el resto de componentes que habia

1. resultado (hecho):
- `hero.jpg` copiado a `src/assets/images/hero.jpg` (el build solo publica `src/assets` y `public`, la carpeta `assets/` de la raíz no llega al navegador).
- El hero pasó a `md:grid-cols-5`: el texto ocupa 40 % a la izquierda y la foto 60 % a la derecha; en móvil la foto queda debajo del texto. La foto lleva dos degradados que la funden con `bg-ink` por el borde que toca el texto y por abajo, para que su claridad no choque. El logo grande desapareció del hero (sigue en header y footer).
- Sin `mix-blend-mode`, como avisa `styles.css`.

- [x] 2. Realizar un paginado que sea: "{dominio}/tienda".

2. contexto: 
Mi cliente quiere que cuando las personas la contacten pidiendo informacion por los productos, ella pueda darle sencillamente el enlace y ellos lo vean por si mismo. no obstante, darle el enlace de la pagina completa seria engorroso cuando queres que solo vea los prodctos, por ende, en el main, solo aparecera los 5 primeros (o menos) productos de todo el sistema. Este se conseguiran en un servidor con direccion: "https://derikgm-msf-nestjs.wasmer.app". La direccion seria: GET /adc/productos. Dicha seccion del servidor todavia no esta programada todavia, asi que toca esperar. No obstante, se puede practicar con este endpoint: GET /delys/dulces .que devuelve lo siguiente:

```json
{
  "dulces": [
    { "id": 1, "nombre": "Charolas surtida", "precio": 1000, "imagen_url": "url_a_la_imagen", "imagen_bytes": null }
    //...
  ]
}
```

En el section donde apareceran una vista previa de productos, debera aparecer un boton que lo lleve directamente a la ruta /tienda.
El estilo de dicha ruta /tienda sera muy similar a esta pagina: https://elyerromenu.com/. Para mas informacion, se puede navegar en ella. El endpoint cuando este programado devera de devolver algo como esto:

```json
{
  "secciones:" : [
  	"equipos",
  	"aseo",
  	//...
  ],
  "equipos": [
    { "id": 1, "nombre": "nombre_equipo", "precio": 1000, "imagen_url": "url_a_la_imagen", "imagen_bytes": null, "moneda": "CUP" }
  ],
   "aseo": [
    { "id": 2, "nombre": "nombre_aseo", "precio": 1000, "imagen_url": "url_a_la_imagen", "imagen_bytes": null, "moneda": "USD" }
  ],

   //...
}
```

2. resultado (hecho):
- Ruta `/tienda` con ubicación por path: se quitó `withHashLocation()` para que el enlace quede tal cual `{dominio}/tienda`. Rutas en `src/app/app.routes.ts`: `'' → pages/home.page.ts` y `tienda → pages/tienda.page.ts`.
- `app.ts` quedó con header + `<router-outlet>` + footer; el contenido del home pasó a `src/app/pages/home.page.ts`.
- El menú «Tienda» del header y el botón «Ir a la tienda» del hero apuntan ahora a `/tienda`; el resto del menú vuelve al inicio con su ancla, para que funcione también desde la tienda.
- `src/app/services/productos.service.ts` pide `GET /adc/productos`. **Ese endpoint sigue sin existir en msf-nestjs (devuelve 404)**, así que mientras tanto cae automáticamente a `GET /delys/dulces` y lo convierte en un catálogo de una sola sección. En cuanto se programe `/adc/productos` se usará solo: hay que poner `USAR_RESPALDO = false` en ese archivo (la constante está comentada ahí). Cualquier otro fallo (500, timeout) NO usa el respaldo: muestra el error y el botón de reintento, para no enseñar productos que no son de ADC.
- Vista previa en el home (section#tienda): hasta 5 productos de todo el catálogo + botón «Ver toda la tienda» → `/tienda`.
- Página `/tienda` (`src/app/pages/tienda.page.ts`): barra de secciones fija bajo el header con salto a cada una, un título por sección y cuadrícula de tarjetas, con el aire de elyerromenu.com.
- Tarjeta de producto nueva: `src/app/components/producto-card.component.ts`.
- Nota de despliegue: el hosting estático debe saber enrutar (fallback al index) para que `{dominio}/tienda` abierto directamente no dé 404. En GitHub Pages se resuelve copiando el `index.html` compilado a `404.html` (así está en Delys); en el repo de ADC todavía no hay Pages activado, así que se deja anotado para cuando se publique.
- Comprobado con `npm run build`, `npx ng test` (6 tests en `productos.service.spec.ts` y `tienda.page.spec.ts`: respaldo 404, reintento, copy en memoria, corte a los 30 s, y render de la vista previa y de la página `/tienda`) y `ng serve` (responden `/`, `/tienda` y `/assets/images/hero.jpg`).

- [x] 2.1 Agregar sping al sitio mientras carga la tienda.

2.1 Contexto: 
Debido a que el servidor esta alojado en un sitio de hosting que suele tener una politica FREE pero que duerme el programa, se requiere que se deje un Spin giratorio con un mensaje que diga: "Opteniendo Datos del servidor" en lo que el programa termina de acceder a la informacion del servidor.

2.1 resultado (hecho): spinner reutilizable en `src/app/components/cargando.component.ts` (giro dorado + «Obteniendo datos del servidor…»), que se muestra en la vista previa del home y en `/tienda` mientras el servidor responde. Si la petición falla o se corta a los 30 s, en su lugar se pinta el mensaje de error con botón «Reintentar».

- [x] 2.2 Debido a que el valor de la moneda puede llegar en CUP o USD, Seria bueno que ambas monedas tuvieran un color distinto a la hora de mostrar el producto. En caso de aparecer cualquier moneda que no sea CUP o USD, deber usar el mismo color que USD. Los colores de las monedas deben de ser lo mas fiel que se pueda al diseño de color de la pagina web. Cuando se muestra un producto con su precio, debe de ir siempre en texto la moneda que usa para guiar al cliente que esta observando, algo asi como: 3000 CUP o 20 USD 

2.2 resultado (hecho): la tarjeta (`src/app/components/producto-card.component.ts`) pinta el precio siempre con la moneda escrita, «3000 CUP» o «20 USD». CUP se muestra en `gold-300` (#fedc19, el dorado del logo) y cualquier otra moneda —USD y las desconocidas— en `navy-300` (#76a0e9, tinte del azul eléctrico #0145d4, que es legible sobre el fondo navy-950; el azul puro #0145d4 se queda corto de contraste). Si el servidor no manda moneda, se asume CUP.

- [x] 3. Establecer para toda la web, que el tiempo maximo de espera para las peticiones al servidor es una maximo de 30 segundos

3. resultado (hecho): `src/app/interceptors/timeout.interceptor.ts` aplica un `timeout(30000)` a TODAS las peticiones de `HttpClient`; se registra una sola vez en `app.config.ts` con `provideHttpClient(withInterceptors([timeoutInterceptor]))`, así que cubre el presente y lo futuro. Al agotarse, la vista muestra «El servidor tardó más de 30 segundos en responder. Inténtalo de nuevo.» con su botón de reintento (comprobado en el test de `productos.service.spec.ts`).

-[] 4. Quitar el botón «Cotizar» del header y poner un botón flotante de WhatsApp:

4. contexto:
Petición nueva del cliente (no estaba en la lista original).
- El botón «Cotizar» que está a la derecha del header debe desaparecer.
- En su lugar, un botón flotante en la esquina inferior derecha, visible en todas las páginas, con el icono de WhatsApp, que abra directamente la aplicación de WhatsApp con este número: "59061926" (https://wa.me/59061926).
- Que no lleve el verde brillante de WhatsApp: su color debe ir en concordancia con la página web (dorado y navy del logo).

4. resultado (hecho):
- Se borró el bloque «Cotizar» de `header.component.ts` y el menú quedó centrado (`mx-auto`) para que el hueco no se note.
- Nuevo componente `src/app/components/whatsapp-button.component.ts`: círculo fijo abajo a la derecha (`fixed bottom-6 right-6 z-50`) en dorado `gold-300` con el icono en navy `ink` (el mismo tratamiento que los demás CTA de la web, nada de verde WhatsApp), borde y sombra navy, y `hover:scale-110`.
- El enlace es `https://wa.me/59061926` con `target="_blank"` + `rel="noopener"`, `aria-label` y `title`. El número está en una constante (`NUMERO_WHATSAPP`) para cambiarlo sin tocar el template.
- Se monta en `app.ts`, así que se ve en el home y en `/tienda`.
- Test nuevo `whatsapp-button.component.spec.ts`: comprueba el enlace, el target, los colores y que «Cotizar» ya no aparece en el header (siguen estando los 5 menús).

- [x] 5. Cambiar el hero: hero.jpg como fondo de toda la sección:

5. contexto:
Petición nueva del cliente.
- La foto dentro de su contenedor a un lado no logra verse bien, y en teléfono se ve bastante fea.
- Ahora hero.jpg debe verse en TODA la sección hero como imagen de fondo.
- El contenedor con la información (título, texto y los botones «Ver instalaciones» / «Ir a la tienda») va encima de esa foto, ajustado a su color, con un fondo medio negro porque la imagen es bastante brillante y si no no se logra ver todo.
- Ese contenedor, en vez de estar a la izquierda, debe estar a la DERECHA.

5. resultado (hecho):
- `hero.component.ts` reescrito: la sección es `relative overflow-hidden bg-ink` y `hero.jpg` pasa a `<img>` absoluto (`inset-0 h-full w-full object-cover object-center`, decorativa con `alt=""` y `aria-hidden`) → la foto cubre **toda** la sección, ya no tiene contenedor propio ni `aspect-[4/3]`.
- Velo encima: `bg-gradient-to-t from-ink/85 via-ink/40 to-ink/30`, que baja el brillo del cielo para que se lea todo y funde el borde inferior con la sección siguiente.
- El contenedor de la información va a la derecha (`flex justify-end` dentro de `container-adc`) con fondo medio negro: `bg-ink/75` + `backdrop-blur-sm` + borde navy + `max-w-xl` (en móvil ocupa todo el ancho). Sumado al velo, dentro del panel la foto queda al ~85-95 % de negro: texto blanco legible y la foto sigue asomando por fuera del panel.
- Contenido intacto: pill, «ADC», párrafo y botones «Ver instalaciones» (`#instalaciones`) e «Ir a la tienda» (`/tienda`).
- Test nuevo `hero.component.spec.ts` (la foto de fondo de toda la sección y el panel a la derecha con sus botones). Verificado con `npm run build` y `npx ng test`: **10 tests en verde en 4 ficheros**.

- [x] 6. Modificar la pagina web adc: la tienda, repartida por secciones

6. contexto (viene de `/todo.md`, punto 1): `GET /adc/productos` ya está
programado y devuelve más cosas que con las que se trabajaba:

```jsonc
{
  "productos": [ { "id": 7, "nombre": "Inversor 1500W", "precio": 18500,
                   "moneda": "CUP", "imagen_url": null,
                   "seccion_id": 4, "seccion": "electronico" } ],
  "secciones": [ { "id": 4, "nombre": "electronico" } ]
}
```

La intención es que en la tienda aparezcan los productos **divididos por las
secciones que llegan**. Esta web seguía escrita para el contrato anterior
(`{ "secciones": ["equipos"], "equipos": [...] }`), así que con el formato nuevo
salía un rótulo `[object Object]` y todo el catálogo bajo uno solo llamado
`productos`.

6. resultado (hecho):
- `src/app/models/productos.ts`: `Producto` gana `seccion: string | null` y
  `seccion_id: number | null`; `normalizarCatalogoADC()` agrupa cada producto
  por su `seccion` y respeta el orden de la lista `secciones`; `nombreDeSeccion()`
  entiende tanto el texto (`"electronico"`) como el objeto (`{ id, nombre }`) que
  manda `GET /delys/dulces`. Las secciones vacías no se pintan y lo que sobre de
  orden se queda al final; los productos sin sección van agrupados en
  «Sin sección» (`SECCION_SIN_SECCION`).
- `src/app/services/productos.service.ts`: fuera el respaldo a `GET /delys/dulces`
  (`USAR_RESPALDO`), que era un apaño de cuando esta ruta no existía: ahora un
  `404` se enseña como error con su «Reintentar» en vez de colar los productos de
  Delys en la tienda de ADC.
- Specs actualizados al contrato nuevo (`productos.service.spec.ts`,
  `tienda.page.spec.ts`) más uno nuevo para el caso de producto suelto y sección
  vacía. Verificado con `npm run build`, `npx tsc -p tsconfig.spec.json --noEmit`
  y `npx ng test`: **11 tests en verde en 4 ficheros**.
- Prueba con datos reales (backend local + Postgres en Docker): 2 secciones y 3
  productos creados desde el panel por API; la respuesta real pasada por
  `normalizarCatalogoADC()` deja la tienda en
  `["herramientas","paneles solares"]` con cada producto en su sitio.
- Ojo: un producto dado de alta **sin `seccion_id`** cae en la sección `dulces`
  de ADC y `GET /adc/productos` **no lo devuelve**, así que no sale en la tienda
  (comprobado: de 4 creados, 3 visibles).