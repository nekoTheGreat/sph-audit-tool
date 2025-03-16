import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import {ParserResult} from "./types.js";
import {crawl} from "./basic-crawl.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (_: Request, res: Response) => {
    res.send('Good day...');
});

app.get('/crawl', async (req: Request, res: Response) => {
    let resp: { error: string } | ParserResult[];
    let statusCode = 200;
    const url = req.query.url?.toString() ?? '';
    try {
        if(!url) throw "URL required";
        resp = await crawl(url);
    } catch(e: any) {
        statusCode = 400;
        resp = { error: e.toString() };
    }

    res.statusCode = statusCode;
    res.send(resp);
})

app.listen(port, () => {
    console.log(`Server is running...`);
});