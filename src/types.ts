import {CheerioRoot} from "crawlee"
import Cheerio = cheerio.Cheerio;

export interface SeoFieldRule {
    func(value: string | string[]): boolean,
    message: string,
}
export interface SEOField {
    name: string,
    label: string,
    getValue($: CheerioRoot): string | string[],
    getElement($: CheerioRoot) : Cheerio | undefined,
    getElements($: CheerioRoot) : Cheerio[] | [],
    rules: SeoFieldRule[],
}