import { useSchedulerContext, useSelectedMentor } from '../../../state';
import type { Class, School } from '../../../types/config';

import {
  combineDateAndTime,
  buildCalendarUrl,
  formatShortTime,
} from '../timeUtils';

export interface ClassCardProps {
  school: Omit<School, 'classes'>;
  cls: Class & { school: Omit<School, 'classes'> };
  date: Date;
}

const ClassCard = ({ school, cls, date }: ClassCardProps) => {
  const { calendars, parentheticals } = useSchedulerContext();

  const mentor = useSelectedMentor();
  if (!mentor) return null;

  const classStart = combineDateAndTime(date, cls.start);
  const classEnd = combineDateAndTime(date, cls.end);

  const conflicts = calendars[school.calendarId]?.filter((event) => {
    //parenthetical check
    const eventParenthetical = event.title.match(/\(([^)]+)\)/)?.[1];

    if (eventParenthetical && parentheticals.includes(eventParenthetical)) {
      // if the class or school name doesn't include the parenthetical, then it's not a conflict. It's not at the same location.
      if (
        !cls.name.includes(`(${eventParenthetical})`) &&
        !school.name.includes(`(${eventParenthetical})`)
      ) {
        return false;
      }
    }

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
