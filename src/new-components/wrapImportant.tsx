import { forwardRef } from "react";

/* eslint-disable react/display-name */
const wrapImportant = <P,>(Component: React.ComponentType<P>) => {
  const WrappedComponent = forwardRef<unknown, P>((props, ref) => (
    <div className="ds contents">
      <Component {...props} ref={ref} />
    </div>
  ));

  WrappedComponent.displayName = `${Component.displayName || Component.name || "Component"}`;

  return WrappedComponent;
};

export default wrapImportant;
