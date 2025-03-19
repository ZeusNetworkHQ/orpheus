export interface IconProps {
  className?: string;
  size?: 18 | 14 | 12;
}
export default function SolanaIcon({ className, size = 18 }: IconProps) {
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
        fill="url(#Solana_svg__a)"
        d="m16.918 12.75-2.642 2.573a.6.6 0 0 1-.204.13.7.7 0 0 1-.244.047H1.307a.33.33 0 0 1-.169-.046.3.3 0 0 1-.113-.122.26.26 0 0 1-.02-.158.27.27 0 0 1 .077-.143l2.644-2.573a.6.6 0 0 1 .203-.13.7.7 0 0 1 .244-.047h12.52q.091 0 .168.046t.114.121q.035.076.02.159a.27.27 0 0 1-.077.143m-2.642-5.182a.6.6 0 0 0-.204-.131.7.7 0 0 0-.244-.047H1.307a.33.33 0 0 0-.169.046.3.3 0 0 0-.113.122.26.26 0 0 0-.02.158.27.27 0 0 0 .077.143l2.644 2.573q.087.084.203.131.117.046.244.046h12.52q.091 0 .168-.045.077-.046.114-.122a.26.26 0 0 0 .02-.158.27.27 0 0 0-.077-.143zM1.306 5.719h12.522a.7.7 0 0 0 .244-.046.6.6 0 0 0 .204-.131l2.642-2.573a.27.27 0 0 0 .078-.143.26.26 0 0 0-.021-.158.3.3 0 0 0-.114-.122.33.33 0 0 0-.168-.046H4.173a.7.7 0 0 0-.244.046.6.6 0 0 0-.203.131L1.083 5.25a.27.27 0 0 0-.078.143.26.26 0 0 0 .021.158q.037.076.113.122a.33.33 0 0 0 .168.046"
      />
      <defs>
        <linearGradient
          id="Solana_svg__a"
          x1={2.351}
          x2={14.09}
          y1={15.81}
          y2={1.242}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset={0.08} stopColor="#9945FF" />
          <stop offset={0.3} stopColor="#8752F3" />
          <stop offset={0.5} stopColor="#5497D5" />
          <stop offset={0.6} stopColor="#43B4CA" />
          <stop offset={0.72} stopColor="#28E0B9" />
          <stop offset={0.97} stopColor="#19FB9B" />
        </linearGradient>
      </defs>
    </svg>
  );
}
