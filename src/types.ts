import {CheerioRoot} from "crawlee"
import Cheerio = cheerio.Cheerio;

export interface SeoFieldRule {
    name: string,
    validate({ value, el } : { value: string, el: cheerio.Cheerio}): SeoFieldRuleResult,
    errorMessage: string,
}

export interface SeoFieldRuleResult {
    valid: boolean,
    skipRules?: string[] | undefined,
}

export interface SEOField {
    name: string,
    label: string,
    getValue({ el, $ }: { el: Cheerio, $: CheerioRoot}): string,
    getElement($: CheerioRoot) : Cheerio | undefined,
    rules: SeoFieldRule[],
}