import { Component } from '@angular/core';
import * as Content from "../../model/appContent";

@Component({
  selector: 'card-month',
  templateUrl: 'CardMonth.html'
})
export class CardMonth {
  card: Content.CardMonth;
  mDates = new Array<[string, string, string]>();

  static sLang1 = "en-US";
  static sLang2 = "ar";
  static sMonthIndexes = {
    January:    "01",
    February:   "02",
    March:      "03",
    April:      "04",
    May:        "05",
    June:       "06",
    July:       "07",
    August:     "08",
    Sepetember: "09",
    October:    "10",
    November:   "11",
    December:   "12"
  };

  constructor() {
  }

  public ngOnInit() {      
    this.card.dates.forEach(date => {
      var key = "";
      if (date instanceof Content.SpecificDate)
      {
        key = (date as Content.SpecificDate).dayOfMonth[CardMonth.sLang1] + "";
        if (key.length == 1) {
          key = "0" + key;
        }
        key =  CardMonth.sMonthIndexes[this.card.title[CardMonth.sLang1]] + "/" + key;
      }
      else {
        var gdate = date as Content.GenericDate;
        key = gdate.dayOfWeek[CardMonth.sLang1] + " of week " + gdate.weekOfMonth[CardMonth.sLang1];
      }
      this.mDates.push([key, date.title[CardMonth.sLang1], date.title[CardMonth.sLang2]]);
    });
  }
}
