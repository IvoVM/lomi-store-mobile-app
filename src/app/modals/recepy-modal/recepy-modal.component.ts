import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Subscription } from 'rxjs';
import { CartService } from 'src/app/services/cart.service';
import { ModalsService } from 'src/app/services/modals.service';
import { ProductsService } from 'src/app/services/products.service';
import { RecepiesService } from 'src/app/services/recepies.service';
import { SecurityProvider } from 'src/app/services/security.service';
import { Clipboard } from '@awesome-cordova-plugins/clipboard/ngx';
import { UserEventsService } from 'src/app/user-events/user-events.service';

@Component({
  selector: 'app-recepy-modal',
  templateUrl: './recepy-modal.component.html',
  styleUrls: ['./recepy-modal.component.scss'],
})
export class RecepyModalComponent implements OnInit, OnDestroy {


  @Input() recepyId;
  recepy;
  products = []
  recipeSubscription:Subscription;
  likes: any = ''
  recipePrice = 0
  showSkeleton = false;

  get valoration(){
    const userId = this.securityService.getUserData().data.id
    return this.likes = this.recepy.likes?.includes(userId) ? 'like' : this.recepy.unlikes?.includes(userId) ? 'dont_like' : false
  }

  constructor(
    private productService: ProductsService,
    private nativeStorage: Storage,
    private modalsService: ModalsService,
    private cartService: CartService,
    private navCtrl: NavController,
    private recipesService: RecepiesService,
    public securityService: SecurityProvider,
    private clipboard: Clipboard,
    private userEventsService: UserEventsService,
  ) { }

  ngOnInit() {
    this.getRecipe()
  }

  ionViewDidEnter() {
    this.getProducts()
  }

  ngOnDestroy(): void {
    this.recipeSubscription.unsubscribe ? this.recipeSubscription.unsubscribe() : ''
  }

  getRecipe() {
    this.recipesService.getRecipeById(this.recepyId).then((resp => {
      this.recepy = resp
      this.recepy.id = this.recepyId
    }))
  }

  likeRecipe() {
    if (this.likes != false) {
      this.userEventsService.userEvents['removeLikeRecipe.clicked'].track({
        recipe: this.recepy
      })
      this.recipesService.removeLike(this.recepy.id, this.securityService.getUserData().data.id)
    } else {
      this.userEventsService.userEvents['likeRecipe.clicked'].track({
        recipe: this.recepy
      })
      this.recipesService.addLike(this.recepy.id, this.securityService.getUserData().data.id)
    }
    this.getRecipe()
  }

  unLikeRecipe() {
    if (this.likes != false) {
      this.userEventsService.userEvents['removeUnLikeRecipe.clicked'].track({
        recipe: this.recepy
      })
      this.recipesService.removeUnLike(this.recepy.id, this.securityService.getUserData().data.id)
    } else {
      this.userEventsService.userEvents['unlikeRecipe.clicked'].track({
        recipe: this.recepy
      })
      this.recipesService.addUnlike(this.recepy.id, this.securityService.getUserData().data.id)
    }
    this.getRecipe()
  }

  async getProducts(): Promise<any> {
    this.recepy.ingredients.forEach(async (element) => {
      let p = await this.productService.getProductById(element.id)
      p['quantity'] = element['quantity']
      const variant = p.variants.find(variant => {
        if(!variant){
          return false;
        }
        if(variant?.attributes.in_stock && variant?.attributes.purchasable) {
          this.recipePrice += +variant.attributes.price
          this.products.push(p)
        }
      });
    })
  }

  closeModal() {
    this.userEventsService.userEvents['closeModal.clicked'].track()
    this.modalsService.dismissTopModal()
  }

  openProduct(product) {
    this.modalsService.dismissTopModal()
    this.modalsService.openProduct(product)
  }

  async addAllProducts() {
    this.userEventsService.userEvents['addAllProducts.clicked'].track()
    this.modalsService.dismissTopModal()
    this.modalsService.openProcesingData({ title: 'Estamos agregando los productos al carrito...' })
    let count = 0;
    this.products.forEach(async (element) => {
      for (let x = 0; x < element.quantity; x ++) {
        await this.cartService.addItem(element.variants[0], 1, element.variants[0].attributes.options_text, true)
      }
      count ++
      if (this.products.length == count) {
        this.modalsService.dismissTopModal()
        this.modalsService.openStockRepeatOrder()
        this.modalsService.dismissTopModal()
      }
    })
  }

  async sharedRecipe() {
    if (this.recepy.link) {
      this.clipboard.copy(this.recepy.link)
    }
  }

}
