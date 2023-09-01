import { Injectable, NgZone } from '@angular/core';
import { App, URLOpenListenerEvent } from '@capacitor/app'
import { ProductsService } from './products.service';
import { Router } from '@angular/router';
import { ModalsService } from './modals.service';

@Injectable({
  providedIn: 'root'
})
export class DynamicLinksService {

  constructor(
    private zone: NgZone,
    private productService: ProductsService,
    private modalService: ModalsService,
    private router: Router
  ) { }

  async listenAppUrlOpen() {
    App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
      this.zone.run( async () => {
        const externalUrlArray = event.url.split('/')
        if (externalUrlArray.length != 4 ) return  
        const urlData =  externalUrlArray.slice(-1).toString()
        if (urlData.includes('P')) {
          const productId = urlData.toString().replace('P','')
          const product = await this.productService.getProductById(productId)
          if (!product) return
          return await this.modalService.openProduct(product)
        }
        if (urlData.includes('C')) {
          const taxonId = urlData.toString().replace('C','')
          return await this.router.navigateByUrl(`/taxon/${taxonId}`)
        }
        return
      })
    })
  }

  async checkAppLaunchUrl () {
    const { url }  = await App.getLaunchUrl();
    if (!url) return
    const externalUrlArray = url.split('/')
    if (externalUrlArray.includes('mercados')) return await this.router.navigateByUrl(`/taxon/${externalUrlArray.pop()}`)
    if (externalUrlArray.includes('productos')) {
      const product = await this.productService.getProductById(externalUrlArray.pop())
      if (!product) return
      return await this.modalService.openProduct(product)
    }
    return
  };

  
}


