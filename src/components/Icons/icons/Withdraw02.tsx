export interface IconProps {
  className?: string;
  size?: 18 | 14 | 12;
}
export default function Withdraw02Icon({ className, size = 18 }: IconProps) {
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
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
        d="M4.875 9a3.375 3.375 0 0 1 0-6.75h8.25a3.375 3.375 0 1 1 0 6.75"
      />
      <path
        stroke="currentColor"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
        d="M4.5 7a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v6.5a3 3 0 0 1-3 3h-3a3 3 0 0 1-3-3z"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
        d="M10.875 11.625 9 13.125m0 0-1.875-1.5M9 13.125V9"
      />
    </svg>
  );
}
