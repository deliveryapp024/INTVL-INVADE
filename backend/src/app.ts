import express from 'express';
import cors from 'cors';

import runsRouter from './features/runs/runs.router';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use('/api/runs', runsRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

export default app;
