import styles from "./styles.module.scss";

type SkeletonProps = {
  height?: string;
  width?: string;
  radius?: string;
  classes?: string;
};
export default function Skeleton({
  height = "32px",
  width = "100px",
  radius = "8px",
  classes,
}: SkeletonProps) {
  return (
    <div
      className={`${styles.skeleton} ${classes}`}
      style={{ height: height, width: width, borderRadius: radius }}
    ></div>
  );
}
