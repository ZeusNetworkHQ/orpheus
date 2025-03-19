import classNames from "classnames";
import { AnimatePresence, motion } from "motion/react";
import React from "react";

export interface TooltipProps {
  /** Is the Tooltip Open */
  isOpen?: boolean;
  /** Tooltip Inner Content */
  children: React.ReactNode;
  /** Width of Tooltip */
  width?: number;
  /** Arrow Position */
  arrowPosition?:
    | "bottom-left"
    | "bottom-middle"
    | "bottom-right"
    | "top-left"
    | "top-middle"
    | "top-right"
    | "left-top"
    | "left-middle"
    | "left-bottom"
    | "right-top"
    | "right-middle"
    | "right-bottom";
  /** Should Tooltip animate in and out */
  shouldAnimate?: boolean;
  /** Custom classNames */
  className?: string;
  /** Tooltip Theme */
  theme?: "dark" | "dark-alt";
}

export default function Tooltip({
  children = "This is example content for a multi-line tooltip component.",
  width = 300,
  arrowPosition = "top-middle",
  shouldAnimate = true,
  isOpen = false,
  className,
  theme = "dark",
}: TooltipProps) {
  const animations = shouldAnimate && {
    initial: { opacity: 0.5, scale: 0.95 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.1, ease: "easeOut" },
    },
    exit: { opacity: 0, scale: 0.95 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={classNames(
            "gradient-border max-w-screen rounded-8 paragraph-paragraph2 text-sys-color-text-secondary absolute !transform px-12 py-8",
            {
              // Themes
              "bg-sys-color-tooltip-dark before:from-ref-palette-cold-grey-80a before:to-ref-palette-cold-grey-80a":
                theme === "dark",
              "bg-sys-color-background-normal before:from-ref-palette-cold-grey-80a before:to-ref-palette-cold-grey-80a":
                theme === "dark-alt",
              // Top positions
              "top-[calc(100%+6px)]": arrowPosition.startsWith("top"),
              "-left-4 top-[calc(100%+6px)]": arrowPosition === "top-left",
              "left-1/2 top-[calc(100%+6px)] -translate-x-1/2":
                arrowPosition === "top-middle",
              "-right-4 top-[calc(100%+6px)]": arrowPosition === "top-right",

              // Bottom positions
              "bottom-[calc(100%+6px)]": arrowPosition.startsWith("bottom"),
              "-left-4 bottom-[calc(100%+6px)]":
                arrowPosition === "bottom-left",
              "bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2":
                arrowPosition === "bottom-middle",
              "-right-4 bottom-[calc(100%+6px)]":
                arrowPosition === "bottom-right",

              // Left positions
              "left-[calc(100%+12px)]": arrowPosition.startsWith("left"),
              "-top-4 left-[calc(100%+12px)]": arrowPosition === "left-top",
              "left-[calc(100%+12px)] top-1/2 -translate-y-1/2":
                arrowPosition === "left-middle",
              "-bottom-4 left-[calc(100%+12px)]":
                arrowPosition === "left-bottom",

              // Right positions
              "right-[calc(100%+12px)]": arrowPosition.startsWith("right"),
              "-top-4 right-[calc(100%+12px)]": arrowPosition === "right-top",
              "right-[calc(100%+12px)] top-1/2 -translate-y-1/2":
                arrowPosition === "right-middle",
              "-bottom-4 right-[calc(100%+12px)]":
                arrowPosition === "right-bottom",
            },
            className
          )}
          style={{ width: `${width}px` }}
          {...animations}
        >
          <div
            className={classNames(
              `before:w-apollo-10 before:h-apollo-10 after:w-apollo-10 after:h-apollo-10 absolute before:absolute before:-z-10 before:content-[""] after:absolute after:content-[""]`,
              {
                // Themes
                "after:bg-sys-color-tooltip-dark before:bg-ref-palette-cold-grey-80a":
                  theme === "dark",
                "after:bg-sys-color-background-normal before:bg-ref-palette-cold-grey-80a":
                  theme === "dark-alt",
                // Top Positions
                "before:left-16 before:top-[-18px] before:[clip-path:polygon(0_100%,100%_100%,50%_0)] after:-top-16 after:left-16 after:[clip-path:polygon(0_100%,100%_100%,50%_0)]":
                  arrowPosition === "top-left",

                "left-1/2 before:top-[-18px] before:-translate-x-1/2 before:[clip-path:polygon(0_100%,100%_100%,50%_0)] after:top-[-16px] after:-translate-x-1/2 after:[clip-path:polygon(0_100%,100%_100%,50%_0)]":
                  arrowPosition === "top-middle",

                "right-[26px] before:top-[-18px] before:[clip-path:polygon(0_100%,100%_100%,50%_0)] after:top-[-16px] after:[clip-path:polygon(0_100%,100%_100%,50%_0)]":
                  arrowPosition === "top-right",

                // Right Positions
                "right-0 top-[10px] before:right-[-9px] before:[clip-path:polygon(0_0,100%_50%,0_100%)] after:right-[-7px] after:[clip-path:polygon(0_0,100%_50%,0_100%)]":
                  arrowPosition === "right-top",

                "right-0 top-1/2 -translate-y-1/2 before:right-[-9px] before:-translate-y-1/2 before:[clip-path:polygon(0_0,100%_50%,0_100%)] after:right-[-7px] after:-translate-y-1/2 after:[clip-path:polygon(0_0,100%_50%,0_100%)]":
                  arrowPosition === "right-middle",

                "bottom-[20px] right-0 before:right-[-9px] before:[clip-path:polygon(0_0,100%_50%,0_100%)] after:right-[-7px] after:[clip-path:polygon(0_0,100%_50%,0_100%)]":
                  arrowPosition === "right-bottom",

                // Bottom Positions
                "bottom-0 left-[26px] before:bottom-[-9px] before:[clip-path:polygon(0_0,100%_0,50%_100%)] after:bottom-[-7px] after:[clip-path:polygon(0_0,100%_0,50%_100%)]":
                  arrowPosition === "bottom-left",

                "bottom-0 left-1/2 before:bottom-[-9px] before:-translate-x-1/2 before:[clip-path:polygon(0_0,100%_0,50%_100%)] after:bottom-[-7px] after:-translate-x-1/2 after:[clip-path:polygon(0_0,100%_0,50%_100%)]":
                  arrowPosition === "bottom-middle",

                "bottom-0 right-[26px] before:bottom-[-9px] before:[clip-path:polygon(0_0,100%_0,50%_100%)] after:bottom-[-7px] after:[clip-path:polygon(0_0,100%_0,50%_100%)]":
                  arrowPosition === "bottom-right",

                // Left Positions
                "top-[10px] before:left-[-22px] before:[clip-path:polygon(100%_0,0_50%,100%_100%)] after:left-[-20px] after:[clip-path:polygon(100%_0,0_50%,100%_100%)]":
                  arrowPosition === "left-top",

                "top-1/2 -translate-y-1/2 before:left-[-22px] before:-translate-y-1/2 before:[clip-path:polygon(100%_0,0_50%,100%_100%)] after:left-[-20px] after:-translate-y-1/2 after:[clip-path:polygon(100%_0,0_50%,100%_100%)]":
                  arrowPosition === "left-middle",

                "bottom-[20px] before:left-[-22px] before:[clip-path:polygon(100%_0,0_50%,100%_100%)] after:left-[-20px] after:[clip-path:polygon(100%_0,0_50%,100%_100%)]":
                  arrowPosition === "left-bottom",
              }
            )}
          ></div>
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
