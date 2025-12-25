import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import { validateRun } from './runs.validation';
import { mockRunsStore } from './runs.store';

const MOCK_DB = process.env.MOCK_DB === 'true'; 

export const createRun = async (req: Request, res: Response) => {
  console.log('Received Create Run Request');
  
  // Separate validation from persistence
  const validationError = validateRun(req.body);
  if (validationError) {
    console.log('Validation Error:', validationError);
    return res.status(400).json({
      status: 'error',
      message: validationError
    });
  }

  const { 
    id, 
    start_time, 
    end_time, 
    duration, 
    distance, 
    activity_type, 
    polyline, 
    raw_data, 
    metadata 
  } = req.body;

  try {
    const userId = (req as any).user?.id || 'test-user-id';
    const start = new Date(start_time);
    const end = new Date(end_time);
    let run;
    let existingRun;
    let overlappingRun;
    let status = 'synced';

    if (MOCK_DB) {
      console.log('Using MOCK DB Logic');
      existingRun = mockRunsStore.find(r => r.id === id);
      
      if (existingRun) {
         console.log('Run exists:', id);
         // Mock Idempotency
         if (existingRun.userId !== userId) {
            return res.status(403).json({ status: 'error', message: 'Forbidden' });
         }
         return res.status(200).json({
            status: 'success',
            message: 'Run already processed',
            data: { id: existingRun.id, run_status: existingRun.status, received_at: existingRun.createdAt }
         });
      }

      // Mock Overlap
      overlappingRun = mockRunsStore.find(r => 
        r.userId === userId && 
        new Date(r.startTime) < end && 
        new Date(r.endTime) > start
      );
      if (overlappingRun) console.log('Overlap detected');
      
      status = overlappingRun ? 'overlapping' : 'synced';

      run = {
        id, userId, startTime: start, endTime: end, duration, distance,
        activityType: activity_type, polyline, status, metadata, 
        createdAt: new Date(), updatedAt: new Date()
      };
      mockRunsStore.push(run);
      console.log('Run stored in memory:', id);

    } else {
      // Real DB Logic
      existingRun = await prisma.run.findUnique({ where: { id } });

      if (existingRun) {
        if (existingRun.userId !== userId) {
          return res.status(403).json({
            status: 'error',
            message: 'Run ID already exists for another user'
          });
        }
        return res.status(200).json({
          status: 'success',
          message: 'Run already processed',
          data: {
            id: existingRun.id,
            run_status: existingRun.status,
            received_at: existingRun.createdAt
          }
        });
      }

      // Overlap detection
      overlappingRun = await prisma.run.findFirst({
        where: {
          userId,
          AND: [
            { startTime: { lt: end } },
            { endTime: { gt: start } }
          ]
        }
      });
      status = overlappingRun ? 'overlapping' : 'synced';
      
      run = await prisma.run.create({
        data: {
          id, userId, startTime: start, endTime: end, duration, distance,
          activityType: activity_type, polyline, status, metadata,
          rawData: { create: { rawData: raw_data } }
        }
      });
    }

    res.status(201).json({
      status: 'success',
      data: {
        id: run.id,
        run_status: run.status,
        received_at: run.createdAt
      }
    });

  } catch (error: any) {
    console.error('Error creating run:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      details: error.message
    });
  }
};