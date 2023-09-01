import { Injectable, Injector } from '@angular/core';
import {
  HttpHandler, HttpHeaderResponse, HttpHeaders, HttpInterceptor, HttpProgressEvent, HttpRequest, HttpResponse,
  HttpSentEvent, HttpUserEvent
} from '@angular/common/http';
import { AlertController, ToastController } from '@ionic/angular';
import { Observable, throwError } from 'rxjs';
import { SecurityProvider } from './security.service';
import { catchError, timeout } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import * as Sentry from "@sentry/angular";

@Injectable()
export class RequestInterceptor implements HttpInterceptor {
  showingErrorAlert = false;

  constructor(private injector: Injector,
              private toastCtrl: ToastController,
              private security:SecurityProvider,
              private alertCtrl: AlertController) {
  }

  addToken(req: HttpRequest<any>): HttpRequest<any> {
    const accessToken = this.injector.get(SecurityProvider).getAccessToken();
    const newHeaders = {};

    for (const key of req.headers.keys()) {
      newHeaders[key] = req.headers.getAll(key);
    }

    if (accessToken) {
      newHeaders['Authorization'] = 'Bearer ' + accessToken;
    }

    return req.clone({ headers: new HttpHeaders(newHeaders) });
  }

  intercept(req: HttpRequest<any>, next: HttpHandler):
    Observable<HttpSentEvent
      | HttpHeaderResponse
      | HttpProgressEvent
      | HttpResponse<any>
      | HttpUserEvent<any>> {
    // @ts-ignore
    return next.handle(this.addToken(req))
      .pipe(
        timeout(environment.requestTimeout),
        catchError(error => {
          switch (error.status) {
            case 0:
              return this.handle0Error(error);
            case 401:
              return this.handle401Error(req, next, error);
            case 400:
              return this.handle400Error(error);
            case 422:
              return this.handle422Error(error);
            default: {
              if (error.message === 'translation missing: es.doorkeeper.errors.messages.invalid_token.expired') {
                return this.handle401Error(req, next, error);
              } else if (error.name === 'TimeoutError') {
                return this.handleTimeoutError(error);
              } else {
                return throwError(error);
              }
            }
          }
        })
      );
  }

  async errorAlert(message = 'No se ha podido completar la solicitud', callback = undefined) {
    if (!this.showingErrorAlert) {
      this.showingErrorAlert = true;
      const alert = await this.alertCtrl.create({
        header: 'Error',
        subHeader: message,
        buttons: [{ text: 'Aceptar', handler: callback }]
      });
      await alert.present();
      await alert.onWillDismiss();
      this.showingErrorAlert = false;
    }
  }

  handle0Error(error) {
    this.errorAlert('No se ha podido establecer una conexión').then();
    return throwError(error);
  }

  handle401Error(req: HttpRequest<any>, next: HttpHandler, error: any) {
    const security = this.injector.get(SecurityProvider);
    if (security.getRefreshToken() && !security.isLoggedIn()) {
      return security.doRefreshToken().then(
        (resp) => {
          if (resp.isFail()) {
            this.logoutUser(resp.fail().message)
          } else {
            next.handle(this.addToken(req))
          }
        }
      )
    } else {
      this.logoutUser(error)
    }
  }

  async showToast(message, color) {
    await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom',
      color,
      buttons: [{
        text: 'OK',
        handler: () => {
          console.log("ok clicked");
        }
      }]
    }).then(res => res.present());
  }

  handle400Error(error) {
    //this.errorAlert(error.error.errors[0]);
    return throwError(error);
  }

  handle422Error(error) {
    this.showToast(error.error.errors[0],'danger');
    return throwError(error);
  }

  handleTimeoutError(error) {
    this.errorAlert('No se ha podido establecer la conexión').then();
    return throwError(error);
  }

  handleUnknownError(error) {
    this.errorAlert('Ha ocurrido un error desconocido').then();
    return throwError(error);
  }

  logoutUser(error: any) {
    this.injector.get(SecurityProvider).signOut();
    return throwError(error);
  }
}
