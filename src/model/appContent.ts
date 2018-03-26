export abstract class ContentBase {
    public id: string;
    public slug: string;
    public title: Map<string, string>;
    public childIds: string[] = new Array<string>();
    public parent: ContentBase;

    constructor(id: string, slug: string, title: Map<string, string>) {
        this.id = id;
        this.slug = slug;
        this.title = title;
    }

    populateChildIds(ids: any[], container: any[] = null) {
        if (ids != null) {
            let list = container != null ? container : this.childIds;
            ids.forEach(i => list.push(i.sys.id));
        }
    }

    extractIdFromMap(content, key) {
        return (content != null) && (content[key] != null) ? content[key].sys.id : null;
    }
}

export abstract class ContentBaseContainer extends ContentBase {

    abstract sortChildItems();

    protected helperToLinkToChildAsParent(child: ContentBase, container: Array<ContentBase>) {
        if (this.childIds.indexOf(child.id) >= 0) {
            child.parent = this;
            container.push(child)
        }
    }

    protected helperToSortChildItems(container: Array<ContentBase>) {
        container.sort((a, b) =>
            (a.title != null) && (b.title != null) ?
                a.title['en-US'].localeCompare(b.title['en-US']) :
                a.id.localeCompare(b.id)
        );
    }
}

export class Category extends ContentBaseContainer {
    public color: string;
    public topics: Topic[] = new Array<Topic>();
    public keywords: KeywordList;

    constructor(id: string, slug: string, title: Map<string, string>, color: string, topicList: any[]) {
        super(id, slug, title);
        this.color = color;
        this.populateChildIds(topicList);
    }

    findKeywords(keywords: KeywordList[]) {
        for (var i = 0; i < keywords.length; i++) {
            if (this.childIds.findIndex(c => c == keywords[i].id) >= 0){
                this.keywords = keywords[i];
                break;
            }
        }
    }

    linkToChildAsParent(child: ContentBase) {
        this.helperToLinkToChildAsParent(child, this.topics);
    }

    sortChildItems() {
        this.helperToSortChildItems(this.topics);
        if (this.keywords) {
            this.keywords.sortChildItems();
        }
    }
}

export class Topic extends ContentBaseContainer {
    public cards: Card[] = new Array<Card>();
    public icon: string;

    constructor(jsonData: any) {
        super(jsonData.sys.id,
              jsonData.fields.topicSlug != null ? jsonData.fields.topicSlug : jsonData.fields.articleSlug,
              jsonData.fields.title);

        if (jsonData.fields.iconClass != null && jsonData.fields.iconClass['en-US'] != null) {
            this.icon = jsonData.fields.iconClass['en-US'];
        }
        if (jsonData.fields.cardsCollection != null && jsonData.fields.cardsCollection['en-US'] != null) {
            this.populateChildIds(jsonData.fields.cardsCollection['en-US']);
        }
    }

    linkToChildAsParent(child: ContentBase) {
        this.helperToLinkToChildAsParent(child, this.cards);
    }

    sortChildItems() {
        this.helperToSortChildItems(this.cards);
    }
}

// Keywords
export class KeywordList extends ContentBaseContainer {
    public keywords: Keyword[] = Array<Keyword>();

    constructor(jsonData: any) {
        super(jsonData.sys.id,
              jsonData.fields.topicSlug != null ? jsonData.fields.topicSlug : jsonData.fields.articleSlug,
              jsonData.fields.title);

        if (jsonData.fields.keywordsCollection != null && jsonData.fields.keywordsCollection['en-US'] != null) {
            this.populateChildIds(jsonData.fields.keywordsCollection['en-US']);
        }
    }

    findKeywords(keywords: Keyword[]) {
        keywords.forEach(k => { if (this.childIds.indexOf(k.id) >= 0) this.keywords.push(k) });
    }

    sortChildItems() {
        this.helperToSortChildItems(this.keywords);
    }
}

export class Keyword extends ContentBase {
    public phonetic: Map<string, string>;

    constructor(jsonData: any) {
        super(jsonData.sys.id,
              null,
              jsonData.fields.keywordTitle);
        this.phonetic = jsonData.fields.keywordPhonetic;
    }
}

// L3

export abstract class Card extends ContentBase {
    constructor(id: string, title: Map<string, string>) {
        super(id, null, title);
    }
}

export class CardTextBlock extends Card {
    // Uses 'Description'
    constructor(id: string, title: Map<string, string>) {
        super(id, title);
    }
}

