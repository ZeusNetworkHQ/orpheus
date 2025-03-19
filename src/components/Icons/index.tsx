import React from "react";

import { IconComponents, IconName } from "./icons";

export interface IconProps {
  /** Name of Icon */
  name: IconName;
  /** Size of Icon */
  size?: 18 | 14 | 12;
  /** Custom Classnames / Icon Color */
  className?: string;
}

const Icon = ({ className, name, size }: IconProps) => {
  const IconComponent = IconComponents[name];

  if (!IconComponent) {
    console.warn(`Icon ${name} not found`);
    return null;
  }

  return <IconComponent size={size} className={className} />;
};

export default Icon;
