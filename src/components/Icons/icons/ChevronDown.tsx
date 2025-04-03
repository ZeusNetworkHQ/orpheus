export interface IconProps {
  className?: string;
  size?: 18 | 14 | 12;
}
export default function ChevronDownIcon({ className, size = 18 }: IconProps) {
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
        d="m3 6.5 6 6 6-6"
      />
    </svg>
  );
}
