import { Component } from '@angular/core';
import * as Content from "../../model/appContent";

@Component({
  selector: 'card-image-text-block',
  templateUrl: 'CardImageTextBlock.html'
})
export class CardImageTextBlock {
  card: Content.CardImageTextBlock;
  mTitle: string;
  mTranslatedTitle: string;
  mImageUrl: string;

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
  }
}
