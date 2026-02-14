export type CycleWindow = {
  cycleKey: string; // UTC Monday YYYY-MM-DD
  start: Date; // inclusive
  end: Date; // exclusive
};

const pad2 = (n: number) => String(n).padStart(2, '0');

export const formatUtcDateKey = (d: Date): string => {
  const y = d.getUTCFullYear();
  const m = pad2(d.getUTCMonth() + 1);
  const day = pad2(d.getUTCDate());
  return `${y}-${m}-${day}`;
};

export const startOfUtcDay = (d: Date): Date =>
  new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));

export const getWeeklyCycleWindowUtc = (at: Date): CycleWindow => {
  const dayStart = startOfUtcDay(at);
  // JS: Sunday=0..Saturday=6; we want Monday start.
  const dow = dayStart.getUTCDay();
  const daysSinceMonday = (dow + 6) % 7; // Monday->0, Sunday->6

  const start = new Date(dayStart.getTime() - daysSinceMonday * 24 * 60 * 60 * 1000);
  const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
  const cycleKey = formatUtcDateKey(start);

  return { cycleKey, start, end };
};

