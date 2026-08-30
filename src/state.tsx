import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type {
  Config,
  CalendarEvent,
  Mentor,
  Class,
  School,
} from './types/config';
import type { DateRange } from '@daypicker/react';
import { runGasMethod } from './utils/gas';

const useSchedulerState = () => {
  const [config, setConfig] = useState<Config | null>(null);

  const [schools, setSchools] = useState<string[]>([]);
  const [mentor, setMentor] = useState<string>('');
  const [instruments, setInstruments] = useState<string[]>([]);
  const [dates, setDates] = useState<DateRange | undefined>();

  const [calendars, setCalendars] = useState<Record<string, CalendarEvent[]>>(
    {},
  );

  useEffect(() => {
    async function fetchConfig() {
      try {
        const result = await runGasMethod<{
          config: Config;
          calendars: Record<string, CalendarEvent[]>;
        }>('getInitialData');
        setConfig(result.config);
        setCalendars(result.calendars);
      } catch (error) {
        console.error('Error fetching configuration:', error);
      }
    }

    fetchConfig();
  }, []);

  return {
    config,
    setConfig,
    options: {
      schools,
      setSchools,
      mentor,
      setMentor,
      instruments,
      setInstruments,
      dates,
      setDates,
    },
    calendars,
    setCalendars,
  };
};

const SchedulerContext = createContext<ReturnType<
  typeof useSchedulerState
> | null>(null);

export const SchedulerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const schedulerState = useSchedulerState();

  return (
    <SchedulerContext.Provider value={schedulerState}>
      {children}
    </SchedulerContext.Provider>
  );
};

export const useSchedulerContext = () => {
  const context = useContext(SchedulerContext);
  if (!context) {
    throw new Error(
      'useSchedulerContext must be used within a SchedulerProvider',
    );
  }
  return context;
};

export const useSelectedMentor = () => {
  const { options, config } = useSchedulerContext();

  if (!config || !options.mentor) return null;

  const mentorMap = useMemo(() => {
    const mentorMap = new Map<string, Mentor>(
      config.mentors.map((mentor) => [mentor.name, mentor]),
    );
    return mentorMap;
  }, [config]);

  return mentorMap.get(options.mentor) || null;
};

export const useSelectedClassesForDates = () => {
  const { options, config } = useSchedulerContext();

  if (!config || !options.dates || !options.schools) return [];

  const selectedClasses = useMemo(() => {
    const dates = dateRangeToDates(options.dates!);

    return dates
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
          .filter(
            (cls) =>
              isClassMeeting(cls.recurrence, date) &&
              (options.instruments.length === 0 ||
                options.instruments.some((instr) =>
                  cls.instruments.includes(instr),
                )),
          )
          .sort((a, b) => a.start.localeCompare(b.start));
        if (classesForDate.length === 0) return null;
        return { date, classes: classesForDate };
      })
      .filter((dayGroup) => dayGroup !== null);
  }, [config, options.dates, options.schools, options.instruments]);

  return selectedClasses;
};

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

function isClassMeeting(recurrence: string, date: Date): boolean {
  const dateParity = date.getDate() % 2 === 0 ? 'Even' : 'Odd';
  const dateAbbreviation = ['D', 'M', 'T', 'W', 'R', 'F', 'S'][date.getDay()];

  return (
    (![0, 6].includes(date.getDay()) && recurrence === dateParity) ||
    recurrence.indexOf(dateAbbreviation) > -1
  );
}
