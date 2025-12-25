import express from 'express';
import cors from 'cors';

import runsRouter from './features/runs/runs.router';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' })); // GPS data can be large

app.use('/api/runs', runsRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

export default app;
