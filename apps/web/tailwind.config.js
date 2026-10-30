/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        border: "var(--border)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)"
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)"
        },
        ring: "var(--ring)",
        mint: {
          50: '#f0fdf9',
          100: '#ccfbef',
          200: '#99f6df',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#00F5A0',
          signal: '#00F5A0',
          600: '#00d287',
          700: '#00a86b',
          800: '#065f46',
          900: '#064e3b',
          glow: 'rgba(0, 245, 160, 0.35)'
        },
        brand: {
          50: '#f0fdf9',
          100: '#ccfbef',
          400: '#2ee59d',
          500: '#00F5A0',
          600: '#00d287',
          700: '#00a86b',
          900: '#064e3b'
        },
        mst: {
          blue: '#2563eb',
          cyan: '#00F5A0',
          dark: '#070c18',
          card: '#0c1424',
          border: '#16233b'
        }
      }
    },
  },
  plugins: [],
}
