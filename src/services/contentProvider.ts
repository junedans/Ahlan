import { Injectable } from "@angular/core";
import { Platform } from "ionic-angular/platform/platform";
import { Storage } from '@ionic/storage';
import { File } from "@ionic-native/file";
import { ContentUpdater } from "./contentUpdater";
import { Category, Topic, KeywordList, Keyword, Card, CardTextBlock, CardImageTextBlock, CardExampleComparison,
        CardRulesComparison, CardItemsExplanation, CardUnitComparison, CardMonth, DateBase,
        GenericDate, SpecificDate, MediaItem, UnitComparison, Unit, ContentTypes, Image } from "../model/appContent";

@Injectable()
export class ContentProvider {
    categories: Array<Category>;
    contentReady: boolean = false;

    constructor(private platform: Platform, private storage: Storage, private file: File, private contentUpdater: ContentUpdater) { }

    getLocalContent(): Promise<Category[]> {
        if (this.contentReady) {
            return new Promise<Category[]>(() => this.categories );
        }

        return this.updateContent();
    }

    // Utility function for testing
    clearLocalContent() {
        return this.storage.set('content', null).then(() => {
            return null;
        });
    }

    getUpdatedContent(): Promise<Category[]> {
        return this.contentUpdater.refreshContent().then(() => {
            this.setLastUpdateTime(new Date());
            return this.updateContent();
        });
    }

    getLastUpdateTime(): Promise<Date> {
        return this.storage.get('contentUpdated').then(time => time || new Date(0));
    }

    private updateContent(): Promise<Category[]> {
        return this.storage.get('content').then(content => {
            console.log("Parsing content in Provider.");
            this.categories = this.parseJsonContent(content);
            this.contentReady = true;
            return this.categories;
        });
    }

    private setLastUpdateTime(time: Date): Promise<void> {
        return this.storage.set('contentUpdated', time);
    }

