import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  presets: [require("@zeus-network/design-system")],
  content: [
    "./src/new-components/**/*.{ts,tsx}",
    "./src/app/portfolio/**/*.{ts,tsx}",
    "./node_modules/@zeus-network/design-system/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/stories/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/Widgets/MintWidget/**/*.{ts,tsx}",
  ],
  theme: {},
  important: ".ds",
} satisfies Config;

export default config;
