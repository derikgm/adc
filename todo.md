-[] 0. Como trabajar:

Para poder trabajar lo primero sera hacer un documento llamado working.md, en dicho documento apareceran la lista de tareas por hacer.
antes de hacer cada uno de los puntos, lo recomendable es divir cada punto (segun se vaya haciendo) en varios subpuntos los cuales se guardan en working.md junto a su contexto y como se procedera. Una vez terminado, se actualiza este documento ("todo.md"), marcando como realizado el punto echo y working.md se deja en blanco o se actualiza borrando todo su contenido y suplantandolo por el paso a paso que se realizara en el siguiente punto. una vez todo echo, actualizar working.md y dejarlo vacio hasta proximas indicaciones. por su parte, ir actualizando este documento a medida que sus puntos van siendo completados. Toda esta estrategia es devido a que pueden producirse apagones y cortes de internet, y es necesario saber cual como quedo el trabajo para poder continuarlo 

-[] 1. Agregar la foto con hero.jpg:

1. contexto:
en la direccion /mnt/6C14E0C514E092FE/Derik/Proyectos/msf-app/webs/ADC/assets/images/A usar/hero.jpg se encuentra una imagen para
ser usada como un hero en la primera seccion. Donde normalemente esta el logo en grande, se deberia de cambiar por esa imagen.
Pero hay ciertas dificultades, la imagene tiene colores muy claros y brillantes, podria chocar un poco, por lo que se recomienda poner en cierto espacio del section hero.component (digase, 50% ~ 60%) y a la izquierda o derecha colocar la informacion o el resto de componentes que habia

-[] 2. Realizar un paginado que sea: "{dominio}/tienda".

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

-[] 2.1 Agregar sping al sitio mientras carga la tienda.

2.1 Contexto: 
Debido a que el servidor esta alojado en un sitio de hosting que suele tener una politica FREE pero que duerme el programa, se requiere que se deje un Spin giratorio con un mensaje que diga: "Opteniendo Datos del servidor" en lo que el programa termina de acceder a la informacion del servidor.

-[] 2.2 Debido a que el valor de la moneda puede llegar en CUP o USD, Seria bueno que ambas monedas tuvieran un color distinto a la hora de mostrar el producto. En caso de aparecer cualquier moneda que no sea CUP o USD, deber usar el mismo color que USD. Los colores de las monedas deben de ser lo mas fiel que se pueda al diseño de color de la pagina web. Cuando se muestra un producto con su precio, debe de ir siempre en texto la moneda que usa para guiar al cliente que esta observando, algo asi como: 3000 CUP o 20 USD 

-[] 3. Establecer para toda la web, que el tiempo maximo de espera para las peticiones al servidor es una maximo de 30 segundos