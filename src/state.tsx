import { createContext, useContext, useEffect, useState } from 'react';
import type { Config, CalendarEvent } from './types/config';
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
