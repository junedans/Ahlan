import { Injectable } from "@angular/core";
import { Storage } from '@ionic/storage';
import { Http } from '@angular/http';

@Injectable()
export class ContentUpdater {

  constructor(private storage: Storage, private http: Http) { }

  refreshContent(clearCache: boolean = false): Promise<void> {
    if (clearCache) {
      console.log("Clearing cache.");
      return this.storage.set('content', null).then(() => console.log("Clearing cache done."));
    }
    
    var url = 'https://cdn.contentful.com/spaces/ufhb7fd3pkxt/entries?access_token=a5208b6adf33f3e44bfa3e1834b8214c155f62ee67f44df4983d2ab02b248a2a&locale=*&limit=1000';
    return this.http.get(url)
      .toPromise()
      .then( response => {
        console.log("Got http response.");
        this.storage.set('content', response.json()).then(() => {
          console.log("content set.");
        });
      });
  }

  getImage(url: string): Promise<ArrayBuffer> {
    return this.http.get(url).toPromise()
      .then(response => {
        if (response.ok) {
          return response.arrayBuffer();
        }
        else {
          return null;
        }
      });
  }

}
