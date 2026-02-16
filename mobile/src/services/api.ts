// API Configuration
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://intvl-invade-backend.onrender.com/api/v1';

// Helper to handle network errors gracefully
export async function fetchWithFallback<T>(
  url: string, 
  options?: RequestInit,
  fallbackData?: T
): Promise<{ data: T | null; error: string | null }> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.warn('API call failed:', error);
    if (fallbackData) {
      return { data: fallbackData, error: null };
    }
    return { data: null, error: (error as Error).message };
  }
}

// Check if backend is available
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, { 
      method: 'GET',
      // Short timeout for health check
      signal: AbortSignal.timeout(3000),
    });
    return response.ok;
  } catch {
    return false;
  }
}
