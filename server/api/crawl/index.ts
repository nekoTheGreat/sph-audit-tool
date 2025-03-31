import type {ParserResult} from "~/audit-tool/types";
import {crawl} from "~/audit-tool/basic-crawl";

export default defineEventHandler(async (event) => {
    const data = await readBody(event) as { url: string };
    let resp: { error: string } | ParserResult[];
    try {
        resp = await crawl(data.url);
    } catch(e: any) {
        resp = { error: e.toString() };
    }
    return resp;
})