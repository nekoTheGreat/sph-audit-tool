import {createPlaywrightRouter, Dataset, PlaywrightCrawler } from 'crawlee';
import {OnPageParser} from "./parsers/on-page-parser.js";
import {ParserResult} from "./types.js";
import {randomUUID} from "node:crypto";

export async function crawl(url: string) : Promise<ParserResult[]> {
    const result = [] as ParserResult[];

    if(!url.startsWith("http")) {
        url = "https://" + url;
    }
    const parsedUrl = new URL(url);
    // const dataSetId = `${parsedUrl.hostname}-${(new Date()).getTime()}`;
    // const dataset = await Dataset.open(dataSetId);

    const router = createPlaywrightRouter();

    router.addDefaultHandler(async ({ request, log, enqueueLinks, parseWithCheerio }) => {
        log.info(`Processing URL: ${request.url}`);
        const $ = await parseWithCheerio();

        const onPageParser = new OnPageParser(request.url, $);
        const parseResult = await onPageParser.parse({ $ });
        // await dataset.pushData(parseResult);
        result.push(parseResult);

        log.info(`enqueueing new URLs`);
        const hostname = parsedUrl.hostname.replace("www.", "");
        await enqueueLinks({
            globs: [
                `http*//*${hostname}/**`,
            ],
            transformRequestFunction: (request) => {
                request.uniqueKey = `${request.url}:${randomUUID()}`;
                return request;
            },
            label: 'on-page',
        });

        log.info(`Processed URL: ${request.url}`);
    });

    router.addHandler('on-page', async ({ request, log, parseWithCheerio }) => {
        log.info(`Processing URL: ${request.url}`);

        const $ = await parseWithCheerio();

        const onPageParser = new OnPageParser(request.url, $);
        const parseResult = await onPageParser.parse({ $ });
        result.push(parseResult);

        log.info(`Processed URL: ${request.url}`);
    });

    const brokenLinks = new Set<string>();

    const crawler = new PlaywrightCrawler({
        launchContext: {
            launchOptions: {
                headless: true,
                args: [
                    '--ignore-https-errors',
                    '--ignore-certificate-errors',
                    '--disable-blink-features=AutomationControlled',
                    '--no-sandbox',
                    '--disable-web-security',
                ]
            }
        },
        maxConcurrency: 4,
        maxRequestsPerMinute: 250,
        // proxyConfiguration: new ProxyConfiguration({ proxyUrls: ['...'] }),
        requestHandler: router,
        failedRequestHandler: async ({ log, request }) => {
            log.info(`Failed URL: ${request.url}`);
            brokenLinks.add(request.url);
        },
        // Comment this option to scrape the full website.
        maxRequestsPerCrawl: 20,
    });

    await crawler.run([{ url: url, uniqueKey: `${url}:${randomUUID()}` }]);

    if(brokenLinks.size > 0) {
        for(const value of brokenLinks.values()) {
            result.push({
                url: value,
                audits: [
                    { name: 'broken-link', errors: [] },
                ]
            })
        }
    }

    return result;
}