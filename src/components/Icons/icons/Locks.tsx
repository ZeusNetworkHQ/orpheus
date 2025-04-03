export interface IconProps {
  className?: string;
  size?: 18 | 14 | 12;
}
export default function LocksIcon({ className, size = 18 }: IconProps) {
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
        d="M6.111 8.333V5.444a2.889 2.889 0 1 1 5.778 0v2.89M9 11.444v.89"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
        d="M12.333 8.333H5.666c-.981 0-1.777.796-1.777 1.778v3.556c0 .982.796 1.777 1.777 1.777h6.667c.982 0 1.778-.796 1.778-1.777V10.11c0-.982-.796-1.778-1.778-1.778Z"
      />
    </svg>
  );
}
