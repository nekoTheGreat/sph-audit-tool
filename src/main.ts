import express, { Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (_: Request, res: Response) => {
    res.send('Good day...');
});

app.listen(port, () => {
    console.log(`Server is running...`);
});