import {CheerioRoot} from "crawlee";
import {SEOField} from "../types.js";

export interface ParserResult {
    url: string,
    audits: {[key: string]: FieldAudit}
}

export interface FieldAudit {
    name: string,
    value: string,
    group: string,
    elementTag?: string | null | undefined,
    errors: string[],
}

export interface SetFieldAuditParam extends Omit<FieldAudit, "errors"> {
    error: string
}

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

    setFieldAudit({ name, value, error, group, elementTag} : SetFieldAuditParam) {
        if(!this.audits.has(name)) {
            this.audits.set(name, {name, value, group, elementTag, errors: []});
        }
        this.audits.get(name)?.errors.push(error);
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
     * Convert audits value from Map to Object
     */
    getFieldAuditsAsObject() : {[key: string] : FieldAudit}{
        const obj = {} as {[key: string] : FieldAudit};
        for(const [k, v] of this.audits) {
            obj[k] = v;
        }
        return obj;
    }

    /**
     * Iterate seoFields property, get each value and check if it's valid and returns the audits
     * @param $
     */
    async parse({ $ } : { $: CheerioRoot }) : Promise<ParserResult>  {
        let globalSkipRules = new Set<string>();
        for(const seoField of this.seoFields) {
            const el = seoField.getElement($);
            if(el) {
                el.each((index, subEl) => {
                    const value = seoField.getValue({ el: $(subEl), $});
                    for (const rule of seoField.rules) {
                        if(globalSkipRules.has(rule.name)) continue;
                        const ruleResult = rule.validate({ value, el: $(subEl), $});
                        if(!ruleResult.valid) {
                            if(ruleResult.skipRules) {
                                globalSkipRules = new Set<string>([...globalSkipRules, ...ruleResult.skipRules]);
                            }

                            const auditName = el.length < 2 ? seoField.name : seoField.name + '_' + index;
                            this.setFieldAudit({
                                name: auditName,
                                value: value,
                                group: this.group,
                                error: `${seoField.label} ${rule.errorMessage}`,
                                elementTag: $(subEl).html(),
                            });
                        }
                    }
                })
            }
        }

        return {
            url: this.url,
            audits: this.getFieldAuditsAsObject(),
        }
    }
}