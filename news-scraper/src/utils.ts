// src/utils.ts
import dayjs from 'dayjs';

export function iso(dateStr: string): string {
  // Fallback to current time if parse fails
  const d = dayjs(dateStr);
  return (d.isValid() ? d : dayjs()).toISOString();
}

export function withinHours(isoDate: string, maxHours: number): boolean {
  return dayjs().diff(dayjs(isoDate), 'hour') <= maxHours;
}
