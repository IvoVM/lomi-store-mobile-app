import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AvocadoSorryModalComponent } from './avocado-sorry-modal.component';

describe('AvocadoSorryModalComponent', () => {
  let component: AvocadoSorryModalComponent;
  let fixture: ComponentFixture<AvocadoSorryModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AvocadoSorryModalComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AvocadoSorryModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
