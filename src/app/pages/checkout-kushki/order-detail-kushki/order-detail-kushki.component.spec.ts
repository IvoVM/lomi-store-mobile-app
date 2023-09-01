import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { OrderDetailKushkiComponent } from './order-detail-kushki.component';

describe('OrderDetailKushkiComponent', () => {
  let component: OrderDetailKushkiComponent;
  let fixture: ComponentFixture<OrderDetailKushkiComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderDetailKushkiComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(OrderDetailKushkiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
