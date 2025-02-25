import {CheerioRoot} from "crawlee";
import basicSeoFields from "../seo-fields/basic-seo-fields.js";
import {PageParser, ParserResult} from "./page-parser.js";

export class OnPageParser extends PageParser
{
    override setup() {
        this.seoFields = basicSeoFields;
        this.arrayValuedSeoFields = ['image_alt'];
        this.group = 'on-page';
    }
}