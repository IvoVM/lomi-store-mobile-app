import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoriesPage } from './categories.page';
import { ExploreContainerComponentModule } from '../../../explore-container/explore-container.module';

import { CategoriesRoutingModule } from './categories-routing.module';
import { SharedModules } from '../../../modules/shared.modules';
@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    CategoriesRoutingModule,
    SharedModules
  ],
  declarations: [CategoriesPage]
})
export class CategoriesPageModule {}
