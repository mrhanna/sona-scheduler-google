import { createContext, useContext, useState } from 'react';
import { runGasMethod } from './utils/gas';

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  isAllDay: boolean;
}

export interface CalendarInfoState {
  loading: boolean;
  calendarInfo: Record<string, CalendarEvent[]>;
}

export const CalendarInfoContext = createContext<CalendarInfoState>({
  loading: true,
  calendarInfo: {} as Record<string, CalendarEvent[]>,
});

export const useCalendarInfoContext = () => useContext(CalendarInfoContext);

export const useCalendarInfoState = () => {
  const [calendarInfoState, setCalendarInfoState] = useState<CalendarInfoState>(
    {
      loading: true,
      calendarInfo: {} as Record<string, CalendarEvent[]>,
    },
  );

  const updateCalendarInfo = async (
    calendarIds: string[],
    start: Date,
    end: Date,
  ) => {
    setCalendarInfoState({
      calendarInfo: {},
      loading: true,
    });

    const nextCalendarInfo = await runGasMethod<
      Record<string, CalendarEvent[]>
    >(
      'getEventsForCalendars',
      calendarIds,
      start.toISOString(),
      end.toISOString(),
    );

    setCalendarInfoState({
      calendarInfo: nextCalendarInfo,
      loading: false,
    });
  };

  return [calendarInfoState, updateCalendarInfo] as [
    CalendarInfoState,
    (calendarIds: string[], start: Date, end: Date) => Promise<void>,
  ];
};
