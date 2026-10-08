import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ServiciosComponent } from './servicios.component';

describe('Servicios', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [ServiciosComponent],
    });
  });

  afterEach(() => TestBed.resetTestingModule());

  it('muestra la sección Servicios con su contenido', () => {
    const fixture = TestBed.createComponent(ServiciosComponent);
    fixture.detectChanges();

    const seccion: HTMLElement | null =
      fixture.nativeElement.querySelector('section#servicios');
    expect(seccion).toBeTruthy();
    expect(seccion!.textContent).toContain('Servicios');
    expect(seccion!.textContent).toContain('Instalaciones eléctricas');
    expect(seccion!.textContent).toContain('Brigada de montaje');
    expect(seccion!.textContent).toContain('Mantenimiento y reparaciones');
    expect(seccion!.textContent).toContain('Suministro de material eléctrico');
  });
});
