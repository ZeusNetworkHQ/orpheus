import classNames from "classnames";
import { AnimatePresence, motion } from "motion/react";
import { createContext, useContext, useState, useRef, ReactNode } from "react";
import React from "react";
import { useOnClickOutside } from "usehooks-ts";

import Icon from "@/components/Icons";

import Checkbox from "../Checkbox/Checkbox";
import wrapImportant from "../wrapImportant";
export interface DropdownProps {
  /** Button classNames */
  buttonClassName?: string;
  /** Options List */
  children?: React.ReactNode;
  /** Custom classNames */
  className?: string;
  /** Use custom label */
  customLabel?: boolean;
  /** Is Dropdown Disabled */
  disabled?: boolean;
  /** Is Dropdown Invalid */
  invalid?: boolean;
  /** Invalid Message */
  invalidMessage?: string;
  /** Dropdown Icon */
  dropdownIcon?: "chevron" | "expand";
  /** Dropdown Label - can be string or ReactNode */
  label: ReactNode;
  /** Selected Option Index */
  selectedIndex?: number | number[] | null;
  /** Size */
  size?: "sm" | "md";
  /** Type */
  type?: "default" | "filter" | "multi-function";
  /** Width type */
  width?: "auto" | "full";
  /** Custom Placeholder */
  customPlaceholder?: string;
  /** On Clear */
  onClear?: () => void;
}

export interface DropdownOptionProps {
  /** Required Label */
  label: string;
  /** Children */
  children: React.ReactNode;
  /** Is Option Disabled */
  disabled?: boolean;
  /** Custom classNames */
  className?: string;
  /** Click event for outside functions */
  onClick?: () => void;
  /** Index of the option */
  index: number;
}

export const DropdownContext = createContext<{
  size: "sm" | "md";
  selectedIndex: number | number[] | null;
  setSelectedIndex: (
    value:
      | number
      | number[]
      | null
      | ((prev: number | number[] | null) => number | number[] | null)
  ) => void;
  setIsOpen: (isOpen: boolean) => void;
  type: "default" | "filter" | "multi-function";
  width?: "auto" | "full";
  searchValue: string;
  setSearchValue: (value: string) => void;
}>({
  size: "sm",
  selectedIndex: null,
  setSelectedIndex: () => {},
  setIsOpen: () => {},
  type: "default",
  width: "auto",
  searchValue: "",
  setSearchValue: () => {},
});

