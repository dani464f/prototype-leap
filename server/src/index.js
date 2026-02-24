import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import apiRouter from './routes/api.js';
import { generateMockData } from './services/mockGenerator.js';

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api', apiRouter);

generateMockData({ employeesCount: 24, samplesPerDevice: 30 });

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
