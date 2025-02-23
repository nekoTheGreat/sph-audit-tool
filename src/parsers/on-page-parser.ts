import {CheerioRoot} from "crawlee";
import {fieldRules} from "../rules.js";
import {PageParser, ParserResult} from "./page-parser.js";

export class OnPageParser extends PageParser
{
    async parse({ $ } : { $: CheerioRoot }) : Promise<ParserResult>  {
        forLoop:
            for (const fieldRule of fieldRules) {
                let value = "";
                let elementTag = "";
                switch (fieldRule.name) {
                    case 'title':
                        value = $('title').text();
                        break;
                    case 'meta_description':
                        const el = $('meta[name="description"]');
                        value = el.prop('content');
                        elementTag = el.toString();
                        break;
                    default:
                        break forLoop;
                }
                for (const rule of fieldRule.rules) {
                    if(rule.func(value)) {
                        this.setFieldAudit({
                            name: fieldRule.name,
                            value,
                            error: `${fieldRule.label} ${rule.message}`,
                            group: 'meta tags',
                            elementTag,
                        })
                    }
                }
            }
        for (const fieldRule of fieldRules) {
            let elements = null;
            switch (fieldRule.name) {
                case 'image_alt':
                    elements = $('img');
                    break;
            }
            if(elements && elements.length > 0) {
                elements.each((_, el) => {
                    const value = $(el).prop('alt')
                    const elementTag = $(el).toString();
                    for (const rule of fieldRule.rules) {
                        if(rule.func(value)) {
                            this.setFieldAudit({
                                name: `${fieldRule.name}`,
                                value,
                                error: `${fieldRule.label} ${rule.message}`,
                                group: 'meta tags',
                                elementTag,
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