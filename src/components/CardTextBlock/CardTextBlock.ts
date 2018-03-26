import { Component } from '@angular/core';
import * as Content from "../../model/appContent";

@Component({
  selector: 'card-text-block',
  templateUrl: 'cardTextBlock.html'
})
export class CardTextBlock {
  card: Content.CardTextBlock;
  title: string;
  translatedTitle: string;

  constructor() {
  }

  public ngOnInit() {
    if (this.card.title) {
      this.title = this.card.title['ar'];
      this.translatedTitle = this.card.title['en-US'];
    }
  }
}