export class CardImageTextBlock extends Card {
    // Uses 'Description'
    public image: Image;
    constructor(id: string, title: Map<string, string>, image: Map<string, any>) {
        super(id, title);
        this.image = new Image(null, this.extractIdFromMap(image, 'en-US'));
    }

    findImage(images: Image[]) {
        images.forEach(i => { if (i.id == this.image.id) this.image = i })
    }
}

export class CardExampleComparison extends Card {
    // Uses 'Description'
    public image_positive: Image;
    public image_negative: Image;
    constructor(id: string, title: Map<string, string>, imgPos: Map<string, any>, imgNeg: Map<string, any>) {
        super(id, title);
        this.image_positive = new Image(null, this.extractIdFromMap(imgPos, 'en-US'));
        this.image_negative = new Image(null, this.extractIdFromMap(imgNeg, 'en-US'));
    }

    findImages(images: any[]) {
        images.forEach(i => {
            if (i.id == this.image_positive.id) this.image_positive = i;
            if (i.id == this.image_negative.id) this.image_negative = i;
        })
    }
}

export class CardRulesComparison extends Card {
    // Uses 'Title'
    public image: Image;
    public dos: MediaItem[] = new Array<MediaItem>();
    public donts: MediaItem[] = new Array<MediaItem>();
    public doIds: string[] = new Array<string>();
    public dontIds: string[] = new Array<string>();
    constructor(id: string, title: Map<string, string>, image: Map<string, any>, dosList: any[], dontsList: any[]) {
        super(id, title);
        this.image = new Image(null, this.extractIdFromMap(image, 'en-US'));
        this.populateChildIds(dosList, this.doIds);
        this.populateChildIds(dontsList, this.dontIds);
    }

    findMediaChildren(media: MediaItem[]) {
        media.forEach(m => {
            if (this.doIds.findIndex(i => i == m.id) >= 0) this.dos.push(m)
            if (this.dontIds.findIndex(i => i == m.id) >= 0) this.donts.push(m)
        });
    }

    findImage(images: any[]) {
        images.forEach(i => { if (i.id == this.image.id) this.image = i })
    }
}

export class CardItemsExplanation extends Card {
    // Uses 'Description' and 'Title'
    public image: Image;
    public items: MediaItem[] = new Array<MediaItem>();
    public description: Map<string, string>;
    constructor(id: string, title: Map<string, string>, description: Map<string, string>, image: Map<string, any>, itemList: any[]) {
        super(id, title);
        this.image = new Image(null, this.extractIdFromMap(image, 'en-US'));
        this.description = description;
        this.populateChildIds(itemList);
    }

    findMediaChildren(media: MediaItem[]) {
        media.forEach(m => { if (this.childIds.findIndex(c => c == m.id) >= 0) this.items.push(m) });
    }

    findImage(images: any[]) {
        images.forEach(i => { if (i.id == this.image.id) this.image = i })
    }
}

export class CardUnitComparison extends Card {
    // Uses 'Description'
    public image: Image;
    public units: UnitComparison[] = new Array<UnitComparison>();
    constructor(id: string, title: Map<string, string>, image: Map<string, any>, unitList: any[]) {
        super(id, title);
        this.image = new Image(null, this.extractIdFromMap(image, 'en-US'));
        this.populateChildIds(unitList);
    }

    findUnitChildren(unit: UnitComparison[]) {
        unit.forEach(u => { if (this.childIds.findIndex(c => c == u.id) >= 0) this.units.push(u) });
    }

    findImage(images: any[]) {
        images.forEach(i => { if (i.id == this.image.id) this.image = i })
    }
}

export class CardMonth extends Card {
    // Uses neither 'Description' nor 'Title'
    // Use Month for title
    public dates: DateBase[] = new Array<DateBase>();
    constructor(id: string, title: Map<string, string>, dateList: any[]) {
        super(id, title);
        this.populateChildIds(dateList);
    }

    findDateChildren(dates: DateBase[]) {
        dates.forEach(d => { if (this.childIds.findIndex(c => c == d.id) >= 0) this.dates.push(d) });
    }
}

// Other supporting Content types (children of Cards)

