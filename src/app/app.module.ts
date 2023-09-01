import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { RequestInterceptor } from './services/request.interceptor';
import { SecurityProvider } from './services/security.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Storage } from '@ionic/storage';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { SharedModules } from './modules/shared.modules';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Badge } from '@awesome-cordova-plugins/badge/ngx';
import { IntercomModule } from 'ng-intercom';
import { IntercomService } from './services/intercom.service';
import { CheckoutPageGuard } from './checkout-page.guard';
import { CurrentOrderCompletedGuard } from './current-order-completed.guard';
import { PromotionsService } from './services/promotions.service';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { customAnimation } from './animations/custom.animation';
import { SplashScreenComponent } from './splash-screen/splash-screen.component';
import { getAnalytics } from "firebase/analytics";

import { FlexiblePromotionsBarComponent } from './flexible-promotions-bar/flexible-promotions-bar.component';
import { environment } from 'src/environments/environment';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideFirebaseApp, getApp, initializeApp } from '@angular/fire/app';
import { Clipboard } from '@awesome-cordova-plugins/clipboard/ngx';
import { NewSharedModule } from './shared/shared-new-module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  
  declarations: [
    AppComponent,
    SplashScreenComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    NewSharedModule,
    ReactiveFormsModule,
    HttpClientModule,
    IonicModule.forRoot({ mode: 'ios', navAnimation: customAnimation}),
    AppRoutingModule,
    NoopAnimationsModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    IntercomModule.forRoot({
      appId: 'oebymh9s', // from your Intercom config
      updateOnRouterChange: true // will automatically run `update` on router event changes. Default: `false`
    }),
    NgbModule
  ],
  providers: [
    StatusBar,
    GooglePlus,
    InAppBrowser,
    {
      provide: RouteReuseStrategy,
      useClass: IonicRouteStrategy
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: RequestInterceptor,
      multi: true
    },
    HttpClient,
    Storage,
    SecurityProvider,
    IntercomService,
    PromotionsService,
    Badge,
    AppVersion,
    Clipboard
  ],
  exports : [],
  bootstrap: [AppComponent]
})

export class AppModule {}
