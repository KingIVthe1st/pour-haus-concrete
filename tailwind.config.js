/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        black: "#0A0A0A",
        white: "#FAFAFA",
        gray: {
          dark: "#1A1A1A",
          mid: "#3A3A3A",
          light: "#8A8A8A",
        },
        concrete: "#B8B5AD",
        clay: "#964B00", // Atlanta red clay accent
        aggregate: "#6B5B4F", // Exposed aggregate tone
      },
      fontFamily: {
        display: ["Clash Display", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
        body: ["Satoshi", "sans-serif"],
      },
      fontSize: {
        hero: "clamp(6rem, 15vw, 18rem)",
        h1: "clamp(3rem, 8vw, 8rem)",
        h2: "clamp(2rem, 4vw, 4rem)",
        h3: "clamp(1.5rem, 2.5vw, 2.5rem)",
        body: "clamp(1rem, 1.2vw, 1.25rem)",
        small: "clamp(0.75rem, 0.9vw, 0.875rem)",
        label: "0.75rem",
      },
      letterSpacing: {
        tighter: "-0.04em",
        tight: "-0.02em",
        wide: "0.1em",
        ultra: "0.2em",
      },
      lineHeight: {
        tight: "0.9",
        snug: "1.1",
        relaxed: "1.6",
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
        128: "32rem",
      },
      transitionTimingFunction: {
        "expo-out": "cubic-bezier(0.16, 1, 0.3, 1)",
        "expo-in-out": "cubic-bezier(0.87, 0, 0.13, 1)",
      },
      animation: {
        grain: "grain 0.5s steps(10) infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        grain: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "10%": { transform: "translate(-5%, -10%)" },
          "20%": { transform: "translate(-15%, 5%)" },
          "30%": { transform: "translate(7%, -25%)" },
          "40%": { transform: "translate(-5%, 25%)" },
          "50%": { transform: "translate(-15%, 10%)" },
          "60%": { transform: "translate(15%, 0%)" },
          "70%": { transform: "translate(0%, 15%)" },
          "80%": { transform: "translate(3%, 35%)" },
          "90%": { transform: "translate(-10%, 10%)" },
        },
      },
    },
  },
  plugins: [],
};
