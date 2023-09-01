import { NgModule } from '@angular/core';
import { ProducerCardComponent } from '../components/producer-card/producer-card.component';
import { ProductDetailSlidesComponent } from '../components/product/product-detail/product-detail-slides/product-detail-slides.component';
import { ProductDetailComponent } from '../components/product/product-detail/product-detail.component';
import { TitleLinkComponent } from '../components/title-link/title-link.component';
import { ProductCardComponent } from '../components/product/product-card/product-card.component';
import { ProducersSlidesComponent } from '../pages/home/producers-slides/producers-slides.component';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ModalProductComponent } from '../modals/product/modal-product.component';
import { ProductSlidesComponent } from '../components/product/product-slides/product-slides.component';
import { OrdersComponent } from '../components/orders/orders.component';
import { ModalCartComponent } from '../modals/cart/modal-cart.component';
import { CartProductsComponent } from '../modals/cart/cart-products/cart-products.component';
import { ShippingSelectorComponent } from '../pages/home/shipping-selector/shipping-selector.component';
import { AccordionListComponent } from '../components/accordion-list/accordion-list.component';
import { ScrollSpyDirective } from '../directives/scroll-spy';
import { ProductsSkeletonComponent } from '../components/products-skeleton/products-skeleton.component';
import { LoaderSpinnerComponent } from '../components/loader-spinner/loader-spinner.component';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginPageModule } from '../pages/login/login.module';
import { LoginComponent } from '../components/login/login.component';
import { LottieModule } from 'ngx-lottie';
import player from 'lottie-web';
import { MomentsSlidesComponent } from '../pages/home/moments-slides/moments-slides.component';
import { FormsModule } from '@angular/forms';
import {MatRippleModule} from '@angular/material/core';
import { SearcherComponent } from '../components/searcher/searcher.component';
import { ShipmentScheduleSelectorComponent } from '../shipment-schedule-selector/shipment-schedule-selector.component';
import { AboutYouHeadComponent } from '../about-you-head/about-you-head.component';
import { ModalConfirmPayComponent } from '../modal-confirm-pay/modal-confirm-pay.component';
import { CheckoutPageGuard } from '../checkout-page.guard';
import { CurrentOrderCompletedGuard } from '../current-order-completed.guard';
import { SafeCartGuard } from '../safe-cart.guard';
import { ProcesingDataComponent } from '../modals/procesing-data/procesing-data.component';
import { LongPressDirective } from '../directives/long-press.directive';
import { DragDirective } from '../directives/drag.directive';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx'; 
import { FeatureFlagDirective } from '../feature-flag.directive';
import { CountySelectorModalComponent } from '../county-selector-modal/county-selector-modal.component';
import { FlexiblePromotionsBarComponent } from '../flexible-promotions-bar/flexible-promotions-bar.component';
import { DiscountCouponModalComponent } from '../discount-coupon-modal/discount-coupon-modal.component';
import { DeliverySheduleComponent } from '../modals/delivery-shedule/delivery-shedule.component';
import { GreetingsComponent } from '../greetings/greetings.component';
import { provideFirebaseApp, getApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { environment } from 'src/environments/environment';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';

import { UpsellingComponent } from '../upselling/upselling.component';
import { ProductsListComponent } from '../products-list/products-list.component';
import { LomiboxCardComponent } from '../components/lomibox/lomibox-card/lomibox-card.component';
import { LomiboxModalComponent } from '../modals/lomibox-modal/lomibox-modal.component';
import { LomiboxCategoryModalComponent } from '../modals/lomibox-category-modal/lomibox-category-modal.component';
import { RecepyModalComponent } from '../modals/recepy-modal/recepy-modal.component';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import {AngularFireModule} from '@angular/fire/compat';
import { AngularFireAnalyticsModule, ScreenTrackingService, UserTrackingService } from '@angular/fire/compat/analytics';
import { SearchBarComponent } from '../components/search-bar/search-bar.component';
import { LomiMixCategoriesComponent } from '../components/lomi-mix-categories/lomi-mix-categories.component';
import { LomiFavoritesRecipesComponent } from '../components/lomi-favorites-recipes/lomi-favorites-recipes.component';
import { Device } from '@awesome-cordova-plugins/device/ngx';
import { DeliveryStatusComponent } from '../components/delivery-status/delivery-status.component';
import { DeliveryStatusModalComponent } from '../components/delivery-status/delivery-status-modal/delivery-status-modal.component';
import { UserLocationModalComponent } from '../user-location-modal/user-location-modal.component';
import { ScheduleModalComponent } from '../schedule-modal/schedule-modal.component';
import { TaxonPageModule } from '../pages/taxon/taxon.module';
import { TaxonPage } from '../pages/taxon/taxon.page';
import { BannerSlidesComponent } from '../pages/home/banner-slides/banner-slides.component';
import { NumberPhoneComponent } from '../number-phone/number-phone.component';
import { NoStockDialogComponent } from '../no-stock-dialog/no-stock-dialog.component';
import { SetDefaultCardComponent } from '../modals/set-default-card/set-default-card.component';
import { MyMilesLatamComponent } from '../modals/my-miles-latam/my-miles-latam.component';
import { RedirectWebpayComponent } from '../modals/redirect-webpay/redirect-webpay.component';
import { RecoverPasswordMessageComponent } from '../modals/recover-password-message/recover-password-message.component';
import { LatamCodeModalComponent } from '../modals/latam-code-modal/latam-code-modal.component';
import { ErrorMessageModalComponent } from '../modals/error-message-modal/error-message-modal.component';
import { CheckoutNoteComponent } from '../modals/checkout-note/checkout-note.component';
import { DeleteAddressModalComponent } from '../modals/delete-address-modal/delete-address-modal.component';
import { AddDiscountModalComponent } from '../modals/add-discount-modal/add-discount-modal.component';
import { DirectionConfirmationComponent } from '../direction-confirmation/direction-confirmation.component';
import { AvocadoSorryModalComponent } from '../avocado-sorry-modal/avocado-sorry-modal.component';
// import { OtpComponent } from '../modals/otp/otp.component';
export function playerFactory() {
  return player;
}

@NgModule({
  declarations: [
    TitleLinkComponent,
    ProductCardComponent,
    ProductDetailComponent,
    LoginComponent,
    CountySelectorModalComponent,
    ProductDetailSlidesComponent,
    ProducerCardComponent,
    ProducersSlidesComponent,
    ModalProductComponent,
    ModalConfirmPayComponent,
    ProductSlidesComponent,
    OrdersComponent,
    ModalCartComponent,
    CartProductsComponent,
    ShippingSelectorComponent,
    AccordionListComponent,
    ScrollSpyDirective,
    ProductsSkeletonComponent,
    LoaderSpinnerComponent,
    MomentsSlidesComponent,
    SearcherComponent,
    ShipmentScheduleSelectorComponent,
    AboutYouHeadComponent,
    FeatureFlagDirective,
    FlexiblePromotionsBarComponent,
    DiscountCouponModalComponent,
    ProcesingDataComponent,
    LongPressDirective,
    DragDirective,
    FeatureFlagDirective,
    ShippingSelectorComponent,
    DeliverySheduleComponent,
    GreetingsComponent,
    UpsellingComponent,
    ProductsListComponent,
    UpsellingComponent,
    LomiboxCardComponent,
    LomiboxModalComponent,
    LomiboxCategoryModalComponent,
    GreetingsComponent,
    RecepyModalComponent,
    SearchBarComponent,
    LomiMixCategoriesComponent,
    LomiFavoritesRecipesComponent,
    DeliveryStatusComponent,
    DeliveryStatusModalComponent,
    UserLocationModalComponent,
    ScheduleModalComponent,
    TaxonPage,
    BannerSlidesComponent,
    NumberPhoneComponent,
    NoStockDialogComponent,
    SetDefaultCardComponent,
    MyMilesLatamComponent,
    RedirectWebpayComponent,
    RecoverPasswordMessageComponent,
    LatamCodeModalComponent,
    ErrorMessageModalComponent,
    CheckoutNoteComponent,
    DeleteAddressModalComponent,
    AddDiscountModalComponent,
    DirectionConfirmationComponent,
    AvocadoSorryModalComponent

  ],
  imports: [
    AngularFireAuthModule,
    IonicModule,
    RouterModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AngularFirestoreModule,
    LottieModule.forRoot({ player: playerFactory }),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAnalyticsModule,
    MatRippleModule,
  ],  
  exports: [
    TitleLinkComponent,
    ProductCardComponent,
    ProductDetailComponent,
    LoginComponent,
    ProductDetailSlidesComponent,
    ProducerCardComponent,
    ProducersSlidesComponent,
    ModalProductComponent,
    ProductSlidesComponent,
    OrdersComponent,
    ModalCartComponent,
    ModalConfirmPayComponent,
    CartProductsComponent,
    ShippingSelectorComponent,
    AccordionListComponent,
    ScrollSpyDirective,
    ProductsSkeletonComponent,
    LoaderSpinnerComponent,
    CountySelectorModalComponent,
    MomentsSlidesComponent,
    SearcherComponent,
    ShipmentScheduleSelectorComponent,
    LongPressDirective,
    DragDirective,
    AboutYouHeadComponent,
    FeatureFlagDirective,
    FlexiblePromotionsBarComponent,
    DiscountCouponModalComponent,
    DeliverySheduleComponent,
    GreetingsComponent,
    UpsellingComponent,
    ProductsListComponent,
    UpsellingComponent,
    LomiboxCardComponent,
    LomiboxModalComponent,
    LomiboxCategoryModalComponent,
    GreetingsComponent,
    RecepyModalComponent,
    AngularFireAuthModule,
    AngularFireModule,
    SearchBarComponent,
    LomiMixCategoriesComponent,
    LomiFavoritesRecipesComponent,
    DeliveryStatusComponent,
    UserLocationModalComponent,
    ScheduleModalComponent,
    TaxonPage,
    BannerSlidesComponent,
    NumberPhoneComponent,
    NoStockDialogComponent,
    SetDefaultCardComponent,
    MyMilesLatamComponent,
    RedirectWebpayComponent,
    RecoverPasswordMessageComponent,
    ErrorMessageModalComponent,
    CheckoutNoteComponent,
    DeleteAddressModalComponent,
    AddDiscountModalComponent,
    AvocadoSorryModalComponent
  ],
  providers: [
    CheckoutPageGuard,
    CurrentOrderCompletedGuard,
    SafeCartGuard,
    AboutYouHeadComponent,
    AppVersion,
    ScreenTrackingService,
    UserTrackingService,
    Device,
    UserLocationModalComponent,
    ScheduleModalComponent,
  ]
})
export class SharedModules {}
