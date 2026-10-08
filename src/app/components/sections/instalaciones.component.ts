import {
  Component,
  ElementRef,
  OnDestroy,
  afterNextRender,
  computed,
  signal,
  viewChild,
} from '@angular/core';

interface Slide {
  src: string;
  alt: string;
}

/** Segundos que tarda un grupo de imágenes en recorrer la cinta. */
const SEGUNDOS_POR_GRUPO = 45;

@Component({
  selector: 'app-instalaciones',
  standalone: true,
  template: `
    <section id="instalaciones" class="scroll-mt-16 bg-navy-900 py-20">
      <div class="container-adc">
        <!-- Encabezado -->
        <div class="mb-10 text-center">
          <p
            class="mb-3 inline-block rounded-full border border-gold-500/40 px-4 py-1 text-xs font-semibold tracking-widest text-gold-300 uppercase"
          >
            Nuestra brigada
          </p>
          <h2 class="text-3xl font-bold text-white md:text-4xl">
            Instalaciones
          </h2>
          <p class="mx-auto mt-3 max-w-2xl text-navy-200">
            Nuestro equipo realiza instalación de paneles, tableros y cableado con
            materiales certificados y garantía de trabajo.
          </p>
        </div>
      </div>

      <!-- Cinta continua: las imágenes avanzan de izquierda a derecha, en bucle
           infinito y a todo el ancho. Al pasar el cursor se detiene. -->
      <div class="marquee">
        <div
          class="marquee__track"
          [style.--marquee-shift]="desplazamiento()"
        >
          @for (copia of copias(); track copia) {
            <ul
              class="marquee__group"
              #grupo
              [attr.aria-hidden]="copia === 0 ? 'true' : null"
            >
              @for (slide of slides; track slide.src) {
                <li class="shrink-0">
                  <!-- object-cover recorta la foto a la caja y object-center deja claro
                       que lo que se muestra es el centro de la imagen, que es
                       donde cae el contenido en las fotos verticales. -->
                  <img
                    [src]="slide.src"
                    [alt]="slide.alt"
                    class="h-56 w-80 rounded-xl border border-navy-800 object-cover object-center sm:h-64 sm:w-96 md:h-72"
                    loading="lazy"
                    decoding="async"
                  />
                </li>
              }
            </ul>
          }
        </div>
      </div>
    </section>
  `,
})
export class InstalacionesComponent implements OnDestroy {
  readonly slides: Slide[] = [
    {
      src: 'assets/images/brigada-01.jpg',
      alt: 'Brigada eléctrica instalando paneles',
    },
    {
      src: 'assets/images/brigada-02.jpg',
      alt: 'Brigada eléctrica trabajando en instalación',
    },
    {
      src: 'assets/images/brigada-03.jpg',
      alt: 'Instalación de tableros eléctricos',
    },
    {
      src: 'assets/images/brigada-04.jpg',
      alt: 'Cableado e instalación eléctrica',
    },
    {
      src: 'assets/images/brigada-05.jpg',
      alt: 'Equipo de instaladores eléctricos',
    },
    {
      src: 'assets/images/brigada-06.jpg',
      alt: 'Puesta en marcha de instalación eléctrica',
    },
  ];

  private readonly primerGrupo =
    viewChild.required<ElementRef<HTMLElement>>('grupo');

  /**
   * Ancho que hay que cubrir y ancho de un grupo de imágenes, medidos en el
   * navegador. Se usa `clientWidth` y no `innerWidth` porque este último
   * incluye la barra de desplazamiento, que la cinta no necesita tapar.
   */
  private readonly anchoVentana = signal(0);
  private readonly anchoGrupo = signal(0);

  /**
   * Cuántas copias de la lista hay que pintar para que la cinta tape siempre
   * todo el ancho. Un grupo mide unos 2400 px, así que dos copias bastan en
   * pantallas normales; en un monitor grande hay que repetir más porque, en el
   * instante en que la cinta acaba de empezar a volver, lo que queda a la
   * derecha son las copias menos una.
   */
  readonly copias = computed(() => {
    const ventana = this.anchoVentana();
    const grupo = this.anchoGrupo();
    const necesarias =
      ventana && grupo ? Math.max(2, Math.ceil(ventana / grupo) + 1) : 2;
    return Array.from({ length: necesarias }, (_, i) => i);
  });

  /**
   * La cinta avanza el ancho de un grupo y reinicia. Como el patrón se repite
   * cada grupo, el empalme es invisible; y como los porcentajes de
   * `translateX` son respecto al ancho de la pista, el desplazamiento es
   * 1/N de su ancho. La duración es fija, así que la velocidad no depende de
   * cuántas copias haya.
   */
  readonly desplazamiento = computed(() =>
    `-${(100 / this.copias().length).toFixed(4)}%`,
  );

  private observador?: ResizeObserver;

  constructor() {
    afterNextRender(() => {
      this.medirVentana();
      window.addEventListener('resize', this.medirVentana);

      const grupo = this.primerGrupo().nativeElement;
      this.observador = new ResizeObserver(() =>
        this.anchoGrupo.set(grupo.offsetWidth),
      );
      this.observador.observe(grupo);
    });
  }

  private medirVentana = () =>
    this.anchoVentana.set(document.documentElement.clientWidth);

  ngOnDestroy(): void {
    this.observador?.disconnect();
    window.removeEventListener('resize', this.medirVentana);
  }
}