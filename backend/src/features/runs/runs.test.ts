import request from 'supertest';
import app from '../../app';
import prisma from '../../lib/prisma';

// Mock Prisma
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
        run: {
          create: jest.fn(),
          findUnique: jest.fn()
        }
      }
    }));
    
    describe('POST /api/runs', () => {
      const runData = {
        id: 'test-uuid-1',
        start_time: '2025-12-25T10:00:00Z',
        end_time: '2025-12-25T10:30:00Z',
        duration: 1800,
        distance: 5000,
        activity_type: 'RUN',
        polyline: 'test-polyline',
        raw_data: [{ lat: 1, lng: 1, time: '2025-12-25T10:00:01Z' }],
        metadata: { device: 'test' }
      };
    
      beforeEach(() => {
        jest.clearAllMocks();
      });
    
      it('should create a new run', async () => {
        (prisma.run.findUnique as jest.Mock).mockResolvedValue(null);
        (prisma.run.create as jest.Mock).mockResolvedValue({
          id: runData.id,
          status: 'synced',
          createdAt: new Date()
        });
    
        const response = await request(app)
          .post('/api/runs')
          .set('Authorization', 'Bearer test-token')
          .send(runData);
    
        expect(response.status).toBe(201);
        expect(response.body.status).toBe('success');
      });
    
      it('should return 200 OK for duplicate UUID', async () => {
        (prisma.run.findUnique as jest.Mock).mockResolvedValue({
          id: runData.id,
          userId: 'test-user-id',
          status: 'synced',
          createdAt: new Date('2025-12-25T10:35:00Z')
        });
    
        const response = await request(app)
          .post('/api/runs')
          .set('Authorization', 'Bearer test-token')
          .send(runData);
    
        expect(response.status).toBe(200);
            expect(response.body.message).toBe('Run already processed');
            expect(response.body.data.id).toBe(runData.id);
          });
        
          it('should return 400 for invalid distance', async () => {
            (prisma.run.findUnique as jest.Mock).mockResolvedValue(null);
            const invalidData = { ...runData, distance: -1 };
            
            const response = await request(app)
              .post('/api/runs')
              .set('Authorization', 'Bearer test-token')
              .send(invalidData);
        
            expect(response.status).toBe(400);
            expect(response.body.message).toContain('distance');
          });
        });
        