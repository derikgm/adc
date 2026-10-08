import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ContactoComponent } from './contacto.component';

describe('Contacto', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [ContactoComponent],
    });
  });

  afterEach(() => TestBed.resetTestingModule());

  it('muestra la sección Contacto y enlace a WhatsApp 59061926', () => {
    const fixture = TestBed.createComponent(ContactoComponent);
    fixture.detectChanges();

    const seccion: HTMLElement | null =
      fixture.nativeElement.querySelector('section#contacto');
    expect(seccion).toBeTruthy();
    expect(seccion!.textContent).toContain('Contacto');

    const enlace: HTMLAnchorElement | null =
      seccion!.querySelector('a');
    expect(enlace).toBeTruthy();
    expect(enlace!.getAttribute('href')).toBe('https://wa.me/59061926');
    expect(enlace!.getAttribute('target')).toBe('_blank');
    expect(enlace!.textContent).toContain('Escribir por WhatsApp');
  });
});
