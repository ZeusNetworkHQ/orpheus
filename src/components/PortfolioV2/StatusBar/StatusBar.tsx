import classNames from "classnames";
import { motion } from "framer-motion";

interface StatusBarProps {
  statusItems: {
    status: "not-started" | "complete" | "pending";
    label: string;
    subLabel?: string;
  }[];
}

export default function StatusBar({ statusItems }: StatusBarProps) {
  return (
    <div className="gap-x-apollo-6 flex w-full items-start">
      {statusItems.map((item, index) => (
        <div className="flex w-full flex-col gap-y-16" key={index}>
          <div className="bg-ref-palette-grey-50a flex items-center rounded-full p-[2px]">
            {item.status === "pending" ? (
              <motion.div
                className="h-apollo-6 bg-apollo-brand-primary-blue rounded-full shadow-[inset_0px_2px_4px_#FFA794]"
                animate={{
                  width: ["0%", "50%"],
                }}
                transition={{
                  duration: 1.5,
                }}
              />
            ) : (
              <div
                className={classNames("h-apollo-6 rounded-full", {
                  "bg-apollo-brand-primary-blue w-full shadow-[inset_0px_2px_4px_#FFA794]":
                    item.status === "complete",
                })}
              />
            )}
          </div>
          <div
            className={classNames(
              "flex w-full flex-col items-center justify-center gap-y-0 text-center",
              {
                "opacity-30": item.status === "not-started",
                "text-sys-color-text-primary": item.status === "pending",
              }
            )}
          >
            <span className="body-body1-medium">{item.label}</span>
            <span className="caption-caption text-sys-color-text-mute">
              {item.subLabel}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
