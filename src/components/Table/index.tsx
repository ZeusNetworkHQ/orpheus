import classNames from "classnames";
import React, { useEffect, useState } from "react";

import Divider from "@/components/Divider";
import Icon from "@/components/Icons";
import { IconName } from "@/components/Icons/icons";
import Tooltip from "@/components/Tooltip";

export interface TableProps {
  /** Table Content */
  children?: React.ReactNode;
  /** Allow overflow */
  allowOverflow?: boolean;
  /** Custom classNames */
  className?: string;
  /** Custom column sizing */
  columnSizes?: number[];
  /** Should last item align to end */
  lastItemAlignEnd?: boolean;
  /** Is the first item sticky */
  stickFirstItem?: boolean;
  /** Is the last item sticky */
  stickLastItem?: boolean;
  /** Show Labels on Mobile */
  showLabelsOnMobile?: boolean;
  /** Table Type */
  tableType?: "default" | "stacked";
  /** Table Headers */
  headers?: string[];
  /** Header Size */
  headerSize?: "small" | "large";
  /** Table Width */
  width?: "auto" | "stretch";
  /** Table Variant */
  variant?: "nested" | "separated";
  /** Show Divider on mobile */
  showDividerOnMobile?: boolean;
  /** Hide last divider on mobile */
  hideLastDividerOnMobile?: boolean;
}

export interface TableHeaderProps {
  /** Hide on mobile */
  hideOnMobile?: boolean;
}

export interface MobileHeaderProps {
  /** Children of MobileHeader */
  children: React.ReactNode;
  /** Custom classNames */
  className?: string;
}

export interface TableBodyProps {
  /** Children of TableBody */
  children: React.ReactNode;
  /** Custom classNames */
  className?: string;
}

export interface TableRowProps {
  /** Children of TableRow */
  children: React.ReactNode;
  /** Custom classNames */
  className?: string;
  /** Size of all cells in the row */
  size?: "small" | "medium" | "large" | "medium/16px";
  /** Show mobile header */
  mobileHeader?: React.ReactNode;
}

export interface TableCellProps {
  /** Cell Value */
  value?: string | number | React.ReactNode;
  /** Custom classNames */
  className?: string;
  /** Left Icon */
  leftIcon?: IconName;
  /** Left Icon Size */
  leftIconSize?: 18 | 14 | 12;
  /** Left Icon Classname */
  leftIconClassName?: string;
  /** Right Icon */
  rightIcon?: IconName;
  /** Right Icon Size */
  rightIconSize?: 18 | 14 | 12;
  /** Right Icon Classname */
  rightIconClassName?: string;
  /** Right Icon On Click */
  rightIconOnClick?: () => void;
  /** Right Icon On Mouse Enter */
  rightIconOnMouseEnter?: () => void;
  /** Right Icon On Mouse Leave */
  rightIconOnMouseLeave?: () => void;
  /** Hide on mobile */
  hideOnMobile?: boolean;
  /** Hide labels on mobile */
  hideLabelOnMobile?: boolean;
  /** Children of TableCell */
  children?: React.ReactNode;
  /** Full Width on Mobile */
  fullWidthMobile?: boolean;
  /** Show Lock Icon */
  showLockIcon?: boolean;
  /** Show Copied Tooltip */
  showCopiedTooltip?: boolean;
  /** Copied Tooltip ClassName */
  copiedTooltipClassName?: string;
}

// Helper function to convert column sizes to grid template
const getGridTemplateColumns = (columnSizes?: number[]) => {
  if (!columnSizes || columnSizes.length === 0) return;
  return columnSizes
    .map((size) => (typeof size === "number" ? `${size}fr` : size))
    .join(" ");
};

// Helper function to check if grid is valid
function checkGridIsValid(arr: number[]) {
  const sum = arr.reduce((a, b) => a + b, 0);
  if (sum !== 8 && sum !== 16 && sum !== 32) {
    console.warn(
      `To ensure correct design practices, table grids should sum to 8, 16 or 32. Got: ${sum}`
    );
  }
  return arr;
}

