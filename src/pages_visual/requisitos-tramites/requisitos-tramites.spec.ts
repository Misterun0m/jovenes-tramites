import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequisitosTramites } from './requisitos-tramites';

describe('RequisitosTramites', () => {
  let component: RequisitosTramites;
  let fixture: ComponentFixture<RequisitosTramites>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequisitosTramites]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequisitosTramites);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
