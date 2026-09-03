import MOCK_CONFIG from './mock.json' with { type: 'json' };
import MOCK_DATES_RAW from './mock-events.json' with { type: 'json' };
import type { CalendarEvent } from '../types/config';

const MOCK_DATES = MOCK_DATES_RAW as Record<
  string,
  Omit<CalendarEvent, 'id'>[]
>;

// Adjust mock events to be in the future, relative to the current date
const now = new Date();
for (const events of Object.values(MOCK_DATES)) {
  for (const event of events) {
    const origStart = new Date(event.startTime);
    const origEnd = new Date(event.endTime);
    const durationMs = origEnd.getTime() - origStart.getTime();

    const daysAhead = (origStart.getDay() - now.getDay() + 7) % 7;

    const targetStart = new Date(now);
    targetStart.setDate(now.getDate() + daysAhead);
    targetStart.setHours(
      origStart.getHours(),
      origStart.getMinutes(),
      origStart.getSeconds(),
      0,
    );

    event.startTime = targetStart.toISOString();
    event.endTime = new Date(targetStart.getTime() + durationMs).toISOString();
  }
}

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
        if (methodName === 'getInitialData') {
          resolve({
            config: MOCK_CONFIG,
            calendars: MOCK_DATES,
          } as unknown as T);
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
