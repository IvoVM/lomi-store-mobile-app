import { Directive, ElementRef, HostListener , Input, AfterViewInit } from '@angular/core';
import { LaunchDarklyService } from './services/launch-darkly.service';

@Directive({
  selector: '[feature-flag]'
})
export class FeatureFlagDirective implements AfterViewInit{
  @Input() name :string;
  @Input() defaultValue :boolean = false;
  @Input() variant : number | boolean = 1;
  featureFlagValue : any;

  @HostListener('click') onClick(){
    this.featureFlagEvent(this.featureFlagValue, "feature."+this.name+".clicked");
  }

  constructor(
    private ref: ElementRef<HTMLElement>,
    private ldService:LaunchDarklyService,
  ) {}

  featureFlagEvent(featureFlagValue, UIEventName){
    window.analytics.track(UIEventName,{
      featureFlagValue : featureFlagValue,
      featureFlagName : this.name,
      featureFlagVariant : this.variant
    })
  }
  
  async ngAfterViewInit(): Promise<void> {  
    const featureFlagValue = this.featureFlagValue = await this.ldService.client.variation(this.name,this.defaultValue)
    let showElement = this.variant == featureFlagValue
    if (!showElement){
      this.ref.nativeElement?.remove()
    }
  }

}