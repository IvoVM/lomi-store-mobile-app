import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import * as Sentry from "@sentry/angular";

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { BrowserTracing } from "@sentry/tracing";
import { appVersionData } from './app/app-version';
import { getAnalytics } from "firebase/analytics";


declare global {
  interface Window { 
    analytics: any; 
    ganalytics: any;
    ga: any;
    intercomAnalytics: any;
    MercadoPago: any;
    paymentBrickController: any;
  }
}

if (environment.production) {
  enableProdMode();
}

Sentry.init({
  dsn: "https://e3fda3a976634803933592187fc40202@o1122273.ingest.sentry.io/6159693" ,
  release: "Lomi-app@"+appVersionData.wwwVersionName,
  integrations: [
    // Registers and configures the Tracing integration,
    // which automatically instruments your application to monitor its
    // performance, including custom Angular routing instrumentation
    new BrowserTracing()
  ],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});


platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .then(success => console.log(`Bootstrap success`))
  .catch(err => console.error(err));
