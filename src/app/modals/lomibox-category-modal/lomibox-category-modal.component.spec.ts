import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LomiboxCategoryModalComponent } from './lomibox-category-modal.component';

describe('LomiboxCategoryModalComponent', () => {
  let component: LomiboxCategoryModalComponent;
  let fixture: ComponentFixture<LomiboxCategoryModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LomiboxCategoryModalComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LomiboxCategoryModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
