import styles from "./styles.module.scss";

function Loader(): JSX.Element {
  return (
    <div className="absolute z-[9999] flex h-[calc(100dvh)] w-full items-center justify-center bg-shade-background bg-opacity-50 backdrop-blur-sm">
      <div className="flex flex-col items-center justify-center text-center">
        <div className={styles.globalLoader} />
        <div className="pt-4 text-base font-semibold text-shade-primary">
          Loading...
        </div>
      </div>
    </div>
  );
}

export default Loader;
