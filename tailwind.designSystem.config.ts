import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  content: [
    "./src/app/portfolio/**/*.{ts,tsx}",
    "./src/stories/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/Widgets/MintWidget/**/*.{ts,tsx}",
  ],
  theme: {},
  important: ".ds",
} satisfies Config;

export default config;
