import { Component } from '@angular/core';
import * as Content from "../../model/appContent";

@Component({
  selector: 'card-example-comparison',
  templateUrl: 'CardExampleComparison.html'
})
export class CardExampleComparison {
  card: Content.CardExampleComparison;
  mTitle: string;
  mTranslatedTitle: string;
  mPositiveImageUrl: string;
  mNegativeImageUrl: string;

  constructor() {
  }

  public ngOnInit() {
    if(this.card.title){
      this.mTitle = this.card.title['en-US'];
      this.mTranslatedTitle = this.card.title['ar'];
    }

    if(this.card.image_positive){
      this.mPositiveImageUrl = this.card.image_positive.url;
    }

    if(this.card.image_negative){
      this.mNegativeImageUrl = this.card.image_negative.url;
    }
  }
}
