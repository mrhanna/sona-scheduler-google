import './App.css';
import SchedulePane from './components/ScheduleViews/GridView/SchedulePane';
import { DayPicker } from 'react-day-picker';
import { MultiToggleSelect } from './components/MultiToggleSelect';
import { useSchedulerContext } from './state';

function App() {
  const { config, options } = useSchedulerContext();

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
                value={options.mentor}
                onChange={(e) => options.setMentor(e.target.value)}
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
              value={options.schools}
              onChange={options.setSchools}
              label="Schools"
              showAll
              showClear
            />

            <DayPicker
              animate
              mode="range"
              selected={options.dates}
              onSelect={options.setDates}
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
            <SchedulePane />
          </div>
        </div>
      )}
    </>
  );
}

export default App;
