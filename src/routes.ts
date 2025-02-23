import {createPlaywrightRouter, Dataset} from 'crawlee';
import { fieldRules } from './rules.js';

export const router = createPlaywrightRouter();
const hostnames = new Set();
const protocols = new Set();
let dataSetId = "";

const errors = new Map<string, any>();
const addError = (field: string, message: string, elementTag: string | null = null) => {
    if(!errors.has(field)) {
        errors.set(field, []);
    }
    const fieldErrors = errors.get(field);
    fieldErrors!.push({message: message, elementTag: elementTag});
}

// @ts-ignore
const onPageSEO = async ({ request, page, log, parseWithCheerio }) => {
    errors.clear();

    const $ = await parseWithCheerio();

    forLoop:
        for (const fieldRule of fieldRules) {
            let value = "";
            let elementTag = "";
            switch (fieldRule.name) {
                case 'title':
                    const title = await page.title();
                    log.info(`${fieldRule.name}`, { url: request.loadedUrl });
                    break;
                case 'meta_description':
                    const el = $('meta[name="description"]');
                    value = el.prop('content');
                    elementTag = el.toString();
                    log.info(`${fieldRule.name}`, { description: value });
                    break;
                default:
                    break forLoop;
            }
            for (const rule of fieldRule.rules) {
                if(rule.func(value)) {
                    addError(fieldRule.name, `${fieldRule.label} ${rule.message}`, elementTag);
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
            elements.each((index:number, el: HTMLElement) => {
                const value = $(el).prop('alt')
                const elementTag = $(el).toString();
                for (const rule of fieldRule.rules) {
                    if(rule.func(value)) {
                        addError(`${fieldRule.name}_${index}`, `${fieldRule.label} ${rule.message}`, elementTag);
                    }
                }
            })
        }
    }

    const dataset = await Dataset.open(dataSetId);
    const _errors = {} as {[key: string]: string[]}
    for(const [k, v] of errors) {
        _errors[k] = v;
    }
    await dataset.pushData({ url: request.loadedUrl, errors: _errors});
}

router.addDefaultHandler(async ({ request, page, log, enqueueLinks, parseWithCheerio }) => {
    const parsedUrl = new URL(request.loadedUrl);
    hostnames.add(parsedUrl.hostname);
    log.info(`Hostname: ${parsedUrl.hostname}`);
    protocols.add(parsedUrl.protocol);
    log.info(`Protocol: ${parsedUrl.protocol}`);
    dataSetId = `${(new Date()).getTime()} - ${parsedUrl.hostname}`;
    log.info(`Dataset id: ${dataSetId}`);

    const dataset = await Dataset.open(dataSetId);
    await dataset.pushData({
        protocol: parsedUrl.protocol,
        hostname: parsedUrl.hostname,
        dataset: dataSetId,
    });

    await onPageSEO({ request, page, log, parseWithCheerio })

    log.info(`enqueueing new URLs`);
    await enqueueLinks({
        globs: [`${parsedUrl.protocol}//${parsedUrl.hostname}/**`],
        label: 'on-page',
    });
});

router.addHandler('on-page', onPageSEO);
