import {CheerioRoot} from "crawlee";
import {FieldAudit, ParserResult, SEOField, SeoFieldRuleResult} from "../types.js";

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

    /**
     * Iterate seoFields property, get each value and check if it's valid and returns the audits
     * @param $
     */
    async parse({ $ } : { $: CheerioRoot }) : Promise<ParserResult>  {
        let resultPromises: Promise<SeoFieldRuleResult>[] = [];
        for(const seoField of this.seoFields) {
            resultPromises.push(seoField.validate({ $, url: this.url }));
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