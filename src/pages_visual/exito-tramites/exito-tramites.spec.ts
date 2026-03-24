import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExitoTramites } from './exito-tramites';

describe('ExitoTramites', () => {
  let component: ExitoTramites;
  let fixture: ComponentFixture<ExitoTramites>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExitoTramites]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExitoTramites);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
