import MOCK_CONFIG from './mock.json' with { type: 'json' };
import MOCK_DATES_RAW from './mock-events.json' with { type: 'json' };
import type { CalendarEvent } from '../calendarInfo';

const MOCK_DATES = MOCK_DATES_RAW as Record<
  string,
  Omit<CalendarEvent, 'id'>[]
>;

declare const google: {
  script: {
    run: {
      withSuccessHandler(onSuccess: (result: any) => void): any;
      withFailureHandler(onFailure: (error: Error) => void): any;
      [key: string]: any;
    };
  };
};

export function runGasMethod<T>(
  methodName: string,
  ...args: any[]
): Promise<T> {
  return new Promise((resolve, reject) => {
    // Detect if running inside actual Google Apps Script environment
    const isGasEnv = typeof google !== 'undefined' && google?.script?.run;

    if (!isGasEnv) {
      console.log(
        `[Local Dev Mock] Called server function: "${methodName}" with args:`,
        args,
      );

      // Simulate network delay (300ms)
      setTimeout(() => {
        if (methodName === 'getConfiguration') {
          resolve(MOCK_CONFIG as unknown as T);
        } else if (methodName === 'getEventsForCalendars') {
          resolve(
            args[0].reduce(
              (acc: Record<string, CalendarEvent[]>, k: string) => {
                acc[k] =
                  MOCK_DATES[k].map((event: Omit<CalendarEvent, 'id'>) => ({
                    ...event,
                    id: k,
                  })) || [];
                return acc;
              },
              {},
            ) as unknown as T,
          );
        } else {
          resolve({ status: 'success' } as unknown as T);
        }
      }, 2000);
      return;
    }

    // Actual Google Apps Script Execution
    google.script.run
      .withSuccessHandler((res: T) => resolve(res))
      .withFailureHandler((err: Error) => reject(err))
      [methodName](...args);
  });
}
