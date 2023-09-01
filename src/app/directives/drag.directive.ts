import { AfterViewInit, Directive, ElementRef, EventEmitter, Output } from '@angular/core';
import { AnimationController, GestureController } from '@ionic/angular';

@Directive({
  selector: '[appDrag]'
})
export class DragDirective implements AfterViewInit {

  @Output() activateEvent = new EventEmitter();
  animation;
  started = false;
  initialStep = 0;
  gesture;
  MAX_TRANSLATE;

  constructor(
    private el: ElementRef,
    private gestureCtrl: GestureController,
    private animationCtrl: AnimationController
  ) { }

  ngAfterViewInit() {
    this.MAX_TRANSLATE = this.el.nativeElement.parentElement.clientWidth - this.el.nativeElement.clientWidth
    this.initAnimation();
  }

  initAnimation() {
    this.animation = this.animationCtrl.create()
      .addElement(this.el.nativeElement)
      .duration(1000)
      .fromTo('transform', 'translateX(0)', `translateX(${this.MAX_TRANSLATE}px)`)

    this.gesture = this.gestureCtrl.create({
      el: this.el.nativeElement,
      gestureName: 'item-drag',
      threshold: 0,
      onMove: (ev) => {
        this.onMove(ev)
      },
      onEnd: (ev) => {
        this.onEnd(ev)
        this.progressCheck(ev)
      }
    })
    this.gesture.enable()
  }

  onMove(ev) {
    if (!this.started) {
      this.animation.progressStart();
      this.started = true;
    }

    this.animation.progressStep(this.getStep(ev));
    
  }

  onEnd(ev) {
    if (!this.started) return

    this.gesture.enable(false)

    const step = this.getStep(ev);
    const shouldComplete = step > 0.99;

    this.animation
      .progressEnd((shouldComplete) ? 1 : 0, step)
      .onFinish(() => {
        this.gesture.enable()
      })

    this.initialStep = (shouldComplete) ? this.MAX_TRANSLATE: 0
    this.started =  false;
  }

  clamp(min, n, max) {
    return Math.max(min, Math.min(n, max));
  }

  getStep(ev) {
    const delta = this.initialStep + ev.deltaX;
    return this.clamp(0, delta / this.MAX_TRANSLATE, 1);
  }

  progressCheck(ev) {
    let progress = this.getStep(ev)
    if (progress > 0.99) {
      this.activateEvent.emit(true)
    }
  }
}
