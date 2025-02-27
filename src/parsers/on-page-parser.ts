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
                getValue({ el }): string {
                    return el.text();
                },
                rules: [
                    {
                        name: 'required',
                        validate: ({ value }) => {
                            return { valid: isNotEmpty(value), skipRules: ['unique_titles', 'char60'] };
                        },
                        errorMessage: 'is required'
                    },
                    {
                        name: 'char60',
                        validate({ value }) {
                            return { valid: isStrLenLessOrEqual(value, 60) };
                        },
                        errorMessage: 'character limit is 60'
                    },
                    {
                        name: 'unique_titles',
                        validate({ value }) {
                            const res = isStrUnique(value, self.uniqueTitles);
                            if(!res) self.uniqueTitles.add(value);
                            return { valid: res };
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
                getValue({ el }): string {
                    return el.prop('content');
                },
                rules: [
                    {
                        name: 'required',
                        validate: ({ value }) => {
                            return { valid: isNotEmpty(value), skipRules: ['unique_meta_description', 'char150'] };
                        },
                        errorMessage: 'is required'
                    },
                    {
                        name: 'char150',
                        validate({ value }) {
                            return { valid: isStrLenLessOrEqual(value, 150) };
                        },
                        errorMessage: 'character limit is 150'
                    },
                    {
                        name: 'unique_meta_description',
                        validate({ value }) {
                            const res = isStrUnique(value, self.uniqueMetaDescriptions);
                            if(!res) self.uniqueMetaDescriptions.add(value);
                            return { valid: res };
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
                getValue({ el }): string {
                    return el.prop('src');
                },
                rules: [
                    {
                        name: 'required',
                        validate: ({ value }) => {
                            return { valid: isNotEmpty(value), skipRules: ['char100'] };
                        },
                        errorMessage: 'is required'
                    },
                    {
                        name: 'char100',
                        validate({ value }) {
                            return { valid: isStrLenLessOrEqual(value, 100) };
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
                getValue({ el }): string {
                    return el.val();
                },
                rules: [
                    {
                        name: 'h1_required',
                        validate({ el }) {
                            return { valid: isNotEmpty(el.text()), skipRules: ['one_h1_only'] };
                        },
                        errorMessage: 'is required'
                    },
                    {
                        name: 'one_h1_only',
                        validate({ el }) {
                            return { valid: el.length == 1 };
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