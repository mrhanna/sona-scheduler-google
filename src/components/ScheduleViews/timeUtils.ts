import type { Class, Mentor } from '../../types/config';

export function combineDateAndTime(date: Date, timeString: string): Date {
  const pad = (n: number) => String(n).padStart(2, '0');

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());

  // 1. Construct local time string, e.g. "2026-09-15T13:35:00"
  const isoLocal = `${year}-${month}-${day}T${timeString}:00`;

  // 2. Check if Central Time is in DST (-05:00) or Standard (-06:00) for this date
  const isDST = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    timeZoneName: 'short',
  })
    .format(date)
    .includes('CDT');

  const offset = isDST ? '-05:00' : '-06:00';

  // 3. Parse with explicit Central Time offset
  return new Date(`${isoLocal}${offset}`);
}

export function toGCalISOString(date: Date) {
  return date.toISOString().replace(/[-:]|\.\d{3}/g, '');
}

/**
 * Builds Google Calendar Event URL from YYYY-MM-DD and "HH:MM" strings
 */
export function buildCalendarUrl(
  mentor: Mentor,
  cls: Class,
  date: Date,
  calendarId: string,
) {
  var startIso = toGCalISOString(combineDateAndTime(date, cls.start));
  var endIso = toGCalISOString(combineDateAndTime(date, cls.end));

  var url =
    'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    '&text=' +
    encodeURIComponent(`${mentor.name} - ${cls.name}`) +
    '&dates=' +
    startIso +
    '/' +
    endIso +
    '&src=' +
    encodeURIComponent(calendarId) +
    '&add=' +
    encodeURIComponent(mentor.email);

  return url;
}

export function formatShortTime(date: Date): string {
  const timeStr = date.toLocaleTimeString('en-US', {
    timeZone: 'America/Chicago',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  // Converts "2:00 PM" -> "2pm" and "3:30 PM" -> "3:30pm"
  return timeStr.toLowerCase().replace(':00', '').replace(/\s+/g, '');
}
