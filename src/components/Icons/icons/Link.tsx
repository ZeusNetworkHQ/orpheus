export interface IconProps {
  className?: string;
  size?: 18 | 14 | 12;
}

export default function LinkIcon({ className, size = 18 }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 18 18"
      className={className}
      fill="none"
    >
      <g clip-path="url(#clip0_1413_272)">
        <path
          d="M6.75 11.25L11.25 6.75"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.25 4.49999L8.59725 4.09799C9.3006 3.39473 10.2545 2.99969 11.2491 2.99976C12.2438 2.99983 13.1976 3.39501 13.9009 4.09836C14.6041 4.80171 14.9992 5.75563 14.9991 6.75025C14.999 7.74487 14.6039 8.69873 13.9005 9.40199L13.5 9.74999"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9.74998 13.5L9.45223 13.9005C8.74067 14.6041 7.78033 14.9988 6.77961 14.9988C5.77889 14.9988 4.81855 14.6041 4.10698 13.9005C3.75625 13.5537 3.47781 13.1408 3.28777 12.6856C3.09773 12.2304 2.99988 11.7421 2.99988 11.2489C2.99988 10.7556 3.09773 10.2673 3.28777 9.81214C3.47781 9.35698 3.75625 8.94405 4.10698 8.59725L4.49998 8.25"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_1413_272">
          <rect width="18" height="18" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
