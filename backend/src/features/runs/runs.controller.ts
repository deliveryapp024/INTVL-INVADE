import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import { validateRun } from './runs.validation';

export const createRun = async (req: Request, res: Response) => {
  // Separate validation from persistence
  const validationError = validateRun(req.body);
  if (validationError) {
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

    // Idempotency check
    const existingRun = await prisma.run.findUnique({
      where: { id }
    });

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
    
    const run = await prisma.run.create({
      data: {
        id,
        userId,
        startTime: new Date(start_time),
        endTime: new Date(end_time),
        duration,
        distance,
        activityType: activity_type,
        polyline,
        metadata,
        rawData: {
          create: {
            rawData: raw_data
          }
        }
      }
    });

    res.status(201).json({
      status: 'success',
      data: {
        id: run.id,
        run_status: run.status,
        received_at: run.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating run:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};
