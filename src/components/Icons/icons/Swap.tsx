export interface IconProps {
  className?: string;
  size?: 18 | 14 | 12;
}
export default function SwapIcon({ className, size = 18 }: IconProps) {
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
        d="M4.46952 3H11.6513C13.1575 3 14.3786 4.22104 14.3786 5.72727L14.3029 9.86477M11.5604 7.36365L13.902 9.70523C14.115 9.91824 14.4603 9.91824 14.6733 9.70522L17.0149 7.36365M7.19673 10.1818L4.85515 7.84025C4.64214 7.62723 4.29678 7.62723 4.08377 7.84025L1.74219 10.1818M13.7422 15L7.10586 15C5.59963 15 4.37859 13.6192 4.37859 12.113L4.37859 7.84025"
        strokeWidth="1.5"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        stroke="currentColor"
      />
    </svg>
  );
}
