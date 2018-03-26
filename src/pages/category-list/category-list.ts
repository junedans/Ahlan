import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { CategoryPage } from '../category/category';
import { ContentProvider } from '../../services/contentProvider';
import { Category } from "../../model/appContent";

@Component({
  selector: 'category-list',
  templateUrl: 'category-list.html',
  providers: [ContentProvider]
})
export class CategoryListPage {
  categories: Array<{title: string, color: string, translation: string, category: Category}>;
  cloudUpdated: boolean;

  constructor(public navCtrl: NavController, public navParams: NavParams, private contentProvider: ContentProvider) {
    this.categories = [];
    this.cloudUpdated = false;

    console.log("Preparing category view.");
    this.contentProvider.getLocalContent().then(categories => {
      console.log("Got local content in category view.");
      // Make sure the call to refreshContent below didn't finish before we get here
      if (!this.cloudUpdated) {
        this.assignContent(categories);
      }
      else {
        console.log("NOT finishing update from local cache - already applied latest update from cloud.");
      }
    });

    this.contentProvider.getLastUpdateTime().then(time => {
      let age = new Date().valueOf() - time.valueOf();
      let oneDay = 24*60*60*1000;
      
      console.log(`Stored content age: ${age}`);
      
      if (age > oneDay) {
        console.log("Stored content too old - updating from web.")
        this.refreshContent();
      }
      else { console.log("NOT getting fresh content - stored content is new enough."); }
    });

  }

  refreshContent(refresher = null) {
    this.contentProvider.getUpdatedContent().then(categories => {
      console.log("Got new content in category view.");
      
      this.categories = [];
      this.assignContent(categories);
      this.cloudUpdated = true;
      
      if (refresher != null) {
        refresher.complete();
      }
    });
  }

  assignContent(freshCategories: Category[]) {
    if (freshCategories != null) {
      console.log("Adding updated content to view.");
      for(let i = 0; i < freshCategories.length; i++) {
        this.categories.push({
          title: freshCategories[i].title['ar'],
          color: freshCategories[i].color,
          translation: freshCategories[i].title['en-US'],
          category: freshCategories[i]
        })
      }
    }
  }

  categoryTapped(event, category) {
    this.navCtrl.push(CategoryPage, {
      category: category
    });
  }
}
