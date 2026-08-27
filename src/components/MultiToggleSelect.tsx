import styles from './MultiToggleSelect.module.css';

export interface ToggleOption {
  value: string;
  label: string;
}

interface MultiToggleSelectProps {
  options: ToggleOption[];
  value: string[]; // e.g. ['alto', 'tenor']
  onChange: (selected: string[]) => void;
  label?: string;
  showAll?: boolean;
  showClear?: boolean;
}

export const MultiToggleSelect: React.FC<MultiToggleSelectProps> = ({
  options,
  value,
  onChange,
  label,
  showAll = false,
  showClear = false,
}) => {
  const handleToggle = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  return (
    <div className="field">
      {label && <label className={styles.label}>{label}</label>}

      <div className={styles.buttonGroup}>
        {options.map((option) => {
          const isSelected = value.includes(option.value);

          return (
            <button
              key={option.value}
              type="button"
              data-selected={isSelected}
              aria-pressed={isSelected}
              onClick={() => handleToggle(option.value)}
              className={styles.button}
            >
              {option.label}
            </button>
          );
        })}

        {showAll && (
          <button
            onClick={() => onChange(options.map((opt) => opt.value))}
            className={styles.btnText}
          >
            All
          </button>
        )}

        {showClear && value.length > 0 && (
          <button onClick={() => onChange([])} className={styles.btnText}>
            Clear
          </button>
        )}
      </div>
    </div>
  );
};
