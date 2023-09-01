import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RecepiesPageRoutingModule } from './recepies-routing.module';

import { RecepiesPage } from './recepies.page';
import { FilterRecipePipe } from 'src/app/pipes/filter-recipe.pipe';
import { CategoryRecipePipe } from 'src/app/pipes/category-recipe.pipe';
import { SharedModules } from 'src/app/modules/shared.modules';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RecepiesPageRoutingModule,
    SharedModules
  ],
  declarations: [RecepiesPage, FilterRecipePipe, CategoryRecipePipe]
})
export class RecepiesPageModule {}
