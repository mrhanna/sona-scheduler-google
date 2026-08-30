import { useSchedulerContext } from '../../state';
import { MultiToggleSelect } from '../MultiToggleSelect';
import SchedulePane from './GridView/SchedulePane';

const ScheduleView = () => {
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
      <SchedulePane />
    </>
  );
};

export default ScheduleView;
