export interface IconProps {
  className?: string;
  size?: 18 | 14 | 12;
}
export default function StakeIcon({ className, size = 18 }: IconProps) {
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
        d="M3.75 2.75h9.5a2 2 0 0 1 2 2v9.5"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
        d="M4.74 7.75h5.51v5.51M10.25 7.75l-7.5 7.5"
      />
    </svg>
  );
}
