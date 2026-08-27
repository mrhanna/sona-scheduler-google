import { useCalendarInfoContext } from '../calendarInfo';
import type { Class, Mentor, School } from '../types/config';

export interface ClassCardProps {
  school: School;
  cls: Class;
  mentor: Mentor;
  date: Date;
}

function combineDateAndTime(date: Date, timeString: string) {
  const [hours, minutes] = timeString.split(':').map(Number);
  const combinedDate = new Date(date);
  combinedDate.setHours(hours, minutes, 0, 0);

  return combinedDate;
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
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  // Converts "2:00 PM" -> "2pm" and "3:30 PM" -> "3:30pm"
  return timeStr.toLowerCase().replace(':00', '').replace(/\s+/g, '');
}

const ClassCard = ({ school, cls, mentor, date }: ClassCardProps) => {
  const { loading, calendarInfo } = useCalendarInfoContext();

  const classStart = combineDateAndTime(date, cls.start);
  const classEnd = combineDateAndTime(date, cls.end);

  const conflicts = calendarInfo[school.calendarId]?.filter((event) => {
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
        {loading && <span className="loader"></span>}
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
        {!loading && (!conflicts || conflicts.length === 0) && (
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
