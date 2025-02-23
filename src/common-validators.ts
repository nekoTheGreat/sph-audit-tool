export function isEmpty(value: string) : boolean {
    return !value || value.length < 1;
}

export function isStrLenGreater(value: string, limit: number) : boolean {
    if(!value) return false;
    return value.length > limit;
}

export function isStrDuplicate(value: string, uniqueItems: Set<string>) : boolean {
    return uniqueItems.has(value);
}