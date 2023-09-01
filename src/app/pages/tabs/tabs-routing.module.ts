
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ModalAccountComponent } from 'src/app/modals/account/modal-account.component';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadChildren: () => import('../home/home.module').then(m => m.HomePageModule)
      },
      {
        path: 'sales',
        loadChildren: () => import('./featured/featured.module').then(m => m.FeaturedPageModule)
      },
      {
        path: 'products',
        loadChildren: () => import('./categories/categories.module').then(m => m.CategoriesPageModule)
      },
      {
        path: 'products/product/:id',
        loadChildren: () => import('../../pages/product/product.module').then(m => m.ProductPageModule)
      },
      {
        path: 'taxon/:id',
        loadChildren: () => import('../..//pages/taxon/taxon.module').then(m => m.TaxonPageModule)
      },
      {
        path: 'orders',
        loadChildren: () => import('./orders/orders.module').then(m => m.OrderPageModule)
      },
      // {
      //   path: 'menu',
      //   component: ModalAccountComponent
      // },
      {
        path: 'menu',
        loadChildren: () => import('./menu/menu.module').then( m => m.MenuPageModule)
      },
      {
        path: 'profile',
        loadChildren: () => import('./profile/profile.module').then( m => m.ProfilePageModule)
      },
      {
        path: 'discover',
        loadChildren: () => import('./discover/discover.module').then( m => m.DiscoverPageModule)
      },
      {
        path: '',
        redirectTo: '/tabs/home',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/home',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
