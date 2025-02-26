import {CheerioRoot} from "crawlee";
import {PageParser} from "./page-parser.js";
import {isNotEmpty, isStrLenLessOrEqual, isStrUnique} from "../common-validators.js";
import Cheerio = cheerio.Cheerio;

export class OnPageParser extends PageParser
{
    uniqueMetaDescriptions = new Set<string>();
    uniqueTitles = new Set<string>();

    override setup() {
        const self = this;
        this.seoFields = [
            {
                name: 'title',
                label: 'Title',
                getElement($: CheerioRoot): cheerio.Cheerio | undefined {
                    return $('title');
                },
                getValue(el: Cheerio): string {
                    return el.text();
                },
                rules: [
                    {
                        validate: ({ value }) => isNotEmpty(value),
                        errorMessage: 'is required'
                    },
                    {
                        validate({ value }) : boolean {
                            return isStrLenLessOrEqual(value, 60);
                        },
                        errorMessage: 'character limit is 60'
                    },
                    {
                        validate({ value }) : boolean {
                            const res = isStrUnique(value, self.uniqueTitles);
                            if(!res) self.uniqueTitles.add(value);
                            return res;
                        },
                        errorMessage: 'is a duplicate'
                    }
                ]
            },
            {
                name: 'meta_description',
                label: 'Meta Description',
                getElement($: CheerioRoot): Cheerio | undefined {
                    return $('meta[name="description"]');
                },
                getValue(el: Cheerio): string {
                    return el.prop('content');
                },
                rules: [
                    {
                        validate: ({ value }) => isNotEmpty(value),
                        errorMessage: 'is required'
                    },
                    {
                        validate({ value }) : boolean {
                            return isStrLenLessOrEqual(value, 150);
                        },
                        errorMessage: 'character limit is 150'
                    },
                    {
                        validate({ value }) : boolean {
                            const res = isStrUnique(value, self.uniqueMetaDescriptions);
                            if(!res) self.uniqueMetaDescriptions.add(value);
                            return res;
                        },
                        errorMessage: 'is a duplicate'
                    }
                ],
            },
            {
                name: 'image_alt',
                label: 'Image Alt',
                getElement($: CheerioRoot): cheerio.Cheerio | undefined {
                    return $('img');
                },
                getValue(el: Cheerio): string {
                    return el.prop('src');
                },
                rules: [
                    {
                        validate: ({ value }) => isNotEmpty(value),
                        errorMessage: 'is required'
                    },
                    {
                        validate({ value }) : boolean {
                            return isStrLenLessOrEqual(value, 100);
                        },
                        errorMessage: 'character limit is 100'
                    },
                ],
            },
            {
                name: 'h1',
                label: 'H1',
                getElement($: CheerioRoot): cheerio.Cheerio | undefined {
                    return $('h1');
                },
                getValue(el: cheerio.Cheerio): string {
                    return el.text();
                },
                rules: [
                    {
                        validate({ el }) {
                            let hasContent = false;
                            el.each((_, subEl) => {
                                if(isNotEmpty( subEl.data?.toString() ?? '')) hasContent = true;
                            });
                            return hasContent;
                        },
                        errorMessage: 'is required'
                    },
                    {
                        validate({ el }) : boolean {
                            return el.length == 1;
                        },
                        errorMessage: 'should only be one per page'
                    },
                ],
            }
        ];
        this.arrayValuedSeoFields = ['image_alt'];
        this.group = 'on-page';
    }
}