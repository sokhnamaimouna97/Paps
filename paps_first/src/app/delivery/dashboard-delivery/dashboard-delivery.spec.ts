import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardDelivery } from './dashboard-delivery';

describe('DashboardDelivery', () => {
  let component: DashboardDelivery;
  let fixture: ComponentFixture<DashboardDelivery>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardDelivery]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardDelivery);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
