export interface IconProps {
  className?: string;
  size?: 18 | 14 | 12;
}
export default function DropdownSmallIcon({ className, size = 12 }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 12 12"
      className={className}
      fill="none"
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
        d="m3 4 3-3 3 3M3 8l3 3 3-3"
      />
    </svg>
  );
}
