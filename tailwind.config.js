/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // L'Air du temps — loud, electric, internet-native. Hot magenta + cyan on near-black.
        void: {
          DEFAULT: "#0a0612",
          soft: "#120a1f",
          card: "#170d29",
          line: "#2a1b45",
        },
        magenta: {
          DEFAULT: "#ff2d9b",
          hot: "#ff5cb0",
          deep: "#c2186f",
        },
        cyan: {
          DEFAULT: "#22e3ff",
          hot: "#6ff0ff",
          deep: "#15a8c2",
        },
        lime: "#caff3f",
        amber: "#ffb02e",
        cloud: "#f3ecff",
        muted: "#a596c4",
        // lifecycle stage badges
        stage: {
          rising: "#caff3f",
          peak: "#ff2d9b",
          fading: "#ffb02e",
          over: "#7a6b96",
        },
      },
      fontFamily: {
        display: ['"Archivo Black"', "system-ui", "sans-serif"],
        sans: ['"Space Grotesk"', "system-ui", "sans-serif"],
        mono: ['"Space Mono"', "ui-monospace", "monospace"],
      },
      boxShadow: {
        neon: "0 0 0 1px rgba(255,45,155,0.4), 0 0 24px -4px rgba(255,45,155,0.5)",
        cyan: "0 0 0 1px rgba(34,227,255,0.4), 0 0 24px -4px rgba(34,227,255,0.5)",
        lift: "0 10px 40px -12px rgba(0,0,0,0.8)",
      },
      keyframes: {
        riseIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        sweep: {
          "0%": { transform: "translateX(-120%)" },
          "100%": { transform: "translateX(120%)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.2" },
        },
      },
      animation: {
        riseIn: "riseIn 0.45s cubic-bezier(0.2,0.7,0.2,1) both",
        pulseGlow: "pulseGlow 1.6s ease-in-out infinite",
        sweep: "sweep 1.4s ease-in-out infinite",
        marquee: "marquee 32s linear infinite",
        blink: "blink 1s steps(2) infinite",
      },
    },
  },
  plugins: [],
};
