import {type CheerioRoot} from "crawlee";
import type {FieldAudit, ParserResult, SEOField, SeoFieldRuleResult} from "../types.js";

export class PageParser {
    public url: string;

    public $: CheerioRoot;
    /**
     * Contains all the errors of the page
     */
    public audits;
    /**
     * List of SEO elements to check
     */
    public seoFields: SEOField[] | [] = [];
    /**
     * List of seo fields whose values are arrays
     */
    public arrayValuedSeoFields: string[] = [];
    /**
     * Group of the audits
     */
    public group: string = '';

    /**
     * Store keywords of a page
     */
    keywords: {word: string, count: number, density: number}[] = [];

    constructor(url: string, $: CheerioRoot) {
        if(!url.startsWith("http")) {
            url = "https://" + url;
        }
        this.url = url;
        this.$ = $;
        this.audits = new Map<string, FieldAudit>();
        this.setup();
    }

    /**
     * Overridable on class construct
     */
    setup() {
    }

    setFieldAudit({ name, errors } : FieldAudit) {
        if(!this.audits.has(name)) {
            this.audits.set(name, {name, errors: []});
        }
        this.audits.get(name)!.errors = [
            ...this.audits.get(name)!.errors,
            ...errors,
        ];
    }

    getFieldAudit(name: string) : FieldAudit | null {
        return this.audits.get(name) ?? null;
    }

    clearFieldAudits() {
        this.audits.clear();
    }

    getFieldAudits() {
        const clone = new Map();
        for(const [k, v] of this.audits) {
            clone.set(k, v);
        }
        return clone;
    }

    /**
     * Convert audits value from map to array
     */
    getFieldAuditsAsArray() : FieldAudit[] {
        const audits = [];
        for(const [k, v] of this.audits) {
            let errors = [];
            for(const err of v.errors) {
                errors.push(err);
            }
            audits.push({name: v.name, errors});
        }
        return audits;
    }

    processKeywords({ $ } : { $: CheerioRoot }) {
        const htmlText = $('body').text().toLowerCase();
        const keywordsCounter = new Map<string, number>();
        const ignoreWords = ['a', 'the', 'and'];
        const words = htmlText.split(' ');
        for(let word of words) {
            word = word.trim().replaceAll(/^a-zA-Z0-9/gi, '') ?? '';
            if(word.length == 0 || ignoreWords.includes(word)) continue;
            let counter = 1;
            if(keywordsCounter.has(word)) {
                counter = keywordsCounter.get(word)! + 1;
            }
            keywordsCounter.set(word, counter)
        }

        const totalWords = keywordsCounter.size;
        if(totalWords > 0) {
            for(const [k, v] of keywordsCounter) {
                const density = parseFloat((v / totalWords * 100).toFixed(3)) ;
                if(density < .5 || density > 2.5) continue;
                this.keywords.push({word: k, count: v, density: density});
            }
        }
        this.keywords.sort(function(a, b) {
            if(a.density > b.density) return 1;
            else if(a.density < b.density) return -1;
            return 0;
        });
    }

    getKeywords() {
        return this.keywords;
    }

    /**
     * Iterate seoFields property, get each value and check if it's valid and returns the audits
     * @param $
     */
    async parse({ $ } : { $: CheerioRoot }) : Promise<ParserResult>  {
        this.processKeywords({ $ });

        let resultPromises: Promise<SeoFieldRuleResult>[] = [];
        for(const seoField of this.seoFields) {
            resultPromises.push(seoField.validate({ $, url: this.url, keywords: this.keywords }));
        }
        const results = await Promise.all(resultPromises);
        for(const result of results) {
            if(result.valid) continue;

            this.setFieldAudit({
                name: result.name,
                errors: result.errors ?? [],
            });
        }

        return {
            url: this.url,
            audits: this.getFieldAuditsAsArray(),
        }
    }
}