import { useEffect, useState } from 'react';
import './App.css';
import { runGasMethod } from './utils/gas';

import type { Config } from './types/config';
import SchedulePane from './components/SchedulePane';
import { type DateRange, DayPicker } from 'react-day-picker';
import { CalendarInfoContext, useCalendarInfoState } from './calendarInfo';
import { MultiToggleSelect } from './components/MultiToggleSelect';

function App() {
  const [config, setConfig] = useState<Config | null>(null);

  const [schools, setSchools] = useState<string[]>([]);
  const [mentor, setMentor] = useState<string>('');
  const [instruments, setInstruments] = useState<string[]>([]);
  const [dates, setDates] = useState<DateRange | undefined>();

  const [calendarInfoState, updateCalendarInfo] = useCalendarInfoState();

  //fetch config from GAS
  useEffect(() => {
    async function fetchConfig() {
      try {
        const result = await runGasMethod<Config>('getConfiguration');
        setConfig(result);
      } catch (error) {
        console.error('Error fetching configuration:', error);
      }
    }

    fetchConfig();
  }, []);

  // update calendar info when dates or schools change
  useEffect(() => {
    if (!config || !dates || !schools.length) return;

    const calendarIds = schools.map((schoolName) => {
      const school = config.schools.find(
        (school) => school.name === schoolName,
      );
      return school!.calendarId;
    });

    updateCalendarInfo(calendarIds, dates.from!, dates.to!);
  }, [config, dates, schools]);

  return (
    <>
      <h1>SoNA Mentors Visit Scheduler</h1>
      {!config && <span className="loader"></span>}

      {config && (
        <div className="app-container">
          <div className="config-area">
            <div className="field">
              <label htmlFor="Mentor">Mentor Name</label>
              <select
                id="Mentor"
                value={mentor}
                onChange={(e) => setMentor(e.target.value)}
                className="select"
              >
                <option value="" disabled hidden>
                  Select a mentor
                </option>
                {config.mentors.map((m) => (
                  <option key={m.name} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <MultiToggleSelect
              options={config.schools.map((school) => ({
                value: school.name,
                label: school.name,
              }))}
              value={schools}
              onChange={setSchools}
              label="Schools"
              showAll
              showClear
            />

            <DayPicker
              animate
              mode="range"
              selected={dates}
              onSelect={setDates}
              disabled={{
                before: new Date(),
                after: (() => {
                  const d = new Date();
                  d.setMonth(d.getMonth() + 5);
                  return d;
                })(),
              }}
            />
          </div>
          <div className="schedule-area">
            <CalendarInfoContext.Provider value={calendarInfoState}>
              {!mentor && <p>Please select a mentor.</p>}
              {!schools.length && <p>Please select at least one school.</p>}
              {!dates && <p>Please select a date range.</p>}
              {mentor && schools && schools.length > 0 && dates && (
                <>
                  <MultiToggleSelect
                    options={config.instruments.map((instrument) => ({
                      value: instrument,
                      label: instrument,
                    }))}
                    value={instruments}
                    onChange={setInstruments}
                    label="Filter by instrument"
                    showClear
                  />
                  <SchedulePane
                    config={config}
                    mentor={mentor}
                    schools={schools}
                    instruments={instruments}
                    dateRange={dates}
                  />
                </>
              )}
            </CalendarInfoContext.Provider>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
