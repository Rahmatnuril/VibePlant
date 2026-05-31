import { getAccessToken } from './auth';

export interface CalendarEvent {
  id: string;
  summary: string;
  start: { date?: string; dateTime?: string };
  end: { date?: string; dateTime?: string };
  description?: string;
  htmlLink?: string;
}

export const fetchCalendarEvents = async (timeMin: Date, timeMax: Date): Promise<CalendarEvent[]> => {
  const token = await getAccessToken();
  if (!token) throw new Error('No access token available');

  const url = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');
  url.searchParams.append('timeMin', timeMin.toISOString());
  url.searchParams.append('timeMax', timeMax.toISOString());
  url.searchParams.append('singleEvents', 'true');
  url.searchParams.append('orderBy', 'startTime');

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('Unauthorized'); // Can trigger re-auth
    }
    throw new Error('Failed to fetch calendar events');
  }

  const data = await res.json();
  return data.items || [];
};
