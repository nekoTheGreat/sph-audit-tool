import {CheerioRoot} from "crawlee"
import Cheerio = cheerio.Cheerio;

export interface SeoFieldRule {
    validate({ value, el } : { value: string, el: cheerio.Cheerio}): boolean,
    errorMessage: string,
}
export interface SEOField {
    name: string,
    label: string,
    getValue(el: Cheerio): string,
    getElement($: CheerioRoot) : Cheerio | undefined,
    rules: SeoFieldRule[],
}