export const TableContext = React.createContext<{
  columnSizes?: number[];
  lastItemAlignEnd?: boolean;
  cellSize?: "small" | "medium" | "large" | "medium/16px";
  stickFirstItem?: boolean;
  stickLastItem?: boolean;
  tableType?: "default" | "stacked";
  showLabelsOnMobile?: boolean;
  headers?: string[];
  headerSize?: "small" | "large";
  width?: "auto" | "stretch";
  variant?: "nested" | "separated";
  showDividerOnMobile?: boolean;
  hideLastDividerOnMobile?: boolean;
  isOverflowing?: boolean;
}>({});

const Table = ({
  children,
  className,
  columnSizes,
  lastItemAlignEnd,
  stickFirstItem,
  stickLastItem,
  tableType = "default",
  showLabelsOnMobile = true,
  headers,
  headerSize = "small",
  width = "auto",
  variant = "nested",
  showDividerOnMobile = false,
  hideLastDividerOnMobile = false,
  allowOverflow = false,
}: TableProps) => {
  const tableRef = React.useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = React.useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (tableRef.current) {
        setIsOverflowing(
          tableRef.current.scrollWidth > tableRef.current.clientWidth
        );
      }
    };

    checkOverflow();

    const resizeObserver = new ResizeObserver(checkOverflow);
    if (tableRef.current) {
      resizeObserver.observe(tableRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const validatedColumnSizes = columnSizes
    ? checkGridIsValid(columnSizes)
    : undefined;

  const tableContext = React.useMemo(
    () => ({
      columnSizes: validatedColumnSizes,
      lastItemAlignEnd,
      stickFirstItem,
      stickLastItem,
      tableType,
      headers,
      headerSize,
      showLabelsOnMobile,
      width,
      variant,
      showDividerOnMobile,
      hideLastDividerOnMobile,
      isOverflowing,
    }),
    [
      validatedColumnSizes,
      lastItemAlignEnd,
      stickFirstItem,
      stickLastItem,
      tableType,
      headers,
      headerSize,
      showLabelsOnMobile,
      width,
      showDividerOnMobile,
      hideLastDividerOnMobile,
      isOverflowing,
    ]
  );

  return (
    <div
      className={classNames(
        width === "auto" && "w-full min-w-full pb-8 md:max-w-max",
        width === "stretch" && "w-full",
        "rounded-12 relative mx-auto flex items-center justify-center overflow-hidden pb-8",
        allowOverflow && "!overflow-visible"
      )}
    >
      <div
        ref={tableRef}
        className={classNames(
          {
            // Table Width Styling
            "w-full min-w-full md:w-max md:overflow-x-auto":
              tableType === "stacked" && width === "auto",
            "w-full md:overflow-auto":
              tableType === "stacked" && width === "stretch",
            "overflow-x-auto": tableType === "default" && width === "auto",
            "w-full": tableType === "default" && width === "stretch",
            "!overflow-visible !overflow-x-visible": allowOverflow,
          },
          "[&::-webkit-scrollbar]:!w-apollo-6 [&::-webkit-scrollbar]:!h-apollo-6 [&::-webkit-scrollbar-thumb]:!bg-sys-color-background-light/60 relative inline-block w-full overflow-x-auto pb-4 [&::-webkit-scrollbar-button]:!rounded-full [&::-webkit-scrollbar-button]:!bg-transparent [&::-webkit-scrollbar-thumb]:!rounded-full [&::-webkit-scrollbar-thumb]:!border-2 [&::-webkit-scrollbar-thumb]:!shadow-[inset_0_0_0_1px_rgba(139,138,158,0.2)] [&::-webkit-scrollbar-track]:!rounded-full [&::-webkit-scrollbar-track]:!bg-transparent"
        )}
      >
        <div
          className={classNames("inline-block", {
            // Table Width Styling
            "w-auto min-w-full": tableType === "default" && width === "auto",
            "w-full": tableType === "default" && width === "stretch",
            "w-full min-w-full md:w-auto":
              tableType === "stacked" && width === "auto",
            "w-full md:w-full": tableType === "stacked" && width === "stretch",
          })}
        >
          <TableContext.Provider value={tableContext}>
            <div
              className={classNames(
                "rounded-12 flex flex-col p-8",
                // Hide table background on stacked view if mobile
                tableType === "default" && "bg-sys-color-background-light",
                tableType === "stacked" &&
                  "md:bg-sys-color-background-light p-0 md:p-8",
                variant === "separated" && "!bg-transparent md:px-16 md:pb-4",
                className
              )}
            >
              {children}
            </div>
          </TableContext.Provider>
        </div>
      </div>
      {/* Create elements to hide overflowing content */}
      {variant === "nested" && (
        <header className="absolute top-0 mx-auto hidden w-full md:block">
          <span
            className={classNames(
              stickFirstItem &&
                isOverflowing &&
                "bg-sys-color-background-light absolute left-0 top-8 z-[5]",
              headerSize === "small" && "h-36 w-36",
              headerSize === "large" && "h-48 w-36"
            )}
          ></span>

          <span
            className={classNames(
              stickLastItem &&
                isOverflowing &&
                "bg-sys-color-background-light absolute right-0 top-8 z-[5]",
              headerSize === "small" && "h-36 w-36",
              headerSize === "large" && "h-48 w-36"
            )}
          ></span>
        </header>
      )}
    </div>
  );
};

const TableHeader = () => {
  const {
    columnSizes,
    lastItemAlignEnd,
    stickFirstItem,
    stickLastItem,
    tableType,
    headers,
    headerSize,
    variant,
    isOverflowing,
  } = React.useContext(TableContext);

  if (!headers || headers.length === 0) return null;

  return (
    <div
      className={classNames(
        "rounded-8 backface-hidden grid w-full",
        variant === "nested" && "bg-sys-color-background-card",
        // Set auto columns if no column sizes are provided
        !columnSizes && "auto-cols-fr grid-flow-col",
        // Hide header on mobile stacked view
        tableType === "stacked" && "hidden md:grid",
        variant === "separated" && "px-16"
      )}
      style={{
        gridTemplateColumns: getGridTemplateColumns(columnSizes) || undefined,
      }}
    >
      {headers.map((header, index) => {
        return (
          <div
            key={index}
            className={classNames(
              "z-1 text-sys-color-text-mute first:rounded-l-8 last:rounded-r-8 relative whitespace-nowrap px-12",
              {
                // Align last item to end, doesn't work with sticky items
                "last-of-type:justify-self-end":
                  lastItemAlignEnd && !stickLastItem,
                // Cell Sizing
                "body-body2-medium py-8": headerSize === "small",
                "body-body1-medium py-12": headerSize === "large",
                // Sticky First and Last Styling
                "bg-sys-color-background-card first-of-type:rounded-l-8 first-of-type:before:bg-sys-color-background-light after:hidden first-of-type:z-10 first-of-type:before:absolute first-of-type:before:-left-8 first-of-type:before:top-0 first-of-type:before:hidden first-of-type:before:h-full first-of-type:before:w-8 first-of-type:after:absolute first-of-type:after:-right-20 first-of-type:after:top-0 first-of-type:after:h-full first-of-type:after:w-20 first-of-type:after:bg-gradient-to-r first-of-type:after:from-[#11111160] first-of-type:after:to-transparent md:after:block md:first-of-type:sticky md:first-of-type:left-8 first-of-type:md:before:block md:first-of-type:after:content-['']":
                  stickFirstItem && isOverflowing && variant === "nested",
                "bg-sys-color-background-card last:rounded-r-8 last:before:bg-sys-color-background-light after:hidden last:z-10 last:before:absolute last:before:-right-8 last:before:top-0 last:before:hidden last:before:h-full last:before:w-8 last:after:absolute last:after:-left-20 last:after:top-0 last:after:h-full last:after:w-20 last:after:bg-gradient-to-r last:after:from-transparent last:after:to-[#11111160] md:after:block md:last:sticky md:last:right-8 md:last:before:block md:last:after:content-['']":
                  stickLastItem && isOverflowing && variant === "nested",
                "bg-sys-color-background-light first-of-type:rounded-l-8 first-of-type:before:bg-sys-color-background-light after:hidden first-of-type:z-10 first-of-type:before:absolute first-of-type:before:-left-8 first-of-type:before:top-0 first-of-type:before:hidden first-of-type:before:h-full first-of-type:before:w-8 first-of-type:after:absolute first-of-type:after:-right-20 first-of-type:after:top-0 first-of-type:after:h-full first-of-type:after:w-20 md:after:block md:first-of-type:sticky md:first-of-type:left-8 first-of-type:md:before:block md:first-of-type:after:content-['']":
                  stickFirstItem && isOverflowing && variant === "separated",
                "bg-sys-color-background-light last:rounded-r-8 last:before:bg-sys-color-background-light after:hidden last:z-10 last:before:absolute last:before:-right-8 last:before:top-0 last:before:hidden last:before:h-full last:before:w-8 last:after:absolute last:after:-left-20 last:after:top-0 last:after:h-full last:after:w-20 md:after:block md:last:sticky md:last:right-8 md:last:before:block md:last:after:content-['']":
                  stickLastItem && isOverflowing && variant === "separated",
              }
            )}
          >
            {header}
          </div>
        );
      })}
    </div>
  );
};

const TableBody = ({ children, className }: TableBodyProps) => {
  const rows = React.Children.toArray(children);
  const { tableType, variant, stickFirstItem, stickLastItem } =
    React.useContext(TableContext);

  return (
    <div
      className={classNames(
        // Stacked Table Styling
        tableType === "stacked" &&
          variant === "nested" &&
          "flex flex-col gap-y-24 md:gap-y-0",
        tableType === "stacked" &&
          variant === "separated" &&
          "flex flex-col gap-y-16 md:gap-y-0",
        // Separated Table Styling
        variant === "separated" &&
          tableType === "default" &&
          "bg-sys-color-background-card rounded-16 border-apollo-border-15 z-10 border px-16 shadow-[inset_0px_2px_2px_rgba(139,138,158,0.1)]",
        (stickFirstItem || stickLastItem) && "!shadow-none",
        variant === "separated" &&
          tableType === "stacked" &&
          "md:bg-sys-color-background-card rounded-16 md:border-apollo-border-15 bg-transparent md:border md:px-16 md:shadow-[inset_0px_2px_2px_rgba(139,138,158,0.1)]",
        className
      )}
    >
      {rows.map((row, index) => (
        <React.Fragment key={index}>
          {React.cloneElement(row as React.ReactElement, { rowIndex: index })}
          {index < rows.length - 1 && (
            <Divider
              className={classNames(
                tableType === "stacked" && "hidden md:block"
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const TableRow = ({
  children,
  className,
  size = "small",
  mobileHeader,
  rowIndex,
}: TableRowProps & { rowIndex?: number }) => {
  const rowCellCount = React.Children.count(children);

  const {
    columnSizes,
    lastItemAlignEnd,
    stickFirstItem,
    stickLastItem,
    tableType,
    headers,
    showLabelsOnMobile,
    width,
    variant,
    showDividerOnMobile,
    hideLastDividerOnMobile,
    isOverflowing,
  } = React.useContext(TableContext);

  const validatedColumnSizes = columnSizes
    ? checkGridIsValid(columnSizes)
    : undefined;
  const rowContext = React.useMemo(
    () => ({
      columnSizes: validatedColumnSizes,
      cellSize: size,
      lastItemAlignEnd,
      stickFirstItem,
      stickLastItem,
      tableType,
      mobileHeader,
      rowCellCount,
      headers,
      showLabelsOnMobile,
      width,
      variant,
      showDividerOnMobile,
      hideLastDividerOnMobile,
      isOverflowing,
    }),
    [
      validatedColumnSizes,
      size,
      lastItemAlignEnd,
      stickFirstItem,
      stickLastItem,
      tableType,
      mobileHeader,
      rowCellCount,
      headers,
      showLabelsOnMobile,
      width,
      variant,
      showDividerOnMobile,
      hideLastDividerOnMobile,
      isOverflowing,
    ]
  );

  return (
    <TableContext.Provider value={rowContext}>
      <div
        data-row-index={rowIndex}
        className={classNames(
          // Set auto columns if no column sizes are provided
          !validatedColumnSizes && "auto-cols-fr grid-flow-col",
          // Table Type Styling
          tableType === "default" &&
            width === "auto" &&
            "grid w-max min-w-full",
          tableType === "default" && width === "stretch" && "grid w-full",
          // Stacked Table Styling Nested
          tableType === "stacked" &&
            variant === "nested" &&
            "rounded-16 border-apollo-border-15 bg-sys-color-background-light/20 flex w-full min-w-full flex-wrap gap-y-8 border p-8 pb-12 md:grid md:gap-y-0 md:rounded-none md:border-none md:bg-transparent md:p-0 md:pb-0",
          tableType === "stacked" &&
            variant === "nested" &&
            width === "auto" &&
            "md:w-max",
          // Stacked Table Styling Separated
          tableType === "stacked" &&
            variant === "separated" &&
            "gradient-border before:from-apollo-border-15 before:to-apollo-border-10 rounded-16 flex w-full min-w-full flex-wrap gap-y-0 bg-white p-8 pb-12 md:grid md:gap-y-0 md:rounded-none md:border-none md:bg-transparent md:p-0 md:pb-0 md:before:hidden",
          tableType === "stacked" &&
            variant === "separated" &&
            width === "auto" &&
            "md:w-max",
          className
        )}
        style={{
          gridTemplateColumns: `${getGridTemplateColumns(validatedColumnSizes)}`,
        }}
      >
        {tableType === "stacked" && mobileHeader && (
          <header className="w-full md:hidden">{mobileHeader}</header>
        )}

        {React.Children.map(children, (child, index) => {
          const isHiddenOnMobile = (child as React.ReactElement).props
            .hideOnMobile;
          return (
            <>
              {React.cloneElement(child as React.ReactElement, {
                index,
                rowIndex,
              })}
              {showDividerOnMobile &&
                tableType === "stacked" &&
                !isHiddenOnMobile && (
                  <>
                    {hideLastDividerOnMobile && index !== rowCellCount - 2 && (
                      <span className="w-full last-of-type:hidden md:hidden">
                        <Divider className="w-full" />
                      </span>
                    )}
                    {!hideLastDividerOnMobile && (
                      <span className="w-full last-of-type:hidden md:hidden">
                        <Divider className="w-full" />
                      </span>
                    )}
                  </>
                )}
            </>
          );
        })}
      </div>
    </TableContext.Provider>
  );
};

const MobileHeader = ({ children, className }: MobileHeaderProps) => {
  return (
    <div
      className={classNames(
        "rounded-12 text-sys-color-text-secondary bg-sys-color-background-card body-body2-medium flex w-full items-center justify-between px-12 py-8 md:hidden md:py-12",
        className
      )}
    >
      {children}
    </div>
  );
};

const TableCell = ({
  value,
  className,
  leftIcon,
  leftIconSize = 18,
  leftIconClassName,
  rightIcon,
  rightIconSize = 18,
  rightIconClassName,
  hideOnMobile,
  index,
  rowIndex,
  children,
  hideLabelOnMobile,
  fullWidthMobile,
  showLockIcon,
  rightIconOnClick,
  rightIconOnMouseEnter,
  rightIconOnMouseLeave,
  showCopiedTooltip = false,
  copiedTooltipClassName,
}: TableCellProps & { index?: number; rowIndex?: number }) => {
  const {
    lastItemAlignEnd,
    cellSize,
    stickFirstItem,
    stickLastItem,
    tableType,
    showLabelsOnMobile,
    headers,
    variant,
    isOverflowing,
  } = React.useContext(TableContext);

  const [isCopied, setIsCopied] = useState(false);
  const [isLastRow, setIsLastRow] = useState(false);

  // Check if this cell is in the last row
  useEffect(() => {
    if (rowIndex !== undefined) {
      const allRows = document.querySelectorAll("[data-row-index]");
      const lastRowIndex = allRows.length - 1;
      setIsLastRow(rowIndex === lastRowIndex);
    }
  }, [rowIndex]);

  function handleCopy() {
    if (!isCopied) {
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 1500);
    }
  }

  return (
    <div
      className={classNames(
        "text-sys-color-text-primary relative z-[1] flex items-center md:px-12",
        {
          // Cell Sizing
          "body-body2-medium py-12":
            cellSize === "small" && tableType === "default",
          "body-body2-medium py-16":
            cellSize === "medium" && tableType === "default",
          "body-body1-medium py-12":
            cellSize === "medium/16px" && tableType === "default",
          "body-body1-medium py-24":
            cellSize === "large" && tableType === "default",
          "body-body2-medium md:py-12":
            cellSize === "small" && tableType === "stacked",
          "body-body2-medium md:py-16":
            cellSize === "medium" && tableType === "stacked",
          "body-body1-medium md:py-12":
            cellSize === "medium/16px" && tableType === "stacked",
          "body-body1-medium md:py-24":
            cellSize === "large" && tableType === "stacked",

          // Stacked Table Styling Separated
          "p-12": variant === "separated" && tableType === "stacked",

          // Stacked Table Alignment for odd rows
          "[&:nth-child(odd_of_:not(.hidden))]:justify-end md:[&:nth-child(odd_of_:not(.hidden))]:justify-start":
            tableType === "stacked" && !showLabelsOnMobile,
          "w-[50%] after:hidden md:w-full md:after:block":
            tableType === "stacked" && !showLabelsOnMobile,
          "w-full justify-between after:hidden md:after:block":
            tableType === "stacked" && showLabelsOnMobile,
          "hidden md:flex": hideOnMobile && tableType === "stacked",

          // Sticky First and Last Styling
          "first-of-type:before:bg-sys-color-background-light md:first-of-type:bg-sys-color-background-light after:hidden first-of-type:left-8 first-of-type:z-10 first-of-type:before:absolute first-of-type:before:-left-8 first-of-type:before:top-0 first-of-type:before:hidden first-of-type:before:h-full first-of-type:before:w-8 first-of-type:after:absolute first-of-type:after:-right-20 first-of-type:after:top-0 first-of-type:after:h-full first-of-type:after:w-20 first-of-type:after:bg-gradient-to-r first-of-type:after:from-[#11111160] first-of-type:after:to-transparent md:after:block md:first-of-type:sticky md:first-of-type:before:block md:first-of-type:after:content-['']":
            stickFirstItem && isOverflowing && variant === "nested",
          "last:before:bg-sys-color-background-light md:last:bg-sys-color-background-light after:hidden last:right-8 last:z-10 last:before:absolute last:before:-right-8 last:before:top-0 last:before:hidden last:before:h-full last:before:w-8 last:after:absolute last:after:-left-20 last:after:top-0 last:after:h-full last:after:w-20 last:after:bg-gradient-to-r last:after:from-transparent last:after:to-[#11111160] md:after:block md:last:sticky md:last:before:block md:last:after:content-['']":
            stickLastItem && isOverflowing && variant === "nested",
          "first-of-type:before:rounded-l-16 first-of-type:before:bg-sys-color-background-card md:first-of-type:bg-sys-color-background-card after:hidden first-of-type:left-8 first-of-type:z-10 first-of-type:before:absolute first-of-type:before:-left-8 first-of-type:before:top-0 first-of-type:before:hidden first-of-type:before:h-full first-of-type:before:w-8 first-of-type:after:absolute first-of-type:after:-right-20 first-of-type:after:top-0 first-of-type:after:h-full first-of-type:after:w-20 first-of-type:after:bg-gradient-to-r first-of-type:after:from-[#16161b60] first-of-type:after:to-transparent md:after:block md:first-of-type:sticky md:first-of-type:before:block md:first-of-type:after:content-['']":
            stickFirstItem && isOverflowing && variant === "separated",
          "last-of-type:before:rounded-r-16 last-of-type:before:bg-sys-color-background-card md:last-of-type:bg-sys-color-background-card after:hidden last-of-type:right-8 last-of-type:z-10 last-of-type:before:absolute last-of-type:before:-right-8 last-of-type:before:top-0 last-of-type:before:hidden last-of-type:before:h-full last-of-type:before:w-8 last-of-type:after:absolute last-of-type:after:-left-20 last-of-type:after:top-0 last-of-type:after:h-full last-of-type:after:w-20 last-of-type:after:bg-gradient-to-r last-of-type:after:from-transparent last-of-type:after:to-[#16161b60] md:after:block md:last-of-type:sticky md:last-of-type:before:block md:last-of-type:after:content-['']":
            stickLastItem && isOverflowing && variant === "separated",

          // Align last item to end
          "last:ml-auto last:w-max last:justify-self-end":
            lastItemAlignEnd && !stickLastItem,

          // Default Table Reset
          "w-full px-12": tableType === "default",
        },
        className
      )}
    >
      {showLabelsOnMobile &&
        !hideLabelOnMobile &&
        tableType === "stacked" &&
        headers && (
          <span className="text-sys-color-text-mute md:hidden">
            {index !== undefined && headers[index]}
          </span>
        )}
      <div
        className={classNames(
          "gap-x-apollo-6 flex items-center md:w-full",
          fullWidthMobile && "!w-full"
        )}
      >
        {leftIcon && (
          <Icon
            name={leftIcon}
            size={leftIconSize}
            className={classNames("flex-shrink-0", leftIconClassName)}
          />
        )}
        {value && <span className="max-w-[150px] truncate">{value}</span>}
        {children}
        {rightIcon &&
          !rightIconOnClick &&
          !rightIconOnMouseEnter &&
          !rightIconOnMouseLeave && (
            <Icon
              name={rightIcon}
              size={rightIconSize}
              className={classNames("flex-shrink-0", rightIconClassName)}
            />
          )}
        {rightIcon &&
          (rightIconOnClick ||
            rightIconOnMouseEnter ||
            rightIconOnMouseLeave) && (
            <button
              onClick={() => {
                rightIconOnClick?.();
                handleCopy();
              }}
              onMouseEnter={rightIconOnMouseEnter}
              onMouseLeave={rightIconOnMouseLeave}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  rightIconOnClick?.();
                  handleCopy();
                }
              }}
              className="hover:text-sys-color-text-primary relative transition"
            >
              <Tooltip
                isOpen={isCopied && showCopiedTooltip}
                className={copiedTooltipClassName}
                arrowPosition={isLastRow ? "bottom-middle" : "top-middle"}
              >
                Copied
              </Tooltip>
              <Icon
                name={rightIcon}
                size={rightIconSize}
                className={classNames(
                  "flex-shrink-0 transition",
                  rightIconClassName
                )}
              />
            </button>
          )}
        {showLockIcon && (
          <Icon
            name="Lock"
            size={18}
            className="text-sys-color-text-mute flex-shrink-0"
          />
        )}
      </div>
    </div>
  );
};

export default Table;
export { TableHeader, TableBody, TableRow, TableCell, MobileHeader };
