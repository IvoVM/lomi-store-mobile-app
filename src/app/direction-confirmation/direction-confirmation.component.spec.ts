import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DirectionConfirmationComponent } from './direction-confirmation.component';

describe('DirectionConfirmationComponent', () => {
  let component: DirectionConfirmationComponent;
  let fixture: ComponentFixture<DirectionConfirmationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DirectionConfirmationComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DirectionConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
