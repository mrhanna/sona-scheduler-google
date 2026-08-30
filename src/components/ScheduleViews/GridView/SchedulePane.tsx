import ClassCard from './ClassCard';
import '@daypicker/react/style.css';
import {
  useSchedulerContext,
  useSelectedClassesForDates,
} from '../../../state';

const SchedulePane = () => {
  const { config } = useSchedulerContext();
  if (!config) return null;

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
    <div className="schedule-pane">
      {!dayGroups || dayGroups.length === 0 ? (
        <p>There were no classes found on the specified dates.</p>
      ) : (
        dayGroups
      )}
    </div>
  );
};

export default SchedulePane;
