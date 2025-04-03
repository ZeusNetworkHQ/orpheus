import wrapImportant from "../wrapImportant";
export interface CheckboxProps {
  /** Is Checkbox Checked */
  checked: boolean;
  /** Custom classNames */
  className?: string;
  /** Is Checkbox Disabled */
  disabled?: boolean;
  /** Handle Checkbox Change */
  handleChange?: (checked: boolean) => void;
}

const Checkbox = ({
  checked,
  className,
  disabled,
  handleChange,
}: CheckboxProps) => {
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (handleChange) {
      handleChange(event.target.checked);
    }
  };

  return (
    <div className="flex h-16 w-16 shrink-0 items-center">
      <div className="group grid size-16 grid-cols-1">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={handleInputChange}
          className={className}
        />
      </div>
    </div>
  );
};

export default wrapImportant(Checkbox);
