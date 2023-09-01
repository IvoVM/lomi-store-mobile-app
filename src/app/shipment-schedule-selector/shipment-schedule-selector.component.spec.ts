import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ShipmentScheduleSelectorComponent } from './shipment-schedule-selector.component';

describe('ShipmentScheduleSelectorComponent', () => {
  let component: ShipmentScheduleSelectorComponent;
  let fixture: ComponentFixture<ShipmentScheduleSelectorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ShipmentScheduleSelectorComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ShipmentScheduleSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
