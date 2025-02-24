import {isEmpty, isStrDuplicate, isStrLenGreater} from "../common-validators.js";
import {SEOField} from "../types.js";
import {CheerioRoot} from "crawlee";
import Cheerio = cheerio.Cheerio;

export const uniqueTitles = new Set<string>();
export const uniqueMetaDescriptions = new Set<string>();

export default [
    {
        name: 'title',
        label: 'Title',
        getElement($: CheerioRoot): cheerio.Cheerio | undefined {
            return $('title');
        },
        getValue(el: Cheerio): string | string[] {
            return el.text();
        },
        rules: [
            {
                func: isEmpty,
                message: 'is required'
            },
            {
                func(value: string) : boolean {
                    return isStrLenGreater(value, 60);
                },
                message: 'character limit is 60'
            },
            {
                func(value: string) : boolean {
                    const res = isStrDuplicate(value, uniqueTitles);
                    if(!res) uniqueTitles.add(value);
                    return res;
                },
                message: 'is a duplicate'
            }
        ]
    },
    {
        name: 'meta_description',
        label: 'Meta Description',
        getElement($: CheerioRoot): Cheerio | undefined {
            return $('meta[name="description"]');
        },
        getValue(el: Cheerio): string | string[] {
            return el.prop('content');
        },
        rules: [
            {
                func: isEmpty,
                message: 'is required'
            },
            {
                func(value: string) : boolean {
                    return isStrLenGreater(value, 150);
                },
                message: 'character limit is 150'
            },
            {
                func(value: string) : boolean {
                    const res = isStrDuplicate(value, uniqueMetaDescriptions);
                    if(!res) uniqueMetaDescriptions.add(value);
                    return res;
                },
                message: 'is a duplicate'
            }
        ],
    },
    {
        name: 'image_alt',
        label: 'Image Alt',
        getElement($: CheerioRoot): cheerio.Cheerio | undefined {
            return $('img');
        },
        getValue(el: Cheerio): string | string[] {
            return el.prop('src');
        },
        rules: [
            {
                func: isEmpty,
                message: 'is required'
            },
            {
                func(value: string) : boolean {
                    return isStrLenGreater(value, 100);
                },
                message: 'character limit is 100'
            },
        ],
    },
    {
        name: 'h1',
        label: 'H1',
        getElement($: CheerioRoot): cheerio.Cheerio | undefined {
            return $('h1');
        },
        getValue(el: cheerio.Cheerio): string | string[] {
            return el.text();
        },
        rules: [
            {
                func: isEmpty,
                message: 'is required'
            },
            {
                func(value: string[]) : boolean {
                    return value.length > 1;
                },
                message: 'should only be one'
            },
        ],
    }
] as SEOField[];