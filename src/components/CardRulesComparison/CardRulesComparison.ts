import { Component } from '@angular/core';
import * as Content from "../../model/appContent";

type mItemArray = Array<{iconClass: string, image: Content.Image, title: string, translated: string}>;

@Component({
  selector: 'card-rules-comparison',
  templateUrl: 'cardRulesComparison.html'
})
export class CardRulesComparison {
  card: Content.CardRulesComparison;
  mImageUrl: string;
  mTitle: string;
  mTranslatedTitle: string;
  mDosArray: mItemArray;
  mDontsArray: mItemArray;

  constructor() {
  }

  public ngOnInit() {
    if(this.card.title){
      this.mTitle = this.card.title['en-US'];
      this.mTranslatedTitle = this.card.title['ar'];
    }

    if(this.card.image){
      this.mImageUrl = this.card.image.url;
    }

    // Create dos and donts Array to render
    this.mDosArray = this.loadItems(this.card.dos);
    this.mDontsArray = this.loadItems(this.card.donts);
  }

  private loadItems(items: Content.MediaItem[]) {
    let temp: mItemArray = [];
    for(let i=0; ((i < items.length) && (items[i].iconImage || items[i].iconClass) && items[i].title); i++) {
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
