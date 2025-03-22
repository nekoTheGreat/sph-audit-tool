import {PageParser} from "./page-parser.js";
import {isNotEmpty, isStrLenLessOrEqual, isStrUnique} from "../common-validators.js";
import {AuditError, SeoFieldRuleResult, SeoFieldRuleValidateParam } from "../types.js";

export class OnPageParser extends PageParser
{
    uniqueMetaDescriptions = new Set<string>();
    uniqueTitles = new Set<string>();

    override setup() {
        this.group = 'on-page';
        const self = this;
        this.seoFields = [
            {
                name: 'page_url',
                label: 'Page URL',
                async validate({ url, keywords }: SeoFieldRuleValidateParam): Promise<SeoFieldRuleResult> {
                    const errors = [] as AuditError[];

                    const decodedUrl = decodeURI(url);
                    if(/\s/.exec(decodedUrl) != null) {
                        errors.push({key: 'unoptimized'})
                    }
                    const parsedUrl = new URL(url);
                    let path = parsedUrl.pathname;
                    if(path.charAt(0) == "/") {
                        path = path.slice(1);
                    }
                    if(path.length > 0) {
                        const tokens = path.split('-');
                        let found = false;
                        for(const token in tokens) {
                            const index = keywords.findIndex(it => it.word == token);
                            if(index > -1) {
                                found = true;
                                break;
                            }
                        }
                        if(!found) {
                            errors.push({key: 'keyword_not_found'});
                        }
                    }
                    return {
                        name: this.name,
                        valid: errors.length == 0,
                        errors,
                    }
                },
            },
            {
                name: 'title',
                label: 'Title',
                async validate({ $ }: SeoFieldRuleValidateParam): Promise<SeoFieldRuleResult> {
                    const value = $('title').text();
                    const errors = [] as AuditError[];
                    if(!isNotEmpty(value)) {
                        errors.push({key: 'required'});
                    } else {
                        if(!isStrLenLessOrEqual(value, 60)) {
                            errors.push({key: 'character_limit', message: 'character limit is 60'})
                        }
                        const res = isStrUnique(value, self.uniqueTitles);
                        if(!res) {
                            self.uniqueTitles.add(value);
                        }
                        else {
                            errors.push({key: 'duplicate'});
                        }
                    }
                    return {
                        name: this.name,
                        valid: errors.length == 0,
                        errors,
                    }
                },
            },
            {
                name: 'meta_description',
                label: 'Meta Description',
                async validate({ $ }: SeoFieldRuleValidateParam): Promise<SeoFieldRuleResult> {
                    const value = $('meta[name="description"]').prop('content');
                    const errors = [] as AuditError[];
                    if(!isNotEmpty(value)) {
                        errors.push({key: 'required'});
                    } else {
                        if(!isStrLenLessOrEqual(value, 150)) {
                            errors.push({key: 'character_limit', message: 'character limit is 150'})
                        }
                        const res = isStrUnique(value, self.uniqueMetaDescriptions);
                        if(!res) self.uniqueMetaDescriptions.add(value);
                        else {
                            errors.push({key: 'duplicate'});
                        }
                    }
                    return {
                        name: this.name,
                        valid: errors.length == 0,
                        errors,
                    }
                },
            },
            {
                name: 'image_alt',
                label: 'Image',
                async validate({ $ }: SeoFieldRuleValidateParam): Promise<SeoFieldRuleResult> {
                    const errors = [] as AuditError[];
                    $('img').each((_, el) => {
                        const value = $(el).prop('alt');
                        if(!isNotEmpty(value)) {
                            errors.push({key: 'required'});
                        } else {
                            if(!isStrLenLessOrEqual(value, 100)) {
                                errors.push({key: 'character_limit', message: 'character limit is 100'})
                            }
                        }
                    });
                    return {
                        name: this.name,
                        valid: errors.length == 0,
                        errors,
                    }
                },
            },
            {
                name: 'image_link',
                label: 'Image Links',
                async validate({ $ }: SeoFieldRuleValidateParam): Promise<SeoFieldRuleResult> {
                    const errors = [] as AuditError[];
                    const checksPromises = [] as Promise<{url: string, valid: boolean}>[];
                    $('img').each((_, el) => {
                        checksPromises.push(new Promise((resolve) => {
                            (async () => {
                                const src = $(el).prop('src')?.toString() ?? '';
                                let valid = true;
                                try {
                                    const resp = await fetch(src);
                                    if(resp.status >= 400) throw "Broken";
                                } catch (e) {
                                    valid = false;
                                }
                                resolve({ url: src, valid });
                            })();
                        }))
                    });
                    const results = await Promise.all(checksPromises);
                    for(const result of results) {
                        if(!result.valid) {
                            errors.push({key: 'broken_link', message: result.url});
                        }
                    }
                    return {
                        name: this.name,
                        valid: errors.length == 0,
                        errors,
                    }
                },
            },
            {
                name: 'h1',
                label: 'H1',
                async validate({ $ }: SeoFieldRuleValidateParam): Promise<SeoFieldRuleResult> {
                    const errors = [] as AuditError[];
                    const el = $('h1');
                    const value = el.text();
                    if(!isNotEmpty(value)) {
                        errors.push({key: 'required'});
                    } else {
                        if(!isStrLenLessOrEqual(value, 100)) {
                            errors.push({key: 'character_limit', message: 'character limit is 100'})
                        }
                        if(el.filter( (_, subEl) => $(subEl).text().trim().length > 0 ).length > 0) {
                            errors.push({key: 'duplicate'});
                        }
                    }
                    return {
                        name: this.name,
                        valid: errors.length == 0,
                        errors,
                    }
                },
            },
        ];
    }
}