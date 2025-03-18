import classNames from "classnames";

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
          className={classNames(
            className,
            "rounded-4 border-sys-color-text-mute checked:border-apollo-brand-primary-orange indeterminate:border-apollo-brand-primary-orange indeterminate:bg-apollo-brand-primary-orange focus-visible:outline-apollo-brand-primary-orange disabled:border-apollo-border-20 disabled:border-sys-color-text-mute col-start-1 row-start-1 appearance-none border-2 bg-transparent transition duration-100 ease-in-out checked:bg-transparent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:border disabled:bg-[#2B2B32] disabled:opacity-40 forced-colors:appearance-auto"
          )}
        />
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="pointer-events-none col-start-1 row-start-1 size-16 self-center justify-self-center"
        >
          <path
            fillRule="evenodd"
            className="opacity-0 group-has-[:checked]:opacity-100"
            clipRule="evenodd"
            d="M4 0C1.79086 0 0 1.79086 0 4V12C0 14.2091 1.79086 16 4 16H12C14.2091 16 16 14.2091 16 12V4C16 1.79086 14.2091 0 12 0H4ZM12.9758 5.28008C13.241 4.96188 13.198 4.48895 12.8798 4.22378C12.5616 3.95861 12.0887 4.0016 11.8235 4.31981L6.41979 10.8042L4.19166 7.93949C3.93736 7.61253 3.46615 7.55363 3.13919 7.80793C2.81223 8.06223 2.75333 8.53344 3.00763 8.8604L5.27389 11.7742C5.84207 12.5047 6.9399 12.5232 7.53237 11.8122L12.9758 5.28008Z"
            fill="#FF6746"
          />
        </svg>
      </div>
    </div>
  );
};

export default wrapImportant(Checkbox);
