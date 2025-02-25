export function isEmpty(value: string) : boolean {
    return !value || value.length < 1;
}

export function isNotEmpty(value: string) : boolean {
    return !isEmpty(value);
}

export function isStrLenGreater(value: string, limit: number) : boolean {
    if(!value) return false;
    return value.length > limit;
}

export function isStrLenGreaterOrEqual(value: string, limit: number) : boolean {
    if(!value) return false;
    return value.length >= limit;
}

export function isStrLenLess(value: string, limit: number) : boolean {
    if(!value) return false;
    return value.length < limit;
}

export function isStrLenLessOrEqual(value: string, limit: number) : boolean {
    if(!value) return false;
    return value.length <= limit;
}

export function isStrDuplicate(value: string, uniqueItems: Set<string>) : boolean {
    return uniqueItems.has(value);
}

export function isStrUnique(value: string, uniqueItems: Set<string>) : boolean {
    return !uniqueItems.has(value);
}