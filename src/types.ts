import {CheerioRoot} from "crawlee"

export interface ParserResult {
    url: string,
    audits: FieldAudit[],
}

export interface AuditError {
    key: string,
    message?: string | undefined,
}

export interface FieldAudit {
    name: string,
    errors: AuditError[],
}

export interface SeoFieldRuleResult {
    name: string,
    valid: boolean,
    errors?: AuditError[] | undefined,
}

export interface SeoFieldRuleValidateParam {
    $: CheerioRoot,
    url: string,
}

export interface SEOField {
    name: string,
    label: string,
    validate({ $, url } : SeoFieldRuleValidateParam ): Promise<SeoFieldRuleResult>,
}