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

/**
 * List of errors a field has
 */
const fieldAudits = new Map<string, FieldAudit>();

export const setFieldAudit = ({ name, value, error, group, elementTag} : SetFieldAuditParam) => {
    if(!fieldAudits.has(name)) {
        fieldAudits.set(name, {name, value, group, elementTag, errors: []});
    }
    fieldAudits.get(name)?.errors.push(error);
}

export const getFieldAudit = (name: string) : FieldAudit | null => {
    return fieldAudits.get(name) ?? null;
}

export const clearFieldAudits = () => {
    fieldAudits.clear();
}

export const getFieldAudits = () => {
    const clone = new Map();
    for(const [k, v] of fieldAudits) {
        clone.set(k, v);
    }
    return clone;
}

export const getFieldAuditsAsObject = () => {
    const obj = {} as {[key: string] : FieldAudit};
    for(const [k, v] of fieldAudits) {
        obj[k] = v;
    }
    return obj;
}