export interface IconProps {
  className?: string;
  size?: 18 | 14 | 12;
}
export default function ProcessingIcon({ className, size = 18 }: IconProps) {
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
        d="M4.208 7.567a5 5 0 0 0 8.838 4.37m-8.838-4.37-2 2m2-2 2 2m-1.11-3.695a5 5 0 0 1 8.734 4.416m0 0-2-2m2 2 2-2"
      />
    </svg>
  );
}
