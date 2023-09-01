import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FlexiblePromotionsBarComponent } from './flexible-promotions-bar.component';

describe('FlexiblePromotionsBarComponent', () => {
  let component: FlexiblePromotionsBarComponent;
  let fixture: ComponentFixture<FlexiblePromotionsBarComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FlexiblePromotionsBarComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FlexiblePromotionsBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
