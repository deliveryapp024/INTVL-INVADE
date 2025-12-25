import request from 'supertest';
import app from '../../app';
import prisma from '../../lib/prisma';
import { calculateMetrics } from './runs.finalization';

// Mock Prisma
jest.mock('../../lib/prisma', () => ({
    __esModule: true,
    default: {
        run: {
            create: jest.fn(),
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            update: jest.fn(),
        },
        runRawData: {
            create: jest.fn()
        }
    }
}));

describe('E2E: Run Upload -> Finalization Flow', () => {
    const userId = 'test-user-id';
    const runId = 'e2e-run-id';

    // Client sent metrics (potentially fake/inaccurate)
    const clientMetrics = {
        distance: 5000,
        duration: 1000,
        start_time: '2025-01-01T10:00:00Z',
        end_time: '2025-01-01T10:20:00Z',
        activity_type: 'RUN',
        raw_data: [
            { lat: 0, lng: 0, time: '2025-01-01T10:00:00Z' },
            { lat: 0, lng: 0.01, time: '2025-01-01T10:10:00Z' }, // ~1.1km
            { lat: 0, lng: 0.02, time: '2025-01-01T10:20:00Z' }  // ~1.1km further
        ],
        polyline: 'dummy-polyline',
        metadata: { device: 'test-device' }
    };

    // Expected Server Calculated Metrics based on raw_data
    // 0 -> 0.01 lng at equator is approx 1113.2m
    // Total approx 2226m
    const expectedDistApprox = 2226;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should upload a run and then successfully finalize it with server-calculated metrics', async () => {
        // --- Step 1: Upload Run ---
        (prisma.run.findUnique as jest.Mock).mockResolvedValue(null); // No existing run
        (prisma.run.findFirst as jest.Mock).mockResolvedValue(null);  // No overlap
        (prisma.run.create as jest.Mock).mockResolvedValue({
            id: runId,
            userId,
            status: 'PENDING',
            rawData: { rawData: clientMetrics.raw_data },
            createdAt: new Date().toISOString()
        });

        const uploadRes = await request(app)
            .post('/api/runs')
            .send({ id: runId, ...clientMetrics })
            .set('Authorization', 'Bearer token');

        if (uploadRes.status !== 201) {
            console.error('Upload Failed:', JSON.stringify(uploadRes.body, null, 2));
        }
        expect(uploadRes.status).toBe(201);
        expect(uploadRes.body.data.run_status).toBe('PENDING');

        // --- Step 2: Finalize Run ---
        // Setup mock for finalize read
        (prisma.run.findUnique as jest.Mock).mockResolvedValue({
            id: runId,
            userId,
            status: 'PENDING',
            rawData: { rawData: clientMetrics.raw_data }
        });

        // Setup mock for finalize update
        (prisma.run.update as jest.Mock).mockImplementation((args: any) => {
            console.log('Mock Update Called with:', JSON.stringify(args, null, 2));
            return {
                id: runId,
                userId,
                status: args.data.status,
                computedMetrics: args.data.computedMetrics,
                rejectReason: args.data.rejectReason
            };
        });

        console.log('Sending Finalize Request...');
        const finalizeRes = await request(app)
            .post(`/api/runs/${runId}/finalize`)
            .set('Authorization', 'Bearer token');

        console.log('Finalize Response Status:', finalizeRes.status);
        console.log('Finalize Response Body:', JSON.stringify(finalizeRes.body, null, 2));

        if (finalizeRes.status !== 200) {
            console.error('Finalize Failed:', JSON.stringify(finalizeRes.body, null, 2));
        }
        expect(finalizeRes.status).toBe(200);
        expect(finalizeRes.body.data.status).toBe('FINALIZED');

        // --- Step 3: Verify Integrity ---
        const computed = finalizeRes.body.data.computedMetrics;

        // Check Distance: Should be close to expected (~2226m), NOT the client claim (5000m)
        expect(computed.distance_m).toBeGreaterThan(2000);
        expect(computed.distance_m).toBeLessThan(2500);
        expect(computed.distance_m).not.toBe(clientMetrics.distance);

        // Check Duration
        // 10:00 to 10:20 is 20 mins = 1200 seconds
        expect(computed.duration_s).toBe(1200);
    });
});
