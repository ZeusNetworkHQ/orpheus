export interface IconProps {
  className?: string;
  size?: 18 | 14 | 12;
}
export default function InfoSmallIcon({ className, size = 12 }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 12 12"
      className={className}
      fill="none"
    >
      <g clipPath="url(#info_svg__a)">
        <path
          fill="currentColor"
          d="M6 0C2.691 0 0 2.691 0 6s2.691 6 6 6 6-2.691 6-6-2.691-6-6-6m.75 8.5a.75.75 0 0 1-1.5 0v-3a.75.75 0 0 1 1.5 0zM6 4a.877.877 0 0 1-.875-.875c0-.482.393-.875.875-.875s.875.393.875.875A.877.877 0 0 1 6 4"
        />
      </g>
      <defs>
        <clipPath id="info_svg__a">
          <path fill="#fff" d="M0 0h12v12H0z" />
        </clipPath>
      </defs>
    </svg>
  );
}
