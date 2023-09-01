import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, scheduled } from 'rxjs';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ShipmentScheduledService {

  shipmentScheduled$: BehaviorSubject<any> = new BehaviorSubject<any>([])

  constructor(
    private http: HttpClient
  ) { }


  updateShipmentScheduled(id, scheduledAt) {
    return this.http.patch(`${environment.host}api/v2/storefront/shipments/${id}`, {
      shipment: {
        scheduled_at: scheduledAt
      }
    })
  }

}
