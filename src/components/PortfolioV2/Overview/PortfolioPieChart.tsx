import classNames from "classnames";
import { motion } from "motion/react";

const PortfolioPieChart = ({ percentFilled }: { percentFilled: number }) => {
  const angleDegrees = percentFilled * 3.6;
  return (
    <motion.div
      initial={{ ["--percentFilled" as string]: "0deg" }}
      animate={{ ["--percentFilled" as string]: `${angleDegrees}deg` }}
      transition={{ duration: 1, ease: "easeInOut" }}
      className={classNames(
        "h-[180px] w-[180px] flex-shrink-0 rounded-full bg-[conic-gradient(#546CF1_var(--percentFilled)_,transparent_0)] shadow-[inset_0px_0px_40px_#C7D9FE] backdrop-blur-[50px]",
        // Golden Glow
        "after:shadow-[0px_0px_20px_rgba(235, 237, 247,0.3)] after:absolute after:inset-0 after:h-full after:w-full after:rounded-full after:content-['']"
        //
      )}
    ></motion.div>
  );
};

export default PortfolioPieChart;