const Dropdown = ({
  label,
  size = "sm",
  selectedIndex = null,
  children,
  className,
  buttonClassName,
  dropdownIcon = "chevron",
  customLabel = false,
  disabled = false,
  invalid = false,
  invalidMessage = "Invalid",
  type = "default",
  width = "auto",
  customPlaceholder = "",
  onClear,
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSelectedIndex, setCurrentSelectedIndex] = useState<
    number | number[] | null
  >(selectedIndex);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize searchValue with the selected item's label if available
  const initialSearchValue =
    selectedIndex !== null && type === "multi-function"
      ? (children as React.ReactElement<DropdownOptionProps>[])?.[
          selectedIndex as number
        ]?.props.label || ""
      : "";
  const [searchValue, setSearchValue] = useState(initialSearchValue);

  useOnClickOutside(dropdownRef, () => setIsOpen(false));

  const renderLabel = () => {
    if (customLabel || type === "filter") {
      return label;
    }
    if (currentSelectedIndex !== null) {
      if (Array.isArray(currentSelectedIndex)) {
        const selectedLabels = currentSelectedIndex.map(
          (index) =>
            (children as React.ReactElement<DropdownOptionProps>[])?.[index]
              ?.props.label
        );
        return selectedLabels.join(", ");
      }
      return (children as React.ReactElement<DropdownOptionProps>[])?.[
        currentSelectedIndex
      ]?.props.label;
    }
    return label;
  };

  // Filter children based on search value for multi-function type
  const filteredChildren =
    type === "multi-function" && searchValue
      ? React.Children.toArray(children).filter((child) => {
          if (React.isValidElement(child)) {
            const childText =
              typeof child.props.children === "string"
                ? child.props.children
                : "";
            return childText.toLowerCase().includes(searchValue.toLowerCase());
          }
          return false;
        })
      : children;

  // Check if there are no results for multi-function dropdown
  const hasNoResults =
    type === "multi-function" &&
    searchValue &&
    React.Children.count(filteredChildren) === 0;

  return (
    <DropdownContext.Provider
      value={{
        type,
        size,
        selectedIndex: currentSelectedIndex,
        setIsOpen,
        setSelectedIndex: setCurrentSelectedIndex,
        width,
        searchValue,
        setSearchValue,
      }}
    >
      <div
        ref={dropdownRef}
        className={classNames(
          "relative space-y-4",
          {
            "w-full": size === "md" && type === "default",
          },
          className
        )}
      >
        {type === "default" || type === "filter" ? (
          <button
            disabled={disabled}
            onClick={() => setIsOpen(!isOpen)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setIsOpen(!isOpen);
              }
            }}
            className={classNames(
              buttonClassName,
              "rounded-12 group flex h-full w-full flex-shrink-0 items-center transition duration-200 ease-in-out disabled:opacity-40",
              {
                // Default Dropdown Styles
                "body-body2-medium gradient-border bg-sys-color-background-card text-sys-color-text-primary before:from-apollo-border-20 before:to-sys-color-text-mute/5 space-x-8 py-8 pl-16 pr-12":
                  size === "sm" && type === "default",
                "body-body1-medium gradient-border bg-sys-color-background-light text-sys-color-text-primary before:from-apollo-border-15 before:to-apollo-border-15 justify-between space-x-12 px-16 py-8":
                  size === "md" && type === "default",

                // Filter Dropdown Styles
                // No selected options
                "body-body1-medium border-apollo-border-20 text-sys-color-text-secondary hover:bg-sys-color-text-mute/5 hover:text-sys-color-text-primary space-x-8 border px-16 py-8":
                  type === "filter" &&
                  (selectedIndex === null ||
                    (Array.isArray(selectedIndex) &&
                      selectedIndex.length === 0)),

                // Selected options
                "body-body1-medium border-apollo-brand-secondary-orange/50 text-apollo-brand-secondary-blue hover:bg-apollo-brand-primary-blue/5 hover:text-apollo-brand-primary-blue space-x-8 border px-16 py-8":
                  type === "filter" &&
                  selectedIndex !== null &&
                  (!Array.isArray(selectedIndex) || selectedIndex.length > 0),
              }
            )}
          >
            {type === "filter" && (
              <Icon
                name="Filter"
                className={classNames(
                  "flex-shrink-0 duration-200 ease-in-out",
                  {
                    // Selected options
                    "!text-apollo-brand-secondary-blue group-hover:!text-apollo-brand-primary-blue":
                      selectedIndex !== null &&
                      (!Array.isArray(selectedIndex) ||
                        selectedIndex.length > 0),
                    // Unselected options
                    "text-sys-color-text-secondary group-hover:!text-sys-color-text-primary":
                      selectedIndex === null ||
                      (Array.isArray(selectedIndex) &&
                        selectedIndex.length === 0),
                  }
                )}
              />
            )}
            <div className="flex w-full max-w-full items-center truncate">
              {renderLabel()}
            </div>
            {type === "default" && (
              <Icon
                name={
                  dropdownIcon === "chevron"
                    ? size === "sm"
                      ? "ChevronDownSmall"
                      : "ChevronDown"
                    : dropdownIcon === "expand"
                      ? "DropdownSmall"
                      : "ChevronDown"
                }
                size={18}
                className={classNames(
                  dropdownIcon === "chevron" && "text-sys-color-text-primary",
                  "text-sys-color-text-mute flex-shrink-0"
                )}
              />
            )}
          </button>
        ) : (
          <div
            className={classNames(
              "rounded-12 gradient-border bg-sys-color-background-light border-apollo-border-15 focus-within:border-sys-color-text-mute/60 group relative flex w-full flex-shrink-0 items-center border transition duration-200 ease-in-out disabled:opacity-40",
              {
                "border-sys-color-state-error shadow-[inset_0px_0px_16px_rgba(236,70,100,0.25)]":
                  invalid && type === "multi-function",
              }
            )}
          >
            <input
              type="text"
              disabled={disabled}
              placeholder={customPlaceholder || (label as string)}
              onFocus={() => setIsOpen(true)}
              onBlur={() => setIsOpen(false)}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="placeholder:text-sys-color-text-mute body-body1-medium text-sys-color-text-primary relative z-10 w-[calc(100%-96px)] justify-between space-x-12 truncate bg-transparent px-16 py-12 transition ease-in-out focus:outline-none focus:ring-0"
            />

            <div className="absolute right-16 flex h-full items-center gap-x-12 py-12">
              <AnimatePresence>
                {currentSelectedIndex !== null && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { duration: 0.15 } }}
                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                    className="group z-10 flex items-center gap-x-12"
                  >
                    <div
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentSelectedIndex(null);
                        setSearchValue("");
                        onClear?.();
                      }}
                    >
                      <Icon
                        name="CloseCircle"
                        size={12}
                        className="text-sys-color-text-mute hover:text-sys-color-text-primary transition"
                      />
                    </div>
                    <div className="h-[16px] w-[1px] bg-[#3F3F53]"></div>
                  </motion.div>
                )}
              </AnimatePresence>
              <Icon name="ChevronDown" className="text-sys-color-text-mute" />
            </div>
          </div>
        )}

        <AnimatePresence>
          {isOpen && (type === "default" || type === "multi-function") && (
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { duration: 0.15 },
              }}
              exit={{
                opacity: 0,
                y: -5,
                transition: { duration: 0.15 },
              }}
              className={classNames(
                "group/dropdown rounded-12 border-apollo-border-15 bg-sys-color-background-light absolute z-50 flex transform flex-col items-start justify-between gap-y-4 border p-4",
                {
                  "w-full": width === "full",
                  "w-auto min-w-full": width === "auto",
                }
              )}
            >
              {hasNoResults ? <EmptyState /> : filteredChildren}
            </motion.div>
          )}

          {isOpen && type === "filter" && (
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.15 } }}
              exit={{ opacity: 0, y: -5, transition: { duration: 0.15 } }}
              className={classNames(
                "group/dropdown rounded-12 border-apollo-border-15 bg-sys-color-background-light absolute z-50 flex transform flex-col items-start gap-y-4 border p-4",
                {
                  "w-full": width === "full",
                  "w-max min-w-full": width === "auto",
                }
              )}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
        {invalid && type === "multi-function" && (
          <div className="body-body2-medium text-sys-color-state-error mt-8 flex w-full items-center justify-end space-x-4">
            <Icon name="NoteSmall" size={12} />
            <span>{invalidMessage}</span>
          </div>
        )}
      </div>
    </DropdownContext.Provider>
  );
};

