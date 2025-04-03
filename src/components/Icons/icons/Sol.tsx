export interface IconProps {
  className?: string;
  size?: 18 | 14 | 12;
}
export default function SolIcon({ className, size = 18 }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 18 18"
      className={className}
      fill="none"
    >
      <g clipPath="url(#sol_svg__a)">
        <path fill="#000" d="M9 18A9 9 0 1 0 9 0a9 9 0 0 0 0 18" />
        <mask
          id="sol_svg__b"
          width={12}
          height={10}
          x={3}
          y={4}
          maskUnits="userSpaceOnUse"
          style={{
            maskType: "luminance",
          }}
        >
          <path fill="#fff" d="M14.4 4.275H3.6v9.45h10.8z" />
        </mask>
        <g mask="url(#sol_svg__b)">
          <path
            fill="url(#sol_svg__c)"
            fillRule="evenodd"
            d="M5.554 11.48a.36.36 0 0 1 .267-.118l8.248.007a.18.18 0 0 1 .134.304l-1.757 1.934a.36.36 0 0 1-.267.118l-8.248-.007a.182.182 0 0 1-.133-.303zm8.649-1.61a.18.18 0 0 1-.035.275.2.2 0 0 1-.1.03l-8.246.006a.36.36 0 0 1-.268-.118L3.798 8.128a.181.181 0 0 1 .133-.304l8.248-.006a.36.36 0 0 1 .267.118zM5.554 4.394a.36.36 0 0 1 .267-.118l8.248.007a.181.181 0 0 1 .134.303L12.446 6.52a.36.36 0 0 1-.267.118L3.93 6.631a.182.182 0 0 1-.133-.304z"
            clipRule="evenodd"
          />
        </g>
      </g>
      <defs>
        <linearGradient
          id="sol_svg__c"
          x1={4.637}
          x2={13.314}
          y1={13.95}
          y2={4.23}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset={0.08} stopColor="#9945FF" />
          <stop offset={0.3} stopColor="#8752F3" />
          <stop offset={0.5} stopColor="#5497D5" />
          <stop offset={0.6} stopColor="#43B4CA" />
          <stop offset={0.72} stopColor="#28E0B9" />
          <stop offset={0.97} stopColor="#19FB9B" />
        </linearGradient>
        <clipPath id="sol_svg__a">
          <path fill="#fff" d="M0 0h18v18H0z" />
        </clipPath>
      </defs>
    </svg>
  );
}
