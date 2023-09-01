import { AfterViewInit, Directive, ElementRef, EventEmitter, Output } from '@angular/core';
import { GestureController } from '@ionic/angular';

@Directive({
  selector: '[appLongPress]'
})
export class LongPressDirective implements AfterViewInit {

  @Output() activateEvent = new EventEmitter();
  @Output() paying = new EventEmitter()
  active: boolean;
  action: any;

  constructor(
    private el: ElementRef,
    private gestureCtrl: GestureController
  ) { }

  ngAfterViewInit() {
    this.initGesture()
  }

  initGesture() {
    let gesture = this.gestureCtrl.create({
      el: this.el.nativeElement,
      gestureName: 'long-press',
      threshold: 0,
      onStart: (ev) => {
        this.active = true;
        this.paying.emit({
          start: true,
          width: this.el.nativeElement.clientWidth
        })
        this.longPressCheck()
      },
      onEnd: (ev) => {
        this.paying.emit({
          start: false,
          width: this.el.nativeElement.parentElement.clientWidth 
        })
        this.active = false;
      }
    }, true)

    gesture.enable()
  }

  longPressCheck() {

    if (this.action) {
      clearTimeout(this.action)
    } 
    this.action =  setTimeout(() => {
      if (this.active) {
        this.activateEvent.emit()
      }
    }, 3000);
  }

}
