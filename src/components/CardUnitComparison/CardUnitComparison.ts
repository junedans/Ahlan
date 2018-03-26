import { Component } from '@angular/core';
import * as Content from "../../model/appContent";

type mUnitRowArray = Array<{leftUnit: string, leftUnitTranslated: string, leftValue: string, rightUnit: string, rightUnitTranslated: string, rightValue: string }>;

@Component({
  selector: 'card-unit-comparison',
  templateUrl: 'CardUnitComparison.html'
})
export class CardUnitComparison {
  card: Content.CardUnitComparison;
  mTitle: string;
  mTranslatedTitle: string;
  mImageUrl: string;
  mUnits: mUnitRowArray;

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

     // Create a list of Units to render
     this.mUnits = this.loadUnits(this.card.units);
  }

  private loadUnits(units: Content.UnitComparison[]) {
    let temp: mUnitRowArray = [];
    for (let i = 0; i < units.length; i++) {
      if(units[i].leftUnit && units[i].rightUnit) {
        temp.push({
          leftUnit: units[i].leftUnit.name['en-US'],
          leftUnitTranslated: units[i].leftUnit.name['ar'] ,
          leftValue: units[i].leftUnit.value['en-US'],
          rightUnit: units[i].rightUnit.name['en-US'],
          rightUnitTranslated: units[i].rightUnit.name['ar'],
          rightValue: units[i].rightUnit.value['en-US']
        });
      }
    }

    return temp;
  }
}