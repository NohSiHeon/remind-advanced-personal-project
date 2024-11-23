import express from 'express';
import 'dotenv/config';
import { SERVER_PORT } from './src/constants/env.constant.js';
import { router } from './src/routers/index.js';
import { errorHandler } from './src/middlewares/error-handler.middleware.js';

const app = express();

// json, url 파싱
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health-check', (req, res) => {
	res.status(200).send("Hello");
});

app.use('/api', router);
app.use(errorHandler);
app.listen(SERVER_PORT, () => {
	console.log(`${SERVER_PORT} 포트에서 서버가 열렸습니다.`);
});