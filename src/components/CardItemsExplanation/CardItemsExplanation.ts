import { Component } from '@angular/core';
import * as Content from "../../model/appContent";

type mItemArray = Array<{iconClass: string, image: Content.Image, title: string, translated: string}>;

@Component({
  selector: 'card-items-explanation',
  templateUrl: 'CardItemsExplanation.html'
})
export class CardItemsExplanation {
  card: Content.CardItemsExplanation;
  mImageUrl: string;
  mTitle: string;
  mTranslatedTitle: string;
  mItems : mItemArray;

  constructor() {
  }

  public ngOnInit() {
    if(this.card.description){
      this.mTitle = this.card.description['en-US'];
      this.mTranslatedTitle = this.card.description['ar'];
    }

    if(this.card.image){
      this.mImageUrl = this.card.image.url;
    }

    // Create itemsArray to render
    this.mItems = this.loadItems(this.card.items);
  }

  private loadItems(items: Content.MediaItem[]) {
    let temp: mItemArray = [];
    for(let i=0; ((i < items.length) && (items[i].iconImage) && items[i].title); i++) {
      temp.push({
        iconClass : items[i].iconClass,
        image: items[i].iconImage,
        title: items[i].title['en-US'],
        translated: items[i].title['ar']
      });
    }

    return temp;
  }
}
