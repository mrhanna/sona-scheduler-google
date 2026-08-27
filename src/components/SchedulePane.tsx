import { useMemo } from 'react';
import type { Config, Mentor, School } from '../types/config';
import ClassCard from './ClassCard';
import type { DateRange } from '@daypicker/react';
import '@daypicker/react/style.css';

export interface SchedulePaneProps {
  config: Config;
  mentor: string;
  schools: string[];
  instruments: string[];
  dateRange: DateRange;
}

const SchedulePane = ({
  config,
  mentor,
  schools,
  instruments,
  dateRange,
}: SchedulePaneProps) => {
  // Flatpickr range mode returns "YYYY-MM-DD to YYYY-MM-DD" (or single "YYYY-MM-DD")
  const dates = dateRangeToDates(dateRange);
  const schoolMap = useMemo(() => {
    const schoolMap = new Map<string, School>(
      config.schools.map((school) => [school.name, school]),
    );
    return schoolMap;
  }, [config]);

  const mentorMap = useMemo(() => {
    const mentorMap = new Map<string, Mentor>(
      config.mentors.map((mentor) => [mentor.name, mentor]),
    );
    return mentorMap;
  }, [config]);

  const dayGroups = dates
    .map((date) => {
      const classesForDate = config.classes
        .filter((cls) => {
          return (
            isClassMeeting(cls.recurrence, date) &&
            schools.includes(cls.school) &&
            (instruments.length === 0 ||
              instruments.some((instrument) =>
                cls.instruments.includes(instrument),
              ))
          );
        })
        .sort((a, b) => a.start.localeCompare(b.start));

      if (!classesForDate || classesForDate.length === 0) return null;

      return (
        <div className="day-group" key={date.toISOString()}>
          <h2>{date.toLocaleDateString()}</h2>
          <div className="day-group-cards">
            {classesForDate.map((cls) => (
              <ClassCard
                key={`${cls.school}-${cls.name}-${date.toISOString()}`}
                school={schoolMap.get(cls.school)!}
                cls={cls}
                mentor={mentorMap.get(mentor)!}
                date={date}
              />
            ))}
          </div>
        </div>
      );
    })
    .filter((group) => group !== null);

  console.log(dayGroups);
  return (
    <div className="schedule-pane">
      {!dayGroups || dayGroups.length === 0 ? (
        <p>There were no classes found on the specified dates.</p>
      ) : (
        dayGroups
      )}
    </div>
  );
};

function isClassMeeting(recurrence: string, date: Date): boolean {
  const dateParity = date.getDate() % 2 === 0 ? 'Even' : 'Odd';
  const dateAbbreviation = ['D', 'M', 'T', 'W', 'R', 'F', 'S'][date.getDay()];

  return (
    (![0, 6].includes(date.getDay()) && recurrence === dateParity) ||
    recurrence.indexOf(dateAbbreviation) > -1
  );
}

function dateRangeToDates(dateRange: DateRange): Date[] {
  const { from, to } = dateRange;
  if (!from) return [];
  const start = new Date(from);
  const end = to ? new Date(to) : start;

  // Calculate total inclusive days in range
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const dayCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  // Declaratively generate every Date instance in range
  return Array.from({ length: dayCount }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
}

export default SchedulePane;
