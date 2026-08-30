import ClassCard from './ClassCard';
import '@daypicker/react/style.css';
import {
  useSchedulerContext,
  useSelectedClassesForDates,
} from '../../../state';
import { MultiToggleSelect } from '../../MultiToggleSelect';

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

  const dayGroups = useSelectedClassesForDates().map(({ date, classes }) => {
    return (
      <div className="day-group" key={date.toISOString()}>
        <h2>{date.toLocaleDateString()}</h2>
        <div className="day-group-cards">
          {classes.map((cls) => (
            <ClassCard
              key={`${cls.school.name}-${cls.name}-${date.toISOString()}`}
              school={cls.school}
              cls={cls}
              date={date}
            />
          ))}
        </div>
      </div>
    );
  });

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

export default SchedulePane;
