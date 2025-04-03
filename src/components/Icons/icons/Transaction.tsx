export interface IconProps {
  className?: string;
  size?: 18 | 14 | 12;
}
export default function TransactionIcon({ className, size = 18 }: IconProps) {
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
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
        d="M4.2 1.7 1.7 4.2l2.5 2.5M1.7 4.2h5.5M13.7 11.2l2.5 2.5-2.5 2.5M16.2 13.7h-5.5"
      />
      <path
        fill="currentColor"
        d="M9 12.25a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
        d="M4.2 1.7 1.7 4.2l2.5 2.5M1.7 4.2h5.5"
      />
    </svg>
  );
}
