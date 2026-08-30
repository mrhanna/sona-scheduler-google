import { useSchedulerContext } from '../state';
import type { Class, Mentor, School } from '../types/config';

export interface ClassCardProps {
  school: Omit<School, 'classes'>;
  cls: Class & { school: Omit<School, 'classes'> };
  mentor: Mentor;
  date: Date;
}

function combineDateAndTime(date: Date, timeString: string): Date {
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

function toGCalISOString(date: Date) {
  return date.toISOString().replace(/[-:]|\.\d{3}/g, '');
}

/**
 * Builds Google Calendar Event URL from YYYY-MM-DD and "HH:MM" strings
 */
function buildCalendarUrl(
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

function formatShortTime(date: Date): string {
  const timeStr = date.toLocaleTimeString('en-US', {
    timeZone: 'America/Chicago',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  // Converts "2:00 PM" -> "2pm" and "3:30 PM" -> "3:30pm"
  return timeStr.toLowerCase().replace(':00', '').replace(/\s+/g, '');
}

const ClassCard = ({ school, cls, mentor, date }: ClassCardProps) => {
  const { calendars } = useSchedulerContext();

  const classStart = combineDateAndTime(date, cls.start);
  const classEnd = combineDateAndTime(date, cls.end);

  const conflicts = calendars[school.calendarId]?.filter((event) => {
    const eventStart = new Date(event.startTime);
    const eventEnd = new Date(event.endTime);

    return (
      (eventStart < classEnd && eventEnd > classStart) ||
      (eventStart >= classStart && eventStart < classEnd) ||
      (eventEnd > classStart && eventEnd <= classEnd)
    );
  });

  return (
    <div className="card">
      <div>
        <h3>{school.name}</h3>
        <small>{cls.name}</small>
        <small>
          {formatShortTime(classStart)} - {formatShortTime(classEnd)}
        </small>
      </div>
      <div className="book-container">
        {conflicts && conflicts.length > 0 && (
          <span className="conflict-warning">
            ⚠️ {conflicts.length} conflict
            {conflicts.length > 1 ? 's' : ''}:
            <ul>
              {conflicts.map((event) => (
                <li key={event.id}>
                  {event.title}{' '}
                  {event.isAllDay
                    ? ' (All Day)'
                    : ` (${formatShortTime(new Date(event.startTime))} - ${formatShortTime(new Date(event.endTime))})`}
                </li>
              ))}
            </ul>
          </span>
        )}
        {(!conflicts || conflicts.length === 0) && (
          <span className="no-conflict">No conflicts</span>
        )}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={buildCalendarUrl(mentor, cls, date, school.calendarId)}
          className="book-btn"
        >
          Book
        </a>
      </div>
    </div>
  );
};

export default ClassCard;
