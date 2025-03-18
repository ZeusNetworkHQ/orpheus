import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/new-components/**/*.{ts,tsx}",
    "./src/stories/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@zeus-network/design-system/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/Widgets/MintWidget/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          apollo: "#FF6746",
          apolloSecondary: "#FF7B5F",
          apolloHovered: "#FF7D61",
          apolloSuccess: "#5FFF82",
          toastSuccess: "#5FFF82",
          toastWarning: "#FFB546",
          toastError: "#FF4646",
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        shade: {
          primary: "#F1F0F3",
          secondary: "#C5C5D1",
          mute: "#8B8A9E",
          cardLight: "#2C2C36",
          card: "#202027",
          foreground: "#27272D",
          background: "#16161B",
          divider: "#0F0F12",
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        error: "inset 0px 0px 16px 0px rgba(236,70,100,0.25)",
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require("@tailwindcss/typography"), require("tailwindcss-animate")],
};

export default config;
