import {isEmpty, isStrDuplicate, isStrLenGreater} from "./common-validators.js";

export interface Rule {
    func(value: string): boolean,
    message: string,
}
export interface FieldRule {
    name: string,
    label: string,
    rules: Rule[],
}

export const uniqueTitles = new Set<string>();
export const uniqueMetaDescriptions = new Set<string>();

export const fieldRules = [
    {
        name: 'title',
        label: 'Title',
        rules: [
            {
                func: isEmpty,
                message: 'is required'
            },
            {
                func(value: string) : boolean {
                    return isStrLenGreater(value, 60);
                },
                message: 'character limit is 60'
            },
            {
                func(value: string) : boolean {
                    const res = isStrDuplicate(value, uniqueTitles);
                    if(!res) uniqueTitles.add(value);
                    return res;
                },
                message: 'is a duplicate'
            }
        ]
    },
    {
        name: 'meta_description',
        label: 'Meta Description',
        rules: [
            {
                func: isEmpty,
                message: 'is required'
            },
            {
                func(value: string) : boolean {
                    return isStrLenGreater(value, 150);
                },
                message: 'character limit is 150'
            },
            {
                func(value: string) : boolean {
                    const res = isStrDuplicate(value, uniqueMetaDescriptions);
                    if(!res) uniqueMetaDescriptions.add(value);
                    return res;
                },
                message: 'is a duplicate'
            }
        ],
    },
    {
        name: 'image_alt',
        label: 'Image Alt',
        rules: [
            {
                func: isEmpty,
                message: 'is required'
            },
            {
                func(value: string) : boolean {
                    return isStrLenGreater(value, 100);
                },
                message: 'character limit is 100'
            },
        ],
    }
] as FieldRule[];

export function getRule(field: string): FieldRule | null
{
    for(const fieldRule of fieldRules) {
        if(fieldRule.name == field) return fieldRule;
    }
    return null;
}