import styles from "./styles.module.scss";

export default function Divider({ className = "" }) {
  return (
    <div className={`${styles.divider} ${className}`}>
      <div className={styles.divider__line}></div>
      <div className={styles.divider__line}></div>
    </div>
  );
}
