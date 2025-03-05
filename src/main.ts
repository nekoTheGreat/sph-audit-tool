import {createPlaywrightRouter, Dataset, PlaywrightCrawler } from 'crawlee';
import {OnPageParser} from "./parsers/on-page-parser.js";

async function crawlWebsite(url: string) {
    if(!url.startsWith("http")) {
        url = "https://" + url;
    }
    const parsedUrl = new URL(url);
    const dataSetId = `${parsedUrl.hostname}-${(new Date()).getTime()}`;
    const dataset = await Dataset.open(dataSetId);

    const router = createPlaywrightRouter();

    router.addDefaultHandler(async ({ request, log, enqueueLinks, parseWithCheerio }) => {
        log.info(`Processing URL: ${request.url}`);
        const $ = await parseWithCheerio();

        const onPageParser = new OnPageParser(request.url, $);
        await dataset.pushData(await onPageParser.parse({ $ }));

        log.info(`enqueueing new URLs`);
        const hostname = parsedUrl.hostname.replace("www.", "");
        await enqueueLinks({
            globs: [
                `http*//*${hostname}/**`,
            ],
            label: 'on-page',
        });

        log.info(`Processed URL: ${request.url}`);
    });

    router.addHandler('on-page', async ({ request, log, parseWithCheerio }) => {
        log.info(`Processing URL: ${request.url}`);

        const $ = await parseWithCheerio();

        const onPageParser = new OnPageParser(request.url, $);
        await dataset.pushData(await onPageParser.parse({ $ }));

        log.info(`Processed URL: ${request.url}`);
    });


    const crawler = new PlaywrightCrawler({
        launchContext: {
            launchOptions: {
                args: [
                    '--ignore-https-errors',
                    '--ignore-certificate-errors',
                    '--disable-blink-features=AutomationControlled',
                    '--no-sandbox',
                    '--disable-web-security',
                ]
            }
        },
        // proxyConfiguration: new ProxyConfiguration({ proxyUrls: ['...'] }),
        requestHandler: router,
        failedRequestHandler: async ({ log, request }) => {
            log.info(`Failed URL: ${request.url}`);
            // setFieldAudit({
            //     name: 'url',
            //     value: request.url,
            //     error: '404',
            //     group: 'general',
            //     elementTag: null,
            // });
        },
        // Comment this option to scrape the full website.
        maxRequestsPerCrawl: 20,
    });

    await crawler.run([url]);
}

await crawlWebsite('bwd.local');