    private parseJsonContent(content: any): Category[] {
        if (content == null) return null;

        var newContent = new Array<Category>();
        var tempTopics = new Array<Topic>();
        var keywordLists = new Array<KeywordList>();
        var keywords = new Array<Keyword>();
        var tempCards = new Array<Card>();
        var tempDates = new Array<DateBase>();
        var tempMedia = new Array<MediaItem>();
        var tempUnitPair = new Array<UnitComparison>();
        var tempUnits = new Array<Unit>();
        let length: number = content.total;
        for(let i = 0; i < length; i++) {
            let element = content.items[i];
            let contentType: string = element.sys.contentType.sys.id;
            let fields = element.fields;
            switch(contentType)
            {
                // L1
                case ContentTypes.Category:
                    var topicsColl = fields.topicsCollection;
                    if (topicsColl == null) { topicsColl = fields.articlesCollection; }
                    var cat = new Category(
                        element.sys.id,
                        fields.categorySlug,
                        fields.title,
                        fields.color['en-US'],
                        this.getKeyIfNotNull(topicsColl, 'en-US'));
                    newContent.push(cat);
                    break;
                // L2
                case ContentTypes.Topic:
                case 'article':
                    let title = this.getKeyIfNotNull(element.fields.title, 'en-US');
                    if (title != null && title == ContentTypes.KeywordList) {
                        keywordLists.push(new KeywordList(element));
                    }
                    else {
                        tempTopics.push(new Topic(element));
                    }
                    break;

                // Keywords
                case ContentTypes.KeywordItem:
                    keywords.push(new Keyword(element));
                    break;

                // L3 Types (Cards)
                case ContentTypes.CardTextBlock:
                    tempCards.push(new CardTextBlock(
                        element.sys.id,
                        fields.description));
                    break;
                case ContentTypes.CardImageTextBlock:
                    tempCards.push(new CardImageTextBlock(
                        element.sys.id,
                        fields.description,
                        fields.image));
                    break;
                case ContentTypes.CardExampleComparison:
                    tempCards.push(new CardExampleComparison(
                        element.sys.id,
                        fields.description,
                        fields.correctImage,
                        fields.wrongImage));
                        // add images
                    break;
                case ContentTypes.CardRulesComparison:
                    tempCards.push(new CardRulesComparison(
                        element.sys.id,
                        fields.title,
                        fields.mainImage,
                        this.getKeyIfNotNull(fields.dosList, 'en-US'),
                        this.getKeyIfNotNull(fields.dontsList, 'en-US')));
                    break;
                case ContentTypes.CardItemsExplanation:
                    tempCards.push(new CardItemsExplanation(
                        element.sys.id,
                        fields.title,
                        fields.description,
                        fields.image,
                        this.getKeyIfNotNull(fields.itemsList, 'en-US')));
                    break;
                case ContentTypes.CardUnitComparison:
                    tempCards.push(new CardUnitComparison(
                        element.sys.id,
                        fields.description,
                        fields.image,
                        this.getKeyIfNotNull(fields.unitList, 'en-US')));
                    break;
                case ContentTypes.CardMonth:
                    tempCards.push(new CardMonth(
                        element.sys.id,
                        fields.month,
                        this.getKeyIfNotNull(fields.datesList, 'en-US')));
                    break;

                // Supporting content (children of L3)
                case ContentTypes.GenericDate:
                    tempDates.push(new GenericDate(
                        element.sys.id,
                        fields.title,
                        fields.weekOfMonth,
                        fields.dayOfWeek));
                    break;
                case ContentTypes.SpecificDate:
                    tempDates.push(new SpecificDate(
                        element.sys.id,
                        fields.title,
                        fields.dayOfMonth));
                    break;
                case ContentTypes.MediaItem:
                    tempMedia.push(new MediaItem(
                        element.sys.id,
                        fields.itemText,
                        fields.iconClass,
                        fields.iconImage));
                    break;
                case ContentTypes.UnitComparison:
                    tempUnitPair.push(new UnitComparison(
                        element.sys.id,
                        fields.title,
                        fields.leftUnit,
                        fields.rightUnit,
                        'en-US'));
                    break;
                case ContentTypes.Unit:
                    tempUnits.push(new Unit(
                        element.sys.id,
                        fields.title,
                        fields.name,
                        fields.value));
                    break;
            }
        }

        // Save assets (such as images)
        var tempImages: any[] = new Array<any>();
        var imagesDownloaded = 0;
        if (content.includes != null && content.includes.Asset != null) {
            let assetCount = content.includes.Asset.length;
            for (var i = 0; i < assetCount; i++) {
                let a = content.includes.Asset[i];
                if (Image.isImage(a, "en-US")) {
                    console.log("Got one image!");
                    let image = new Image(a);
                    tempImages.push(image);
                    this.downloadImage(image, () => {
                        imagesDownloaded++;
                        console.log(imagesDownloaded, " images downloaded.");
                    });
                }
            }
        }

        console.log(`Got ${newContent.length} Categories, ${tempTopics.length} Topics, ${keywordLists.length} KeywordLists,`
                    + ` ${keywords.length} Keywords, ${tempCards.length} Cards, ${tempDates.length} Dates,`
                    + ` ${tempMedia.length} Media, ${tempUnitPair.length} UnitPairs, ${tempUnits.length} Units`);

        // Link Units to the UnitComparisons that reference them
        tempUnitPair.forEach(pair => pair.findUnitChildren(tempUnits));

        // Link supporting content to their Cards
        tempMedia.forEach(media => media.findImage(tempImages));

        tempCards.forEach(card => {
            switch (card.constructor.name) {
                case CardImageTextBlock.name:
                    (card as CardImageTextBlock).findImage(tempImages);
                    break;
                case CardExampleComparison.name:
                    (card as CardExampleComparison).findImages(tempImages);
                    break;
                case CardRulesComparison.name:
                    (card as CardRulesComparison).findMediaChildren(tempMedia);
                    (card as CardRulesComparison).findImage(tempImages);
                    break;
                case CardItemsExplanation.name:
                    (card as CardItemsExplanation).findMediaChildren(tempMedia);
                    (card as CardItemsExplanation).findImage(tempImages);
                    break;
                case CardUnitComparison.name:
                    (card as CardUnitComparison).findUnitChildren(tempUnitPair);
                    (card as CardUnitComparison).findImage(tempImages);
                    break;
                case CardMonth.name:
                    (card as CardMonth).findDateChildren(tempDates);
                    break;
            }
        });

        // assign keywords
        keywordLists.forEach(list => list.findKeywords(keywords));
        newContent.forEach(category => {
            category.findKeywords(keywordLists);
        });

        // Loop through all Card content and link each to the Topic that owns it
        tempCards.forEach(c => tempTopics.forEach(t => t.linkToChildAsParent(c)));

        // link Keyword lists to parent Category
        newContent.forEach(cat => cat.findKeywords(keywordLists));

        // Loop through all Topic content and link each to the Category that owns it
        tempTopics.forEach(t => {
            t.sortChildItems();
            newContent.forEach(c => c.linkToChildAsParent(t));
        });

        newContent.sort((a, b) => {
            return this.categorySortOrder.indexOf(a.id) - this.categorySortOrder.indexOf(b.id);
        });

        newContent.forEach(cat => cat.sortChildItems());

        this.contentReady = true;
        return newContent;
    }

    getKeyIfNotNull(map: Map<string, any>, key: string) {
        return map != null ? map[key] : null;
    }

    downloadImage(image: Image, next: () => void) {
        let updateTimestamp = () => {
            this.storage.set(image.id, image.updated);
        }

        this.storage.get(image.id).then(lastUpdate => {
            if (lastUpdate == null || lastUpdate < image.updated) {
                this.contentUpdater.getImage(image.url).then(data => {
                    if (this.platform.is('cordova')) {
                        let saveImage = () => {
                            this.file.writeFile(this.file.dataDirectory + `/${Image.fileDirectory}`, image.filename, data)
                                .then(_ => {
                                    updateTimestamp();
                                    next();
                                });
                        }

                        this.file.checkDir(this.file.dataDirectory, Image.fileDirectory).then(_ => saveImage() )
                        .catch(_ => {
                            this.file.createDir(this.file.dataDirectory, Image.fileDirectory, false).then( _ => {
                                this.file.writeFile(this.file.dataDirectory +`/${Image.fileDirectory}`, image.filename, data).then(_ => saveImage());
                            });
                        });
                    }
                    else {
                        // Can't save image to file right now
                        next();
                    }
                });

            }
        });
    }

    categorySortOrder = [
        '2pTwwcY4cYEyE6WymousaG',
        '4Kpjj8p4Lm2Ue0eig0GkYe',
        'Bs0Nh2qPZYwWUEOsKQUuG',
        '2qz5IBH4qM4G2yIwUMGWay',
        '4FfiKbFjg4ImqEeyyGsu48',
        '4K8JUyNPI4A8oWS6kW4moY',
        '1EoR1dli0Yk88KKOUC0SCi'
    ]
}
