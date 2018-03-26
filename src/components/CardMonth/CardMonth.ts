import { Component } from '@angular/core';
import * as Content from "../../model/appContent";

@Component({
  selector: 'card-month',
  templateUrl: 'CardMonth.html'
})
export class CardMonth {
  card: Content.CardMonth;

  constructor() {
  }
}
