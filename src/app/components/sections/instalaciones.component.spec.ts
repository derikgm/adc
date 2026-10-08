import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InstalacionesComponent } from './instalaciones.component';

/**
 * ResizeObserver falso: guarda las instancias y los elementos observados para
 * poder comprobar el ciclo de vida y disparar la medición a mano.
 */
class ResizeObserverFake {
  static instancias: ResizeObserverFake[] = [];
  observados: Element[] = [];
  desconectado = false;

  constructor(private readonly callback: ResizeObserverCallback) {
    ResizeObserverFake.instancias.push(this);
  }

  observe(elemento: Element): void {
    this.observados.push(elemento);
  }

  unobserve(): void {}

  disconnect(): void {
    this.desconectado = true;
  }

  /** Emula el disparo inicial (y los posteriores) del observador real. */
  disparar(): void {
    this.callback([], this as unknown as ResizeObserver);
  }
}

describe('Instalaciones', () => {
  let grupo: HTMLElement;

  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', ResizeObserverFake);
    ResizeObserverFake.instancias = [];

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [InstalacionesComponent],
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    TestBed.resetTestingModule();
  });

  /** Monta el componente y mide el grupo como si el navegador dijera `ancho`. */
  function montarConAnchos(anchoGrupo: number, anchoVentana: number) {
    const fixture = TestBed.createComponent(InstalacionesComponent);
    fixture.detectChanges();

    grupo = fixture.nativeElement.querySelector(
      '.marquee__group',
    ) as HTMLElement;
    Object.defineProperty(grupo, 'offsetWidth', {
      configurable: true,
      value: anchoGrupo,
    });
    Object.defineProperty(document.documentElement, 'clientWidth', {
      configurable: true,
      value: anchoVentana,
    });

    // Simula un cambio de tamaño de ventana: el componente se entera del nuevo
    // ancho solo por el evento resize (medirVentana).
    window.dispatchEvent(new Event('resize'));

    // Dispara la medición del observador (el primer render lo crea).
    const observador = ResizeObserverFake.instancias.at(-1)!;
    observador.disparar();
    fixture.detectChanges();

    return fixture;
  }

  it('pinta la cinta con las fotos de la brigada y el título Instalaciones', () => {
    const fixture = TestBed.createComponent(InstalacionesComponent);
    fixture.detectChanges();

    const raiz: HTMLElement = fixture.nativeElement;
    const seccion: HTMLElement | null = raiz.querySelector('section#instalaciones');
    expect(seccion).toBeTruthy();
    expect(seccion!.textContent).toContain('Instalaciones');

    const imagenes = [...seccion!.querySelectorAll('img')];
    expect(imagenes.length).toBeGreaterThanOrEqual(6);
    const primeras: (string | null)[] = [
      ...new Set(imagenes.map((img) => img.getAttribute('src'))),
    ];
    expect(primeras).toContain('assets/images/brigada-01.jpg');
    expect(primeras).toContain('assets/images/brigada-06.jpg');
  });

  it('calcula copias y desplazamiento: 2 copias → -50%', () => {
    const fixture = montarConAnchos(2400, 1024);
    const componente = fixture.componentInstance;

    // Sin medición útil del grupo, la cinta nunca se queda corta: 2 copias y
    // el porcentaje exacto que avanza cada vuelta.
    expect(componente.copias().length).toBe(2);
    expect(componente.desplazamiento()).toBe('-50.0000%');
  });

  it('repite la lista en pantallas grandes para que el empalme no se vea', () => {
    const fixture = montarConAnchos(2400, 10000);
    const componente = fixture.componentInstance;

    // ceil(10000/2400) + 1 = 6 copias; el desplazamiento es 1/N de la pista.
    expect(componente.copias().length).toBe(6);
    expect(componente.desplazamiento()).toBe(
      `-${(100 / 6).toFixed(4)}%`,
    );
  });

  it('desconecta el observador y libera el listener al destruirse', () => {
    const fixture = montarConAnchos(2400, 1024);

    const quitarResize = vi.spyOn(window, 'removeEventListener');
    const observador = ResizeObserverFake.instancias.at(-1)!;
    expect(observador.observados.length).toBe(1);

    fixture.destroy();

    expect(observador.desconectado).toBe(true);
    expect(quitarResize).toHaveBeenCalledWith('resize', expect.any(Function));
  });
});