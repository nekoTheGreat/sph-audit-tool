import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import type {ParserResult} from "./types.js";
import {crawl} from "./basic-crawl.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use((req: Request, res: Response, next) => {
    const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':')
    if(login == process.env.BASIC_AUTH_USER && password == process.env.BASIC_AUTH_PASS) {
        return next();
    }
    res.set('WWW-Authenticate', 'Basic realm="401"');
    res.status(401).send('Authentication required.');
});

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