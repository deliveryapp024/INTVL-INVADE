export interface RunSubmission {
  id: string;
  start_time: string;
  end_time: string;
  duration: number;
  distance: number;
  activity_type: string;
  polyline: string;
  raw_data: any[];
  metadata?: any;
}

export const validateRun = (data: RunSubmission): string | null => {
  if (!data.id) return 'ID is required';
  if (!data.start_time || isNaN(Date.parse(data.start_time))) return 'Valid start_time is required';
  if (!data.end_time || isNaN(Date.parse(data.end_time))) return 'Valid end_time is required';
  
  const start = new Date(data.start_time);
  const end = new Date(data.end_time);
  
  if (end <= start) return 'end_time must be after start_time';
  
  if (typeof data.duration !== 'number' || data.duration < 0) return 'duration must be a non-negative number';
  if (typeof data.distance !== 'number' || data.distance < 0) return 'distance must be a non-negative number';
  
  if (!data.polyline) return 'polyline is required';
  if (!Array.isArray(data.raw_data) || data.raw_data.length === 0) return 'raw_data must be a non-empty array';

  return null;
};
