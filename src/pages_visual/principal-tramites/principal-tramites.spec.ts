import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrincipalTramites } from './principal-tramites';

describe('PrincipalTramites', () => {
  let component: PrincipalTramites;
  let fixture: ComponentFixture<PrincipalTramites>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrincipalTramites]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrincipalTramites);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
