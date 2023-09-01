import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProducersService {

  constructor(private http: HttpClient) {
  }

  getProducers(page = 1, perPage = 12) {
    const url = environment.host + '/api/v1/producers?page='+ page +'&per_page='+ perPage +'';
    return this.http.get(url);
  }

  getProducer(id) {
    const url = environment.host + '/api/v1/producers/' + id;
    return this.http.get(url);
  }
}
