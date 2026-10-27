/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Chakra Petch"', 'Outfit', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        game: {
          void: '#070a13',       // Ultra-deep space blue-black (softer on retina than harsh pure #000)
          panel: '#0e1424',      // Glass card baseline
          surface: '#131b2e',    // Elevated component card
          elevated: '#1a243c',   // Interactive hover state
          border: 'rgba(56, 189, 248, 0.15)', // Faint cyan cyber grid line
          cyan: '#38bdf8',       // Primary tech accent
          teal: '#2dd4bf',       // Ingress / gateway
          emerald: '#34d399',    // High uptime / healthy SLA
          amber: '#fbbf24',      // Warning / cloud budget / star reward
          rose: '#f43f5e',       // Critical outage alert
          violet: '#a78bfa',     // AI / queue services
        }
      }
    },
  },
  plugins: [],
};
