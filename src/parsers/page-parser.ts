import {CheerioRoot} from "crawlee";

export interface ParserResult {
    url: string,
    audits: {[key: string]: FieldAudit}
}

export interface FieldAudit {
    name: string,
    value: string,
    group: string,
    elementTag: string | null | undefined,
    errors: string[],
}

export interface SetFieldAuditParam extends Omit<FieldAudit, "errors"> {
    error: string
}

export class PageParser {
    protected url;
    protected audits;

    constructor(url: string) {
        if(!url.startsWith("http")) {
            url = "https://" + url;
        }
        this.url = url;
        this.audits = new Map<string, FieldAudit>();
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

    getFieldAuditsAsObject() : {[key: string] : FieldAudit}{
        const obj = {} as {[key: string] : FieldAudit};
        for(const [k, v] of this.audits) {
            obj[k] = v;
        }
        return obj;
    }
}