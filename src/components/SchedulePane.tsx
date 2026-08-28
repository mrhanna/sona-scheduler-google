import { useMemo } from 'react';
import type { Class, Mentor, School } from '../types/config';
import ClassCard from './ClassCard';
import type { DateRange } from '@daypicker/react';
import '@daypicker/react/style.css';
import { useSchedulerContext } from '../state';
import { MultiToggleSelect } from './MultiToggleSelect';

const SchedulePane = () => {
  const { config, options } = useSchedulerContext();
  if (!config) return null;

  if (!options.mentor || !options.schools.length || !options.dates) {
    return (
      <>
        {!options.mentor && <p>Please select a mentor.</p>}
        {!options.schools.length && <p>Please select at least one school.</p>}
        {!options.dates && <p>Please select a date range.</p>}
      </>
    );
  }

  const dates = dateRangeToDates(options.dates);

  const mentorMap = useMemo(() => {
    const mentorMap = new Map<string, Mentor>(
      config.mentors.map((mentor) => [mentor.name, mentor]),
    );
    return mentorMap;
  }, [config]);

  const dayGroups = dates
    .map((date) => {
      const classesForDate = config.schools
        .filter((school) => options.schools.includes(school.name))
        .reduce(
          (acc: (Class & { school: Omit<School, 'classes'> })[], school) => {
            return acc.concat(
              school.classes.map((cls) => ({
                ...cls,
                school: { calendarId: school.calendarId, name: school.name },
              })),
            );
          },
          [],
        )
        .filter((cls) => isClassMeeting(cls.recurrence, date))
        .sort((a, b) => a.start.localeCompare(b.start));

      if (!classesForDate || classesForDate.length === 0) return null;

      return (
        <div className="day-group" key={date.toISOString()}>
          <h2>{date.toLocaleDateString()}</h2>
          <div className="day-group-cards">
            {classesForDate.map((cls) => (
              <ClassCard
                key={`${cls.school.name}-${cls.name}-${date.toISOString()}`}
                school={cls.school}
                cls={cls}
                mentor={mentorMap.get(options.mentor)!}
                date={date}
              />
            ))}
          </div>
        </div>
      );
    })
    .filter((group) => group !== null);

  return (
    <>
      <MultiToggleSelect
        options={config.instruments.map((instrument) => ({
          value: instrument,
          label: instrument,
        }))}
        value={options.instruments}
        onChange={options.setInstruments}
        label="Filter by instrument"
        showClear
      />
      <div className="schedule-pane">
        {!dayGroups || dayGroups.length === 0 ? (
          <p>There were no classes found on the specified dates.</p>
        ) : (
          dayGroups
        )}
      </div>
    </>
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