export class Image extends ContentBase {
    public data: Map<string, any>
    public created: string;
    public updated: string;
    constructor(jsonData: any, id: string = null) {
        if (jsonData != null) {
            super(jsonData.sys.id, null, jsonData.fields.title);
            this.data = jsonData.fields.file;
            this.created = jsonData.sys.createdAt;
            this.updated = jsonData.sys.updatedAt;
       }
       else {
           this.id = id;
       }
    }

    get url(): string { return this.available ? this.data["en-US"].url : ""; }

    get available(): boolean { return this.data && this.data["en-US"]; }

    get type(): string { return this.data["en-US"].contentType.split("/")[1] }

    get filename(): string { return this.id + "." + this.type; }

    displayPath(file: boolean): string { return file ? `/${Image.fileDirectory}/${this.filename}` : this.url; }

    static get fileDirectory(): string { return "images"}

    static isImage(jsonData: any, locale: string): boolean {
        if (jsonData != null &&
            jsonData.fields != null &&
            jsonData.fields.file != null &&
            jsonData.fields.file[locale] != null &&
            jsonData.fields.file[locale].contentType != null)
        {
            let type = jsonData.fields.file[locale].contentType.split("/")[0];
            if (type != null) {
                return type == "image";
            }
        }
        return false;
    }
}

export abstract class DateBase extends ContentBase { }

export class SpecificDate extends DateBase {
    // Uses 'Title'
    public dayOfMonth: number;
    constructor(id: string, title: Map<string, string>, dayOfMonth: number) {
        super(id, null, title);
        this.dayOfMonth = dayOfMonth;
    }
}

export class GenericDate extends DateBase {
    // Uses 'Title'
    public weekOfMonth: number;
    public dayOfWeek: string;
    constructor(id: string, title: Map<string, string>, weekOfMonth: number, dayOfWeek: string) {
        super(id, null, title);
        this.weekOfMonth = weekOfMonth;
        this.dayOfWeek = dayOfWeek;
    }
}

export class MediaItem extends ContentBase {
    // Uses ItemText for title
    public iconClass: string;
    public iconImage: Image;
    constructor(id: string, title: Map<string, string>, iconClass: string, iconImage: Map<string, any>) {
        super(id, null, title);
        this.iconClass = iconClass;
        this.iconImage = new Image(null, this.extractIdFromMap(iconImage, 'en-US'));
    }

    get useIcon():boolean { return this.iconClass != null; }

    findImage(images: any[]) {
        images.forEach(i => { if (i.id == this.iconImage.id) this.iconImage = i })
    }
}

export class UnitComparison extends ContentBase {
    // Uses 'Title'
    public leftUnit: Unit;
    public rightUnit: Unit;
    public leftId: string;
    public rightId: string;
    constructor(id: string, title: Map<string, string>, leftUnit: Map<string, any>, rightUnit: Map<string, any>, key: string) {
        super(id, null, title);
        this.leftId = this.extractUnitId(leftUnit, key);
        this.rightId = this.extractUnitId(rightUnit, key);
    }

    extractUnitId(unit, key) { return unit != null && unit[key] != null ? unit[key].sys.id : null; }

    findUnitChildren(units: Unit[]) {
        units.forEach(u => {
            if (u.id == this.leftId) this.leftUnit = u;
            else if (u.id == this.rightId) this.rightUnit = u;
        });
    }
}

export class Unit extends ContentBase {
    // Uses 'Title'
    public name: string;
    public value: string;
    constructor(id: string, title: Map<string, string>, name: string, value: string) {
        super(id, null, title);
        this.name = name;
        this.value = value;
    }
}

export class ContentTypes {
    public static readonly Category: string = 'category';
    public static readonly Topic: string = 'topic';

    public static readonly KeywordList: string = 'Keywords';
    public static readonly KeywordItem: string = 'keywordItem';

    public static readonly CardTextBlock: string = 'cardTextBlock';
    public static readonly CardImageTextBlock: string = 'cardImageTextBlock';
    public static readonly CardExampleComparison: string = 'cardExampleComparison';
    public static readonly CardRulesComparison: string = 'cardRulesComparison';
    public static readonly CardItemsExplanation: string = 'cardItemsExplanation';
    public static readonly CardUnitComparison: string = 'cardUnitComparison';
    public static readonly CardMonth: string = 'cardMonth';

    public static readonly SpecificDate: string = 'specificDate';
    public static readonly GenericDate: string = 'genericDate';
    public static readonly MediaItem: string = 'mediaItem';
    public static readonly UnitComparison: string = 'unitComparison';
    public static readonly Unit: string = 'unit';

}
