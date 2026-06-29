import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Neutrals flip between light/dark via CSS vars in globals.css.
        cream: "rgb(var(--bg) / <alpha-value>)", // page background
        sheet: "rgb(var(--sheet) / <alpha-value>)", // bottom-sheet surface
        surface: "rgb(var(--surface) / <alpha-value>)", // cards / inputs
        ink: "rgb(var(--fg) / <alpha-value>)", // text + subtle tints
        // Accents stay constant — they read well on both backgrounds.
        clay: "#e9624a",
        sage: "#6f9b73",
        sun: "#e7a93c",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
