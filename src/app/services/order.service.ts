import { Injectable } from '@angular/core';
import { SecurityProvider } from './security.service';
import { Storage } from '@ionic/storage';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private dataInclude = 'line_items,variants,variants.product.images,variants.images,billing_address,shipping_address,user,payments,shipments,promotions'

  constructor(private securityProvider: SecurityProvider,
              private nativeStorage: Storage) {
  }

  async orders(options) {
    const token = await this.nativeStorage.get('accessToken');
    if (options.page) options['page'] = options.page;
    if (options.perPage) options['per_page'] = options.perPage;
    const response = await this.securityProvider.getClient().account.completedOrdersList({ bearerToken: token }, options);
    if (response.isSuccess()) {
      return response.success();
    }
  }

  async order(orderToken, number) {
    return await this.securityProvider.getClient().order.status(
      { orderToken },
      number,
      { include: this.dataInclude }
    );
  }

}
