export interface IconProps {
  className?: string;
  size?: 18 | 14 | 12;
}

export default function DoubleRightIcon({ className, size = 18 }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 18 18"
      className={className}
      fill="none"
    >
      <path
        d="M9.875 4.875L13.947 8.94697C13.9763 8.97626 13.9763 9.02374 13.947 9.05303L9.875 13.125"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M5 4.875L9.07197 8.94697C9.10126 8.97626 9.10126 9.02374 9.07197 9.05303L5 13.125"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
