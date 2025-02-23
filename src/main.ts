// For more information, see https://crawlee.dev/
import { PlaywrightCrawler, ProxyConfiguration } from 'crawlee';
import { router } from './routes.js';

async function crawlWebsite(url: string) {

    const crawler = new PlaywrightCrawler({
        // proxyConfiguration: new ProxyConfiguration({ proxyUrls: ['...'] }),
        requestHandler: router,
        // Comment this option to scrape the full website.
        maxRequestsPerCrawl: 20,
    });

    let parsedUrl = null;
    try {
        parsedUrl = new URL(url);
    } catch {
        url = `https://${url}`;
    }

    await crawler.run([url]);
}

await crawlWebsite('seoprimehub.com');