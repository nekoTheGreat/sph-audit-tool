import {createPlaywrightRouter, Dataset} from 'crawlee';
import { fieldRules } from './rules.js';
import { getFieldAuditsAsObject, setFieldAudit, clearFieldAudits } from "./audit.js";

export const router = createPlaywrightRouter();
const hostnames = new Set();
const protocols = new Set();
let dataSetId = "";

// @ts-ignore
const onPageSEO = async ({ request, page, log, parseWithCheerio }) => {
    clearFieldAudits();

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
                    setFieldAudit({
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
            elements.each((index:number, el: HTMLElement) => {
                const value = $(el).prop('alt')
                const elementTag = $(el).toString();
                for (const rule of fieldRule.rules) {
                    if(rule.func(value)) {
                        setFieldAudit({
                            name: `${fieldRule.name}_${index}`,
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

    const dataset = await Dataset.open(dataSetId);
    await dataset.pushData({ url: request.loadedUrl, audits: getFieldAuditsAsObject() });
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
