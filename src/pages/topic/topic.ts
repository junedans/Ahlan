import { Component, Type, ViewContainerRef, ComponentFactoryResolver, ViewChild } from '@angular/core';

import { NavController, NavParams } from 'ionic-angular';
import * as Content from "../../model/appContent";
import { Platform } from 'ionic-angular/platform/platform';

type ArticleArray = Array<{template: string, card: Content.Card, component: any}>;

@Component({
  selector: 'topic',
  templateUrl: 'topic.html'
})
export class TopicPage {
  @ViewChild("articlesContainer", { read: ViewContainerRef }) articlesContainer;

  selectedTopic: any;
  topic: Content.Topic;
  articles: ArticleArray;
  useLocalImages: boolean;
  componentRef;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    platform: Platform,
    private resolver: ComponentFactoryResolver) {

    // If we navigated to this page, we will have a topic available as a nav param
    this.selectedTopic = navParams.get('topic');
    this.useLocalImages = platform.is('cordova');

    // Create a list of articles to render
    this.articles = this.loadArticles(this.selectedTopic.topic.cards);
  }

  public ngOnDestroy(){
    for (var i = 0; i < this.articles.length; i++) {
      if (this.articles[i].component) {
        this.articles[i].component.destroy();
        this.articles[i].component = null;
      }
    }
  }

  public ngOnInit(){
    // Resolve each component that correlates to the article
    this.resolveArticleComponents(this.articles);
  }

  private loadArticles(cards: Content.Card[]) {
    let articles: ArticleArray = [];
    for (let i = 0; i < cards.length; i++) {      
      articles.push({
        template: cards[i].constructor.name,
        card: cards[i],
        component: undefined
      });
    }

    return articles;
  }

  private resolveArticleComponents(articles: ArticleArray) {
    this.articlesContainer.clear(); 

    // Resolve the correct component to render each article data
    for (var i = 0; i < articles.length; i++) {
      var templateName: string = articles[i].template;
      console.log("Found template name: ", templateName);
      articles[i].component = this.createComponent(templateName, this.articlesContainer);

      if (articles[i].component && articles[i].component.instance) {
        articles[i].component.instance.card = articles[i].card;
        console.log("Successfully created component for the template", templateName);
      } else {
        console.warn('Unable to map Article to the', templateName, 'component. No such component exists.');
      }
    }
  }

  private createComponent(templateName: string, viewContainer: ViewContainerRef) {
    var factories = Array.from(this.resolver['_factories'].keys());
    var factoryClass = <Type<any>>factories.find((x: any) => x.name === templateName);
    
    if (factoryClass) {
      const factory = this.resolver.resolveComponentFactory(factoryClass);

      if (factory) {
        return viewContainer.createComponent(factory);
      }
    }

    return undefined;
  }
}
