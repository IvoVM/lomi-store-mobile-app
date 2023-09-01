import { Component, OnInit } from '@angular/core';
import { ProducersService } from '../../services/producers.service';

@Component({
  selector: 'app-producers',
  templateUrl: './producers.page.html',
  styleUrls: ['./producers.page.scss'],
})
export class ProducersPage implements OnInit {
  producers = [];
  next;
  self;
  total;
  public loading = false;

  constructor(private producersService: ProducersService) {
  }

  ngOnInit() {
    this.setProducers(1);
  }

  setProducers(page) {
    this.producersService.getProducers(page, 18).subscribe((resp: any) => {
      this.producers.push(...resp.producers);
      this.next = resp.current_page + 1;
      this.self = resp.current_page;
      this.total = resp.total_count;
      this.loading = false;
    })
  }

  async logScrolling($event) {
    if ($event.target.localName != "ion-content") {
      return;
    }

    const scrollElement = await $event.target.getScrollElement();
    const scrollHeight = scrollElement.scrollHeight - scrollElement.clientHeight;
    const currentScrollDepth = $event.detail.scrollTop;
    const targetPercent = 80;
    let triggerDepth = ((scrollHeight / 100) * targetPercent);

    if (currentScrollDepth > triggerDepth) {
      if (!this.loading && (this.self !== this.total)) {
        this.setProducers(this.next);
        this.loading = true;
      }
    }
  }
}
