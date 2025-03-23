/* eslint-disable react/display-name */
type CommonProps = React.HTMLAttributes<HTMLElement>;

const wrapImportant = <P extends object>(
  Component: React.ComponentType<P & CommonProps>
) => {
  const WrappedComponent = (props: P & CommonProps) => (
    <div className="ds contents">
      <Component {...props} />
    </div>
  );

  WrappedComponent.displayName = `${Component.displayName || Component.name || "Component"}`;

  return WrappedComponent;
};

export default wrapImportant;
