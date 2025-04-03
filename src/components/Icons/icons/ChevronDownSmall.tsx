export interface IconProps {
  className?: string;
  size?: 18 | 16 | 14 | 12;
}
export default function ChevronDownSmallIcon({
  className,
  size = 16,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 17 16"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11.8259 6.16667L8.20636 9.78619C8.18032 9.81223 8.13811 9.81223 8.11208 9.78619L4.49255 6.16667"
        stroke="currentColor"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
      />
    </svg>
  );
}
