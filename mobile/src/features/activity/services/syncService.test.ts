import { syncPendingActivities } from './syncService';
import { getActivities, updateActivitySyncStatus, ActivityData } from './activityStorage';

jest.mock('./activityStorage');
jest.mock('expo-background-fetch', () => ({
  registerTaskAsync: jest.fn(),
  BackgroundFetchResult: { NewData: 1, Failed: 2 },
}));
jest.mock('expo-task-manager', () => ({
  defineTask: jest.fn(),
}));

describe('syncService', () => {
  const mockActivity: ActivityData = {
    id: '123',
    startTime: 1000000,
    endTime: 1000300,
    duration: 300,
    distance: 1000,
    pace: 5,
    activityType: 'RUN',
    polyline: 'abc',
    rawData: [],
    syncStatus: 'local_only',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('should sync pending activities successfully', async () => {
    (getActivities as jest.Mock).mockResolvedValue([mockActivity]);
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ status: 'success', data: { run_status: 'synced' } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ status: 'success', data: { status: 'FINALIZED' } }),
      });

    await syncPendingActivities();

    expect(global.fetch).toHaveBeenCalled();
    expect(updateActivitySyncStatus).toHaveBeenCalledWith('123', 'finalized');
  });

  it('should handle sync failure', async () => {
    (getActivities as jest.Mock).mockResolvedValue([mockActivity]);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
    });

    await syncPendingActivities();

    expect(updateActivitySyncStatus).toHaveBeenCalledWith('123', 'failed');
  });

  it('should handle rejection', async () => {
    (getActivities as jest.Mock).mockResolvedValue([mockActivity]);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 400,
    });

    await syncPendingActivities();

    expect(updateActivitySyncStatus).toHaveBeenCalledWith('123', 'rejected');
  });
});
