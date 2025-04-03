import classNames from "classnames";
import { motion } from "motion/react";

import Icon from "@/components/Icons";
import { IconName } from "@/components/Icons/icons";

import wrapImportant from "../wrapImportant";

export interface TabsProps {
  /** Active Tab Index */
  activeTab: number;
  /** Custom classNames */
  className?: string;
  /** Required for slide animation */
  layoutName?: string;
  /** Set Active Tab */
  setActiveTab?: (index: number) => void;
  /** Tabs */
  tabs: { label: string; disabled?: boolean; icon?: IconName }[];
  /** Tabs Type */
  type: "tabs" | "segmented" | "underline" | "timeline";
}

const Tabs = ({
  className,
  type = "tabs",
  activeTab = 0,
  tabs,
  layoutName,
  setActiveTab,
}: TabsProps) => {
  return (
    <div
      className={classNames(
        "flex flex-wrap items-center",
        {
          "w-max": type === "segmented" || type === "tabs",
          "w-full flex-nowrap justify-between sm:w-max sm:flex-wrap sm:justify-start":
            type === "timeline",
          // Segmented Styles
          "rounded-16 border-apollo-border-20 gap-x-8 border p-4":
            type === "segmented",
          "border-apollo-border-15 gap-x-4 rounded-full border p-4":
            type === "timeline",
          // Underline Styles
          "border-apollo-border-20 px-apollo-10 w-full gap-x-24 border-b":
            type === "underline",
        },
        className
      )}
    >
      {tabs.map((tab, index) => (
        <button
          key={index}
          onClick={() => !tab.disabled && setActiveTab?.(index)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              if (!tab.disabled) {
                setActiveTab?.(index);
              }
            }
          }}
          disabled={tab.disabled}
          className={classNames(
            "relative flex items-center gap-x-8 transition duration-200 ease-in-out hover:transition",
            className,
            {
              // Disabled styles
              "text-sys-color-text-mute cursor-default": tab.disabled,

              // Static Styles
              "text-sys-color-text-secondary":
                activeTab !== index && type === "tabs",

              // Timeline Styles
              "body-body2-semibold w-full items-center justify-center rounded-full px-12 py-[2px] sm:w-max":
                type === "timeline",
              "text-ref-palette-grey-60":
                activeTab === index && type === "timeline",
              "hover:bg-sys-color-text-mute/10 hover:text-sys-color-text-primary":
                !tab.disabled && type === "timeline" && activeTab !== index,

              // Default Tabs Styles
              "hover:!text-sys-color-text-primary":
                !tab.disabled && type === "tabs",
              "headline-headline5 disabled:opacity-40": type === "tabs",
              "text-sys-color-text-primary":
                !tab.disabled && activeTab === index && type === "tabs",

              // Segmented Styles
              "body-body1-medium rounded-12 px-16 py-8 disabled:opacity-40":
                type === "segmented",
              "hover:!text-sys-color-text-primary hover:transition":
                !tab.disabled && type === "segmented" && activeTab !== index,
              "text-apollo-brand-primary-blue hover:text-apollo-brand-secondary-blue":
                !tab.disabled && type === "segmented" && activeTab === index,

              // Underline Styles
              "headline-headline6 text-sys-color-text-primary px-8 pb-8 pt-4 disabled:opacity-40":
                type === "underline",
              "hover:text-sys-color-text-primary":
                !tab.disabled && type === "underline",
              "!text-sys-color-text-primary":
                !tab.disabled && activeTab === index && type === "underline",
            }
          )}
        >
          {tab.icon && (
            <Icon className="relative z-10" name={tab.icon as IconName} />
          )}
          <span className="relative z-10">{tab.label}</span>
          {activeTab === index && type === "segmented" && !tab.disabled && (
            <motion.div
              layoutId={layoutName}
              transition={{ duration: 0.2 }}
              className="rounded-12 bg-apollo-brand-primary-blue/5 absolute left-0 top-0 h-full w-full"
            ></motion.div>
          )}

          {activeTab === index && type === "underline" && !tab.disabled && (
            <motion.div
              layoutId={layoutName}
              transition={{ duration: 0.2 }}
              className="rounded-t-4 bg-apollo-brand-primary-blue absolute bottom-0 left-0 h-[3px] w-full"
            ></motion.div>
          )}

          {activeTab === index && type === "timeline" && !tab.disabled && (
            <motion.div
              layoutId={layoutName}
              transition={{ duration: 0.2 }}
              className="bg-ref-palette-cold-grey-20 absolute left-0 top-0 h-full w-full rounded-full"
            ></motion.div>
          )}
        </button>
      ))}
    </div>
  );
};

export default wrapImportant(Tabs);
