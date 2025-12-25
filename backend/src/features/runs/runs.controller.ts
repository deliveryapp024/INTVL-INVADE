import { Request, Response } from 'express';
import prisma from '../../lib/prisma';

export const createRun = async (req: Request, res: Response) => {
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
    // Basic implementation for Task 2
    // Assumes user is authenticated and userId is available (e.g. from middleware)
    // For now, using a hardcoded user_id for testing or getting it from req.user
    const userId = (req as any).user?.id || 'test-user-id';

    // We need to ensure the user exists for the foreign key constraint if we were using a real DB
    // But since we are implementing the logic:
    
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