const DropdownOption = ({
  children,
  disabled,
  className,
  index,
  onClick,
  label,
}: DropdownOptionProps & { index: number }) => {
  const {
    size,
    selectedIndex,
    setSelectedIndex,
    setIsOpen,
    type,
    searchValue,
    setSearchValue,
  } = useContext(DropdownContext);

  const handleSetSelectedIndex = (index: number) => {
    if (type === "filter") {
      setSelectedIndex((prev) => {
        if (Array.isArray(prev)) {
          return prev.includes(index)
            ? prev.filter((i) => i !== index)
            : [...prev, index];
        }
        return [index];
      });
      onClick?.();
    } else {
      setSelectedIndex(index);
      setIsOpen(false);
      if (type === "multi-function") {
        setSearchValue(label);
      }
      onClick?.();
    }
  };

  const isSelected =
    type === "filter"
      ? Array.isArray(selectedIndex) && selectedIndex.includes(index)
      : selectedIndex === index;

  if (type === "multi-function" && searchValue) {
    const childText = typeof children === "string" ? children : "";
    if (!childText.toLowerCase().includes(searchValue.toLowerCase())) {
      return null;
    }
  }

  return (
    <button
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        handleSetSelectedIndex(index);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.stopPropagation();
          handleSetSelectedIndex(index);
        }
      }}
      className={classNames(
        className,
        "rounded-8 peer flex w-full items-start",
        {
          // Enabled Options styles
          "hover:bg-sys-color-background-card focus:bg-sys-color-background-card-foreground transition duration-200 ease-in-out focus:outline-none":
            !disabled,

          // Disabled Options styles
          "!text-ref-palette-opacity-cold-grey-40 cursor-default": disabled,

          // Selected Options styles
          "bg-sys-color-background-card-foreground focus:!bg-sys-color-background-card group-focus-within/dropdown:bg-transparent group-hover/dropdown:bg-transparent":
            selectedIndex === index,

          // Default Dropdown Option Styles
          "body-body2-medium text-sys-color-text-primary hover:!bg-sys-color-background-card px-12 py-8":
            size === "sm" && type === "default",
          "body-body1-medium text-sys-color-text-primary hover:!bg-sys-color-background-card z-10 px-12 py-8":
            size === "md" && (type === "default" || type === "multi-function"),

          // Filter Dropdown Option Styles
          "body-body1-medium text-sys-color-text-mute hover:!bg-sys-color-text-mute/10 relative z-20 flex items-center gap-x-12 px-12 py-12 sm:!py-8":
            type === "filter",
          "bg-sys-color-background-card": type === "filter" && isSelected,
        }
      )}
    >
      {type === "filter" && (
        <Checkbox checked={isSelected} disabled={disabled} />
      )}
      {children}
    </button>
  );
};

const EmptyState = () => (
  <div className="body-body1-medium text-sys-color-text-mute flex w-full items-center justify-center py-16">
    No results found
  </div>
);

const WrappedDropdown = wrapImportant(Dropdown);
const WrappedDropdownOption = wrapImportant(DropdownOption);

export { WrappedDropdown as Dropdown, WrappedDropdownOption as DropdownOption };
