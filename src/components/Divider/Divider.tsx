import styles from "./styles.module.scss";

export default function Divider({ classes = "" }) {
  return (
    <div className={`${styles.divider} ${classes}`}>
      <div className={styles.divider__line}></div>
      <div className={styles.divider__line}></div>
    </div>
  );
}
