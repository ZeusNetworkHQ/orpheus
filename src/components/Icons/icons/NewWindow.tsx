export interface IconProps {
  className?: string;
  size?: 18 | 14 | 12;
}
export default function NewWindowIcon({ className, size = 18 }: IconProps) {
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
        d="M14.5002 3.49976L7.5 10M9.8574 3H14.4288C14.7444 3 15.0003 3.25584 15.0003 3.57143V8.14287M6.42827 5.2857H4.71398C3.76721 5.2857 2.99969 6.05321 2.99969 6.99999V13.2857C2.99969 14.2325 3.76721 15 4.71398 15H11.5711C12.5179 15 13.2854 14.2325 13.2854 13.2857V12.1429"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
