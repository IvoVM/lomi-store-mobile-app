import { Injectable } from '@angular/core';
import { Firestore, collectionData, collection } from '@angular/fire/firestore';
import { doc, getDoc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RecepiesService {

  recepies$ = new BehaviorSubject<any []>([])
  favoriteRecipes$ = new BehaviorSubject<any []>([])
  lomiBox$ = new BehaviorSubject<any []>([])
  mainCategories$ = new BehaviorSubject<any []>([])
  categoryBox$ = new BehaviorSubject<any []>([])
  docs = {}
  
  constructor(
    private fireStore: Firestore
  ) { 
    // this.getRecepies()
  }

  async getRecipeById(recipeId){
    const docRef = doc(this.fireStore, 'recetas-lomi', recipeId);
    const docSnap = await getDoc(docRef);
    const document = { id: docSnap.id, ...docSnap.data(),}
    return document
  }

  async addLike(docId, userId){
    const document = this.docs[docId]
    let likes = document.data().likes
    likes ? likes.push(userId) : likes = [userId]
    const fireDoc = doc(this.fireStore, 'recetas-lomi/'+docId)
    updateDoc(fireDoc,{ likes : likes })
  }

  async removeLike(docId, userId){
    const document = this.docs[docId]
    let likes = document.data().likes
    likes.forEach((element, index) => {
      if (element === userId) {
        likes.splice(index, 1);
      }
    });
    const fireDoc = doc(this.fireStore, 'recetas-lomi/'+docId)
    updateDoc(fireDoc,{ likes : likes })
  }
  
  async addUnlike(docId, userId){
    const document = this.docs[docId]
    let unlikes = document.data().likes
    unlikes ? unlikes.push(userId) : unlikes = [userId]
    const fireDoc = doc(this.fireStore, 'recetas-lomi/'+docId)
    updateDoc(fireDoc,{ unlikes: unlikes })
  }

  async removeUnLike(docId, userId){
    const document = this.docs[docId]
    let unlikes = document.data().likes
    unlikes.forEach((element, index) => {
      if (element === userId) {
        unlikes.splice(index, 1);
      }
    });
    const fireDoc = doc(this.fireStore, 'recetas-lomi/'+docId)
    updateDoc(fireDoc,{ unlikes: unlikes })
  }

  async getRecepies() {
    const q = query(collection(this.fireStore, 'recetas-lomi'))
    onSnapshot(q, { includeMetadataChanges: true } , (snapShotResponse) => {
      let responseArray = []
      snapShotResponse.forEach((doc) => {
        this.docs[doc.id] = doc
        responseArray.push({
          id: doc.id,
          ...doc.data()
        })
      })
      this.recepies$.next(responseArray)
    })
  }

  async getFavoritesRecipes() {
    const q = query(collection(this.fireStore, 'recetas-lomi'), where('favorite','==', 'true'))
    onSnapshot(q, { includeMetadataChanges: true } , (snapShotResponse) => {
      let responseArray = []
      snapShotResponse.forEach((doc) => {
        this.docs[doc.id] = doc
        responseArray.push({
          id: doc.id,
          ...doc.data()
        })
      })
      this.favoriteRecipes$.next(responseArray)
    })
  }

    async getMainCategories() {
    const q = query(collection(this.fireStore, 'main-categories'))
    onSnapshot(q, { includeMetadataChanges: true } , (snapShotResponse) => {
      let responseArray = []
      snapShotResponse.forEach((doc) => {
        this.docs[doc.id] = doc
        responseArray.push({
          id: doc.id,
          ...doc.data()
        })
      })
      this.mainCategories$.next(responseArray)
    })
  }

  async getLomiBox(): Promise<void> {
    const q = query(collection(this.fireStore, 'lomi-box'))
    onSnapshot(q, { includeMetadataChanges: true } , (snapShotResponse) => {
      let responseArray = []
      snapShotResponse.forEach((doc) => {
        this.docs[doc.id] = doc
        responseArray.push({
          id: doc.id,
          ...doc.data()
        })
      })
      this.lomiBox$.next(responseArray)
    })
  }
  async getCategoryBox() {
    const q = query(collection(this.fireStore, 'category-box'), where('isActive', '==', true))
    onSnapshot(q, { includeMetadataChanges: true } , (snapShotResponse) => {
      let responseArray = []
      snapShotResponse.forEach((doc) => {
        this.docs[doc.id] = doc
        responseArray.push({
          id: doc.id,
          ...doc.data()
        })
      })
      this.categoryBox$.next(responseArray)
    })
  }

  getRecipeByCategory(category){
    const q = query(collection(this.fireStore, 'recetas-lomi/'), where("category", "==", category))
    return collectionData(q)
  }

  getBoxByCategory(category){
    const q = query(collection(this.fireStore, 'lomi-box/'), where("category", "==", category))
    return collectionData(q)
  }

}
