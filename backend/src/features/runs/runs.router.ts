import { Router } from 'express';
import * as runsController from './runs.controller';

const router = Router();

// In a real app, we'd add auth middleware here
router.post('/', runsController.createRun);
router.post('/:id/finalize', runsController.finalizeRun);

export default router;
