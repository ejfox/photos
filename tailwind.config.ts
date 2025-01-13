import type { Config } from "tailwindcss";

export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    extend: {
      fontFamily: {
        fjalla: ["Fjalla One", "sans-serif"],
        mono: ["Fira Code", "monospace"],
        sans: ["Figtree", "sans-serif"],
      },
    },
  },
} satisfies Config;
