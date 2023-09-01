import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LomiFavoritesRecipesComponent } from './lomi-favorites-recipes.component';

describe('LomiFavoritesRecipesComponent', () => {
  let component: LomiFavoritesRecipesComponent;
  let fixture: ComponentFixture<LomiFavoritesRecipesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LomiFavoritesRecipesComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LomiFavoritesRecipesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
