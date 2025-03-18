import styles from "./styles.module.scss";

type BadgeProps = {
  label: string;
  classes?: string;
  theme?: "primary" | "secondary" | "outline" | "fade";
  icon?: React.ReactNode;
};

export default function Badge({
  label,
  classes,
  theme = "secondary",
  icon,
}: BadgeProps) {
  const badgeClasses = `${styles.badge} ${styles[`badge--${theme}`]} ${classes}`;

  return (
    <div className={badgeClasses}>
      {icon && <span className={styles.badge__icon}>{icon}</span>}
      <div className={styles.badge__label}>{label}</div>
    </div>
  );
}
