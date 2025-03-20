export interface IconProps {
  className?: string;
  size?: 18 | 14 | 12;
}
export default function ClockIcon({ className, size = 18 }: IconProps) {
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
        d="m10.885 10.786-2.696-.899V6.13m7.189 2.859a7.189 7.189 0 1 0-.962 3.594M13.406 8.2l1.797 1.797L17 8.2"
      />
    </svg>
  );
}
