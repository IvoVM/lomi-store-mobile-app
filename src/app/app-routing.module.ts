import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { MainHeaderComponent } from './components/main-header/main-header.component';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { BtnBackNavigationComponent } from './components/main-header/btn-back-navigation/btn-back-navigation.component';
import { ShippingSelectorComponent } from './pages/home/shipping-selector/shipping-selector.component';
import { SharedModules } from './modules/shared.modules';
import { GreetingsComponent } from './greetings/greetings.component';
import { CheckoutPageGuard } from './checkout-page.guard';
import { CurrentOrderCompletedGuard } from './current-order-completed.guard';
import { ModalCartComponent } from './modals/cart/modal-cart.component';
import { SafeCartGuard } from './safe-cart.guard';
import { UserDataGuard } from './guards/user-data.guard';
const routes: Routes = [
  {
    path: '',
    redirectTo: 'tabs/home',
    pathMatch: 'full'
  },
  {
    path: '',
    canActivateChild: [ CurrentOrderCompletedGuard ],
    children: [
      {
        path: 'home',
        loadChildren: () => import('./pages/tabs/tabs.module').then(m => m.TabsPageModule)
      },
      {
        path: 'tabs',
        loadChildren: () => import('./pages/tabs/tabs.module').then(m => m.TabsPageModule)
      },
      {
        path: 'product/:id',
        redirectTo: '/tabs/products/product/:id'
      },
      {
        path: 'taxon/:id',
        loadChildren: () => import('./pages/taxon/taxon.module').then(m => m.TaxonPageModule)
      },
      {
        path: 'checkout',
        canActivate : [CheckoutPageGuard],
        loadChildren: () => import('./pages/checkout/checkout.module').then(m => m.CheckoutPageModule)
      },
      {
        path: 'checkout-kushki',
        canActivate : [CheckoutPageGuard, UserDataGuard],
        loadChildren: () => import('./pages/checkout-kushki/checkout-kushki.module').then( m => m.CheckoutKushkiPageModule)
      },
      {
        path: 'producers',
        loadChildren: () => import('./pages/producers/producers.module').then(m => m.ProducersPageModule)
      },
      {
        path: 'producers/:id',
        loadChildren: () => import('./pages/producer/producer.module').then(m => m.ProducerPageModule)
      },
      {
        path: 'taxon/:id',
        loadChildren: () => import('./pages/taxon/taxon.module').then(m => m.TaxonPageModule)
      },
      {
        path: 'cart',
        redirectTo: 'tabs/cart',
        pathMatch: 'full'
      },
      {
        path: 'tabs/cart',
        canActivate: [SafeCartGuard],
        component: ModalCartComponent
      }
    ],
  },
  {
    path: 'search',
    loadChildren: () => import('./pages/search/search.module').then(m => m.SearchPageModule)
  },
  {
    path: 'search/:keyword',
    loadChildren: () => import('./pages/search/search.module').then(m => m.SearchPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'registration',
    loadChildren: () => import('./pages/registration/registration.module').then(m => m.RegistrationPageModule)
  },
  {
    path: 'orders/:id',
    loadChildren: () => import('./pages/order/order.module').then(m => m.OrderPageModule)
  },
  {
    path: 'greetings',
    component: GreetingsComponent
  },
  {
    path: 'addresses',
    loadChildren: () => import('./pages/addresses/addresses.module').then( m => m.AddressesPageModule)
  },
  {
    path: 'about-you',
    loadChildren: () => import('./pages/about-you/about-you.module').then( m => m.AboutYouPageModule)
  },
  {
    path: 'payment-methods',
    loadChildren: () => import('./pages/payment-methods/payment-methods.module').then( m => m.PaymentMethodsPageModule)
  },
  {
    path: 'create-payment-card',
    loadChildren: () => import('./pages/create-payment-card/create-payment-card.module').then( m => m.CreatePaymentCardPageModule),
    canActivate: [UserDataGuard]
  },
  {
    path: 'new-payment-card',
    loadChildren: () => import('./pages/new-payment-card/new-payment-card.module').then( m => m.NewPaymentCardPageModule)
  },
  {
    path: '**',
    redirectTo: 'tabs/home',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
    IonicModule,
    CommonModule,
    SharedModules,
  ],
  declarations: [
    MainHeaderComponent,
    BtnBackNavigationComponent
  ],
  exports: [
    RouterModule,
    MainHeaderComponent,
  ]
})
export class AppRoutingModule {}
