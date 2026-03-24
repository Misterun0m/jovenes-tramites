import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapaTramitesComponent } from './mapa-tramites';

describe('MapaTramitesComponent', () => {
  let component: MapaTramitesComponent;
  let fixture: ComponentFixture<MapaTramitesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapaTramitesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapaTramitesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
