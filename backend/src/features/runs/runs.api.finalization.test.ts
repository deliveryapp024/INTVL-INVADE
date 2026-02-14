import request from 'supertest';
import app from '../../app';
import prisma from '../../lib/prisma';
import { mockRunsStore } from './runs.store';

// Mock specific Prisma methods if relying on the global mock in tests setup
// Assuming global mock exists or we define it here if needed. 
// Given `runs.test.ts` mocks it locally, I should probably do the same or check jest setup.
// I will apply the same mocking strategy as `runs.test.ts`.

jest.mock('../../lib/prisma', () => ({
    __esModule: true,
    default: {
        $transaction: jest.fn(),
        run: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        runHex: {
            deleteMany: jest.fn(),
            createMany: jest.fn(),
        },
        runZoneContribution: {
            deleteMany: jest.fn(),
            createMany: jest.fn(),
            findMany: jest.fn().mockResolvedValue([]),
        },
        zoneOwnership: {
            deleteMany: jest.fn(),
            createMany: jest.fn(),
        },
        runLoop: {
            upsert: jest.fn(),
        },
        runRawData: {
            create: jest.fn()
        }
    }
}));

describe('POST /api/runs/:id/finalize', () => {
    const runId = 'test-run-finalize';
    const userId = 'test-user-id';

    // Valid raw data (~1000m, >2 mins)
    const validRawData = [
        { lat: 0, lng: 0, time: '2025-01-01T10:00:00Z' },
        { lat: 0.009, lng: 0, time: '2025-01-01T10:05:00Z' } // ~1km away, 5 mins later
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should successfully finalize a pending run', async () => {
        (prisma.run.findUnique as jest.Mock).mockResolvedValue({
            id: runId,
            userId: userId,
            status: 'PENDING',
            rawData: { rawData: validRawData }
        });

        const tx = {
            runHex: prisma.runHex,
            runZoneContribution: prisma.runZoneContribution,
            zoneOwnership: prisma.zoneOwnership,
            runLoop: prisma.runLoop,
            run: {
                update: jest.fn().mockResolvedValue({
                    id: runId,
                    status: 'FINALIZED',
                    computedMetrics: { distance_m: 1000, duration_s: 300 },
                    hexes: []
                })
            }
        };

        (prisma.$transaction as jest.Mock).mockImplementation(async (fn: any) => fn(tx));

        const response = await request(app)
            .post(`/api/runs/${runId}/finalize`)
            .set('Authorization', 'Bearer test-token');

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data.status).toBe('FINALIZED');
        expect(prisma.$transaction).toHaveBeenCalled();
        expect(prisma.runHex.deleteMany).toHaveBeenCalledWith({ where: { runId } });
        expect(tx.run.update).toHaveBeenCalledWith(expect.objectContaining({
            where: { id: runId },
            data: expect.objectContaining({ status: 'FINALIZED' })
        }));
    });

    it('should reject a run with invalid metrics (anti-cheat)', async () => {
        // Too fast! 1km in 1 second
        const cheatData = [
            { lat: 0, lng: 0, time: '2025-01-01T10:00:00Z' },
            { lat: 0.009, lng: 0, time: '2025-01-01T10:00:01Z' }
        ];

        (prisma.run.findUnique as jest.Mock).mockResolvedValue({
            id: runId,
            userId: userId,
            status: 'PENDING',
            rawData: { rawData: cheatData }
        });

        (prisma.run.update as jest.Mock).mockResolvedValue({
            id: runId,
            status: 'REJECTED',
            rejectReason: 'UNREALISTIC_SPEED'
        });

        const response = await request(app)
            .post(`/api/runs/${runId}/finalize`)
            .set('Authorization', 'Bearer test-token');

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success'); // Request succeeded, but run is rejected
        expect(response.body.data.status).toBe('REJECTED');
        expect(response.body.data.rejectReason).toBe('UNREALISTIC_SPEED');
    });

    it('should be idempotent (return existing finalized run)', async () => {
        (prisma.run.findUnique as jest.Mock).mockResolvedValue({
            id: runId,
            userId: userId,
            status: 'FINALIZED',
            computedMetrics: {}
        });

        const response = await request(app)
            .post(`/api/runs/${runId}/finalize`)
            .set('Authorization', 'Bearer test-token');

        expect(response.status).toBe(200);
        expect(prisma.run.update).not.toHaveBeenCalled();
    });
});
